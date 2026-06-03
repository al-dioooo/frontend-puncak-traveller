import { setAuthCookie } from "@/lib/auth-cookie";
import { buildBackendAuthUrl } from "@/lib/server-auth-api";
import { NextRequest, NextResponse } from "next/server";

const AUTH_TIMEOUT_MS = 8000;

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AUTH_TIMEOUT_MS);

  try {
    const response = await fetch(buildBackendAuthUrl("register"), {
      body: JSON.stringify(payload),
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
      signal: controller.signal,
    });

    const data = await response.json().catch(() => ({
      message: response.ok
        ? "Account created successfully."
        : "Unable to create this account.",
    }));

    if (response.ok && typeof data.token === "string") {
      await setAuthCookie(data.token);
      delete data.token;
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    const message =
      error instanceof Error && error.name === "AbortError"
        ? "The auth service took too long to respond."
        : "The auth service is not reachable right now.";

    return NextResponse.json({ message }, { status: 503 });
  } finally {
    clearTimeout(timeout);
  }
}
