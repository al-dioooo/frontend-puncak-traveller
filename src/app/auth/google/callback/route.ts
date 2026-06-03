import { setAuthCookie } from "@/lib/auth-cookie";
import { buildBackendAuthUrl } from "@/lib/server-auth-api";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const returnTo = safeReturnTo(request.nextUrl.searchParams.get("return_to"));

  if (!code) {
    return NextResponse.redirect(new URL(`/login?return_to=${encodeURIComponent(returnTo)}`, request.url));
  }

  const response = await fetch(buildBackendAuthUrl("googleExchange"), {
    body: JSON.stringify({ code }),
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || typeof payload.token !== "string") {
    return NextResponse.redirect(new URL(`/login?return_to=${encodeURIComponent(returnTo)}`, request.url));
  }

  await setAuthCookie(payload.token);

  return NextResponse.redirect(new URL(returnTo, request.url));
}

function safeReturnTo(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/account";
  }

  return value;
}
