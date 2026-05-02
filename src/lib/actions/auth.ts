"use server";

import { verifyPassword, createToken, setAuthCookie, clearAuthCookie } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function loginAction(
  _prevState: { error?: string } | null,
  formData: FormData
) {
  const password = formData.get("password") as string;
  if (!password) {
    return { error: "Password is required" };
  }

  const valid = await verifyPassword(password);
  if (!valid) {
    return { error: "Invalid password" };
  }

  const token = await createToken();
  await setAuthCookie(token);
  redirect("/admin");
}

export async function logoutAction() {
  await clearAuthCookie();
  redirect("/admin/login");
}
