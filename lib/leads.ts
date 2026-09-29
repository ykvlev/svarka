import { getDatabase } from "./db";

export const LEAD_STATUSES = ["new", "in_progress", "done", "spam"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "Новая",
  in_progress: "В работе",
  done: "Завершена",
  spam: "Спам",
};

export type NewLead = {
  name: string;
  phone: string;
  social: string;
  method: string;
  rider: string;
  size: string;
  color: string;
  comment: string;
  sourceIp: string;
  userAgent: string;
};

export type Lead = NewLead & {
  id: number;
  createdAt: string;
  status: LeadStatus;
  telegramStatus: string;
};

type LeadRow = {
  id: string | number;
  created_at: Date | string;
  name: string;
  phone: string;
  social: string;
  method: string;
  rider: string;
  size: string;
  color: string;
  comment: string;
  status: string;
  source_ip: string;
  user_agent: string;
  telegram_status: string;
};

const COLUMNS = `id, created_at, name, phone, social, method, rider, size, color, comment, status, source_ip, user_agent, telegram_status`;

export function isLeadStatus(value: string): value is LeadStatus {
  return (LEAD_STATUSES as readonly string[]).includes(value);
}

function toLead(row: LeadRow): Lead {
  return {
    id: Number(row.id),
    createdAt: new Date(row.created_at).toISOString(),
    name: row.name,
    phone: row.phone,
    social: row.social ?? "",
    method: row.method,
    rider: row.rider ?? "",
    size: row.size ?? "",
    color: row.color ?? "",
    comment: row.comment ?? "",
    status: isLeadStatus(row.status) ? row.status : "new",
    sourceIp: row.source_ip ?? "",
    userAgent: row.user_agent ?? "",
    telegramStatus: row.telegram_status ?? "pending",
  };
}

/** Returns the stored lead id, or null when no database is configured. */
export async function saveLead(lead: NewLead): Promise<number | null> {
  const db = await getDatabase();
  if (!db) return null;
  const rows = await db.query<{ id: string | number }>(
    `INSERT INTO leads (name, phone, social, method, rider, size, color, comment, source_ip, user_agent)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING id`,
    [
      lead.name,
      lead.phone,
      lead.social,
      lead.method,
      lead.rider,
      lead.size,
      lead.color,
      lead.comment,
      lead.sourceIp,
      lead.userAgent,
    ],
  );
  return Number(rows[0]?.id ?? 0) || null;
}

export async function markTelegramStatus(
  id: number,
  status: "sent" | "failed" | "skipped",
): Promise<void> {
  const db = await getDatabase();
  if (!db) return;
  await db.query(`UPDATE leads SET telegram_status = $2 WHERE id = $1`, [id, status]);
}

export async function listLeads(limit = 200): Promise<Lead[]> {
  const db = await getDatabase();
  if (!db) return [];
  const rows = await db.query<LeadRow>(
    `SELECT ${COLUMNS} FROM leads ORDER BY created_at DESC, id DESC LIMIT $1`,
    [limit],
  );
  return rows.map(toLead);
}

export async function setLeadStatus(id: number, status: LeadStatus): Promise<void> {
  const db = await getDatabase();
  if (!db) throw new Error("database unavailable");
  await db.query(`UPDATE leads SET status = $2 WHERE id = $1`, [id, status]);
}

export async function countRecentLeadsByIp(sourceIp: string, seconds: number): Promise<number> {
  const db = await getDatabase();
  if (!db) return 0;
  const rows = await db.query<{ count: string }>(
    `SELECT count(*)::text AS count FROM leads
      WHERE source_ip = $1 AND created_at > now() - ($2 || ' seconds')::interval`,
    [sourceIp, String(seconds)],
  );
  return Number(rows[0]?.count ?? 0);
}

/** Lead counts per status, used by the admin header. */
export async function leadCountsByStatus(): Promise<Record<string, number>> {
  const db = await getDatabase();
  if (!db) return {};
  const rows = await db.query<{ status: string; count: string }>(
    `SELECT status, count(*)::text AS count FROM leads GROUP BY status`,
  );
  return Object.fromEntries(rows.map((row) => [row.status, Number(row.count)]));
}
