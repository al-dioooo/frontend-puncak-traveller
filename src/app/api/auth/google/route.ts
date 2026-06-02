import { buildBackendAuthUrl } from "@/lib/server-auth-api";
import { NextRequest, NextResponse } from "next/server";

export function GET(request: NextRequest) {
  const returnTo = request.nextUrl.searchParams.get("return_to") ?? "/account";
  const redirectUrl = buildBackendAuthUrl("googleRedirect", {
    return_to: returnTo,
  });

  return NextResponse.redirect(redirectUrl);
}
