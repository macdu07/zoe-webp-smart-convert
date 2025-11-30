"use server";

import { cookies } from "next/headers";
import { encrypt } from "@/lib/auth";
import { redirect } from "next/navigation";

const ACCESS_KEY = process.env.ACCESS_KEY || process.env.NEXT_PUBLIC_ACCESS_KEY;

export async function loginAction(formData: FormData) {
  const accessKey = formData.get("accessKey") as string;

  if (accessKey === ACCESS_KEY) {
    // Create the session
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 1 week
    const session = await encrypt({ user: "authenticated", expires });

    const cookieStore = await cookies();
    cookieStore.set("session", session, { expires, httpOnly: true });

    return { success: true };
  }

  return { success: false, error: "Clave de acceso incorrecta" };
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  redirect("/login");
}
