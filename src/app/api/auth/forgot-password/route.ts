import { buildBackendAuthUrl } from "@/lib/server-auth-api";
import { NextRequest, NextResponse } from "next/server";

const AUTH_TIMEOUT_MS = 8000;

export async function POST(request: NextRequest) {
  return forwardPasswordRequest(request, "forgotPassword");
}

async function forwardPasswordRequest(
  request: NextRequest,
  endpoint: "forgotPassword",
) {
  const payload = await request.json();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), AUTH_TIMEOUT_MS);

  try {
    const response = await fetch(buildBackendAuthUrl(endpoint), {
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
        ? "Request accepted."
        : "Unable to process this password reset request.",
    }));

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
