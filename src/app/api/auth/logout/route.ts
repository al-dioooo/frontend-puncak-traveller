import { clearAuthCookie, getAuthCookieToken } from "@/lib/auth-cookie";
import { buildBackendAuthUrl } from "@/lib/server-auth-api";
import { NextResponse } from "next/server";

export async function POST() {
  const token = await getAuthCookieToken();

  if (token) {
    await fetch(buildBackendAuthUrl("logout"), {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      method: "POST",
    }).catch(() => null);
  }

  await clearAuthCookie();

  return NextResponse.json(null, { status: 204 });
}
