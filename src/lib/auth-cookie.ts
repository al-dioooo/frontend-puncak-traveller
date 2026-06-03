import "server-only";

import { cookies } from "next/headers";

export const authCookieName = "puncak_session";

const cookieMaxAgeSeconds = 60 * 60 * 24 * 30;

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();

  cookieStore.set(authCookieName, token, {
    httpOnly: true,
    maxAge: cookieMaxAgeSeconds,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function getAuthCookieToken() {
  const cookieStore = await cookies();

  return cookieStore.get(authCookieName)?.value ?? null;
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();

  cookieStore.delete(authCookieName);
}
