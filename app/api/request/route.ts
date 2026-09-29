import { databaseConfigured } from "@/lib/db";
import { countRecentLeadsByIp, markTelegramStatus, saveLead } from "@/lib/leads";

/** Leads are rate limited per client for this many seconds. */
const RATE_LIMIT_SECONDS = 60;
/** Best-effort limiter for serverless instances without a database round trip. */
const recent = new Map<string, number>();

const reply = (message: string, status: number) => Response.json({ message }, { status });

const FIELD_LIMITS: Record<string, number> = {
  name: 80,
  phone: 25,
  social: 180,
  rider: 120,
  comment: 1500,
  size: 80,
  color: 20,
  method: 30,
  website: 200,
};

const METHODS = ["Звонок", "Telegram", "ВКонтакте"];
const COLORS = ["Серый", "Чёрный"];
const SIZES = ["1200 × 300 мм", "1300 × 300 мм", "Индивидуальный размер"];

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return (
    request.headers.get("x-real-ip") ??
    request.headers.get("cf-connecting-ip") ??
    "unknown"
  );
}

async function sendToTelegram(lead: Record<string, string>): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return false;

  const labels: Record<string, string> = {
    name: "Имя",
    phone: "Телефон",
    social: "Соцсеть",
    method: "Способ связи",
    rider: "Райдер",
    size: "Размер",
    color: "Цвет",
    comment: "Комментарий",
  };
  const text = [
    "Новая заявка — Кантователь",
    ...Object.entries(labels).map(([key, label]) => `${label}: ${lead[key] || "—"}`),
  ].join("\n");

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        link_preview_options: { is_disabled: true },
      }),
      // Stay inside the default serverless function limit (10 s on Vercel).
      signal: AbortSignal.timeout(7000),
    });
    const result = (await response.json()) as { ok?: boolean };
    return response.ok && result.ok === true;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) {
    return reply("Недопустимый источник запроса.", 403);
  }
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return reply("Некорректный формат заявки.", 415);
  }

  const raw = await request.text();
  if (raw.length > 8000) return reply("Слишком длинная заявка.", 413);

  let data: Record<string, unknown>;
  try {
    data = JSON.parse(raw);
  } catch {
    return reply("Некорректная заявка.", 400);
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return reply("Некорректная заявка.", 400);
  }

  for (const [key, max] of Object.entries(FIELD_LIMITS)) {
    if (data[key] !== undefined && (typeof data[key] !== "string" || data[key].length > max)) {
      return reply("Проверьте заполненные поля.", 400);
    }
  }

  const clean = (key: string) => String(data[key] ?? "").trim();

  // Honeypot: pretend success so bots do not learn anything from the response.
  if (clean("website")) return reply("Не удалось отправить заявку.", 400);

  const lead = {
    name: clean("name"),
    phone: clean("phone"),
    social: clean("social"),
    method: clean("method"),
    rider: clean("rider"),
    size: clean("size"),
    color: clean("color"),
    comment: clean("comment"),
  };

  if (
    !lead.name ||
    !/^\+?[0-9()\s-]{10,25}$/.test(lead.phone) ||
    lead.phone.replace(/\D/g, "").length < 10
  ) {
    return reply("Укажите имя и корректный номер телефона.", 400);
  }
  if (
    !METHODS.includes(lead.method) ||
    !COLORS.includes(lead.color) ||
    !SIZES.includes(lead.size)
  ) {
    return reply("Проверьте параметры заказа.", 400);
  }
  if (lead.method !== "Звонок" && !lead.social) {
    return reply("Укажите ссылку или ник, чтобы мы связались с вами выбранным способом.", 400);
  }

  const telegramConfigured = Boolean(
    process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID,
  );
  if (!databaseConfigured() && !telegramConfigured) {
    return reply(
      "Приём заявок через форму пока недоступен. Напишите Сергею в Telegram или позвоните: +7 906 203-60-89.",
      503,
    );
  }

  const sourceIp = clientIp(request);
  const now = Date.now();
  for (const [key, time] of recent) if (now - time > RATE_LIMIT_SECONDS * 1000) recent.delete(key);

  const alreadyStored = await countRecentLeadsByIp(sourceIp, RATE_LIMIT_SECONDS).catch(() => 0);
  if (recent.has(sourceIp) || alreadyStored > 0) {
    return reply("Подождите минуту перед повторной отправкой.", 429);
  }
  recent.set(sourceIp, now);

  let leadId: number | null = null;
  try {
    leadId = await saveLead({
      ...lead,
      sourceIp,
      userAgent: request.headers.get("user-agent") ?? "",
    });
  } catch (error) {
    console.error("[api/request] failed to store lead", error);
  }

  const delivered = telegramConfigured ? await sendToTelegram(lead) : false;
  if (leadId !== null) {
    const telegramStatus = delivered ? "sent" : telegramConfigured ? "failed" : "skipped";
    await markTelegramStatus(leadId, telegramStatus).catch((error) =>
      console.error("[api/request] failed to update telegram status", error),
    );
  }

  // The lead survives in the database even when Telegram is unavailable, so the
  // visitor still gets a positive answer in that case.
  if (leadId !== null) {
    return reply(
      delivered
        ? "Заявка отправлена. Сергей свяжется с вами выбранным способом."
        : "Заявка принята и сохранена. Сергей свяжется с вами выбранным способом.",
      200,
    );
  }
  if (delivered) {
    return reply("Заявка отправлена. Сергей свяжется с вами выбранным способом.", 200);
  }

  recent.delete(sourceIp);
  return reply("Не удалось отправить заявку. Позвоните Сергею: +7 906 203-60-89.", 502);
}
