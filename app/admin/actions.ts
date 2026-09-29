"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_COOKIE,
  ADMIN_COOKIE_OPTIONS,
  createSessionToken,
  passwordMatches,
  verifySessionToken,
} from "@/lib/admin-auth";
import { isLeadStatus, setLeadStatus } from "@/lib/leads";

export type LoginState = { error?: string };

export async function login(_state: LoginState, formData: FormData): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");
  if (!passwordMatches(password)) {
    return { error: "Неверный пароль." };
  }
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, createSessionToken(), ADMIN_COOKIE_OPTIONS);
  redirect("/admin");
}

export async function logout(): Promise<void> {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
  redirect("/admin");
}

export async function updateStatus(formData: FormData): Promise<void> {
  const jar = await cookies();
  if (!verifySessionToken(jar.get(ADMIN_COOKIE)?.value)) {
    throw new Error("Требуется вход в админку.");
  }
  const id = Number(formData.get("id"));
  const status = String(formData.get("status") ?? "");
  if (!Number.isInteger(id) || id <= 0 || !isLeadStatus(status)) return;
  await setLeadStatus(id, status);
  revalidatePath("/admin");
}
