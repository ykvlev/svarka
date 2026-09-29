/**
 * End-to-end smoke test for the lead form, the API route and the admin panel.
 *
 * Usage:
 *   1. npm run dev            (in another terminal)
 *   2. npm test               (reads ADMIN_PASSWORD from .env or the shell)
 *
 * Optional: SMOKE_BASE_URL=http://localhost:3000 to point at another server.
 * Set TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID to dummy values when testing so the
 * real Telegram bot is never called.
 */

import { createHmac, randomBytes } from "node:crypto";

const BASE = (process.env.SMOKE_BASE_URL ?? "http://localhost:3000").replace(/\/+$/, "");
const PASSWORD = process.env.ADMIN_PASSWORD ?? "";
const SIZE = "1200 × 300 мм";

const results = [];
function check(name, passed, detail = "") {
  results.push({ name, passed, detail });
  console.log(`${passed ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}

async function waitForServer(timeoutMs = 90_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(BASE, { redirect: "manual" });
      if (response.status < 500) return true;
    } catch {
      /* not up yet */
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  return false;
}

function adminCookie() {
  const issued = `${Date.now()}.${randomBytes(12).toString("hex")}`;
  const signature = createHmac("sha256", process.env.ADMIN_SECRET || PASSWORD)
    .update(issued)
    .digest("base64url");
  return `kant_admin=${issued}.${signature}`;
}

function leadBody(overrides = {}) {
  return JSON.stringify({
    name: "Тест Смоук",
    phone: "+7 999 123-45-67",
    social: "@smoke_test",
    method: "Telegram",
    rider: "Caiman",
    size: SIZE,
    color: "Серый",
    comment: "автотест, можно удалить",
    ...overrides,
  });
}

async function postLead(body, ip, extraHeaders = {}) {
  const response = await fetch(`${BASE}/api/request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: BASE,
      "x-forwarded-for": ip,
      ...extraHeaders,
    },
    body,
  });
  const text = await response.text();
  let message = "";
  try {
    message = JSON.parse(text).message ?? "";
  } catch {
    message = text.slice(0, 120);
  }
  return { status: response.status, message };
}

async function main() {
  if (!(await waitForServer())) {
    console.error(`Server at ${BASE} did not become ready.`);
    process.exit(1);
  }

  // --- Landing page -------------------------------------------------------
  const home = await fetch(BASE);
  const html = await home.text();
  check("GET / отвечает 200", home.status === 200, `status ${home.status}`);
  check("На странице есть заголовок", html.includes("Кантователь для садового") || html.includes("Кантователь"));
  check("JSON-LD Product присутствует", html.includes('"@type":"Product"'));
  check("Open Graph картинка подключена", html.includes("/og.png"));
  check("Canonical-ссылка есть", /rel="canonical"/.test(html));
  check("Метаданные robots индексируемые", /name="robots"/.test(html));

  // --- SEO files ----------------------------------------------------------
  const robots = await (await fetch(`${BASE}/robots.txt`)).text();
  check("robots.txt закрывает /admin", robots.includes("Disallow: /admin"));
  check("robots.txt ссылается на sitemap", robots.includes("Sitemap:"));

  const sitemap = await (await fetch(`${BASE}/sitemap.xml`)).text();
  check("sitemap.xml содержит <loc>", sitemap.includes("<loc>"));

  // --- API validation -----------------------------------------------------
  const wrongOrigin = await fetch(`${BASE}/api/request`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "https://evil.example" },
    body: leadBody(),
  });
  check("Чужой Origin отклоняется (403)", wrongOrigin.status === 403, `status ${wrongOrigin.status}`);

  const badPhone = await postLead(leadBody({ phone: "123" }), "203.0.113.11");
  check("Некорректный телефон отклоняется (400)", badPhone.status === 400, badPhone.message);

  const honeypot = await postLead(leadBody({ website: "spam" }), "203.0.113.12");
  check("Honeypot отклоняется (400)", honeypot.status === 400, honeypot.message);

  const noSocial = await postLead(leadBody({ method: "Telegram", social: "" }), "203.0.113.13");
  check("Telegram без ника отклоняется (400)", noSocial.status === 400, noSocial.message);

  // --- API happy path -----------------------------------------------------
  const ip = `198.51.100.${Math.floor(Math.random() * 200) + 1}`;
  const ok = await postLead(leadBody(), ip);
  check("Валидная заявка принимается (200)", ok.status === 200, ok.message);
  check(
    "Ответ подтверждает сохранение",
    /сохранена|отправлена/.test(ok.message),
    ok.message,
  );

  const repeated = await postLead(leadBody(), ip);
  check("Повтор в течение минуты ограничен (429)", repeated.status === 429, repeated.message);

  // --- Admin --------------------------------------------------------------
  const anonymous = await fetch(`${BASE}/admin`);
  const anonymousHtml = await anonymous.text();
  check("Админка требует пароль", anonymous.status === 200 && anonymousHtml.includes("Пароль"));
  check("Админка закрыта от индексации", /noindex/.test(anonymousHtml));

  if (!PASSWORD) {
    check("Проверка входа в админку", false, "ADMIN_PASSWORD не задан в окружении теста");
  } else {
    const authorised = await fetch(`${BASE}/admin`, {
      headers: { Cookie: adminCookie() },
    });
    const adminHtml = await authorised.text();
    check("Вход по валидной cookie работает", authorised.status === 200);
    check("В админке видна заявка", adminHtml.includes("Тест Смоук"), "ищем только что созданную заявку");
    check("В админке есть статусы", adminHtml.includes("В работе") && adminHtml.includes("Спам"));
    check("Ссылка на Telegram со статусом", adminHtml.includes("Telegram:"));

    const forged = await fetch(`${BASE}/admin`, {
      headers: { Cookie: "kant_admin=1700000000000.deadbeef.forged" },
    });
    const forgedHtml = await forged.text();
    check("Подделанная cookie не пускает", forgedHtml.includes("Пароль"));
  }

  const failed = results.filter((result) => !result.passed);
  console.log(`\n${results.length - failed.length}/${results.length} проверок пройдено`);
  if (failed.length) {
    console.log("Провалено:");
    for (const item of failed) console.log(`  - ${item.name}${item.detail ? ` (${item.detail})` : ""}`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
