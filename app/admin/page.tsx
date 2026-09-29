import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, adminConfigured, verifySessionToken } from "@/lib/admin-auth";
import { databaseMode } from "@/lib/db";
import { LEAD_STATUSES, LEAD_STATUS_LABELS, listLeads, type Lead } from "@/lib/leads";
import { logout, updateStatus } from "./actions";
import LoginForm from "./login-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Заявки",
  robots: { index: false, follow: false },
};

const dateFormat = new Intl.DateTimeFormat("ru-RU", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "Europe/Moscow",
});

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : dateFormat.format(date);
}

function StatusForm({ lead }: { lead: Lead }) {
  return (
    <form action={updateStatus} className="admin-status">
      <input type="hidden" name="id" value={lead.id} />
      <select name="status" defaultValue={lead.status} aria-label={`Статус заявки ${lead.id}`}>
        {LEAD_STATUSES.map((status) => (
          <option key={status} value={status}>
            {LEAD_STATUS_LABELS[status]}
          </option>
        ))}
      </select>
      <button type="submit">ОК</button>
    </form>
  );
}

function LeadCard({ lead }: { lead: Lead }) {
  const rows: Array<[string, string]> = [
    ["Способ связи", lead.method],
    ["Соцсеть", lead.social],
    ["Райдер", lead.rider],
    ["Размер", lead.size],
    ["Цвет", lead.color],
    ["Комментарий", lead.comment],
  ];

  return (
    <article className="admin-card">
      <header>
        <div>
          <strong>{lead.name}</strong>
          <a href={`tel:${lead.phone.replace(/[^+\d]/g, "")}`}>{lead.phone}</a>
        </div>
        <time dateTime={lead.createdAt}>{formatDate(lead.createdAt)}</time>
      </header>
      <dl>
        {rows
          .filter(([, value]) => value)
          .map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
      </dl>
      <footer>
        <StatusForm lead={lead} />
        <span className="small">
          Telegram: {lead.telegramStatus === "sent" ? "отправлено" : lead.telegramStatus === "failed" ? "ошибка" : "не отправлено"}
        </span>
      </footer>
    </article>
  );
}

export default async function AdminPage() {
  if (!adminConfigured()) {
    return (
      <main className="admin wrap">
        <h1>Заявки</h1>
        <p>
          Админка выключена: не задан <code>ADMIN_PASSWORD</code>. Добавьте переменную окружения и
          перезапустите приложение.
        </p>
      </main>
    );
  }

  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!verifySessionToken(token)) {
    return (
      <main className="admin wrap">
        <LoginForm />
      </main>
    );
  }

  const leads = await listLeads();
  const mode = databaseMode();
  const newCount = leads.filter((lead) => lead.status === "new").length;

  return (
    <main className="admin wrap">
      <header className="admin-head">
        <div>
          <h1>Заявки</h1>
          <p className="small">
            Всего: {leads.length} · Новых: {newCount} · База:{" "}
            {mode === "postgres" ? "Postgres" : mode === "pglite" ? "локальная (PGlite)" : "не настроена"}
          </p>
        </div>
        <div className="admin-actions">
          <Link className="ghost" href="/">
            На сайт
          </Link>
          <form action={logout}>
            <button className="ghost" type="submit">
              Выйти
            </button>
          </form>
        </div>
      </header>

      {leads.length === 0 ? (
        <p>Заявок пока нет.</p>
      ) : (
        <div className="admin-list">
          {leads.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </div>
      )}
    </main>
  );
}
