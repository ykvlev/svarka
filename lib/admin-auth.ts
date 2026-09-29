import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE = "kant_admin";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

/** Admin access is disabled until ADMIN_PASSWORD is set in the environment. */
export function adminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

function sessionSecret(): string {
  return process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD || "";
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function passwordMatches(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  return safeEqual(input, expected);
}

function sign(payload: string): string {
  return createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
}

export function createSessionToken(now = Date.now()): string {
  const issued = `${now}.${randomBytes(12).toString("hex")}`;
  return `${issued}.${sign(issued)}`;
}

export function verifySessionToken(token: string | undefined, now = Date.now()): boolean {
  if (!token || !adminConfigured()) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [issuedAt, nonce, signature] = parts;
  const issued = Number(issuedAt);
  if (!Number.isFinite(issued) || now - issued > SESSION_TTL_MS || issued > now + 60_000) return false;
  return safeEqual(signature, sign(`${issuedAt}.${nonce}`));
}

export const ADMIN_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_TTL_MS / 1000,
};
