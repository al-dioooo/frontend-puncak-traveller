import { NextRequest } from "next/server";
import { getAuthCookieToken } from "@/lib/auth-cookie";
import { buildApiUrl } from "@/lib/puncak-api";

type ProxyContext = {
  params: Promise<{ path: string[] }>;
};

export async function GET(request: NextRequest, context: ProxyContext) {
  return forwardRequest(request, context);
}

export async function POST(request: NextRequest, context: ProxyContext) {
  return forwardRequest(request, context);
}

export async function PUT(request: NextRequest, context: ProxyContext) {
  return forwardRequest(request, context);
}

export async function PATCH(request: NextRequest, context: ProxyContext) {
  return forwardRequest(request, context);
}

export async function DELETE(request: NextRequest, context: ProxyContext) {
  return forwardRequest(request, context);
}

async function forwardRequest(request: NextRequest, context: ProxyContext) {
  const { path } = await context.params;
  const target = new URL(buildApiUrl(`/api/v1/${path.join("/")}`));
  request.nextUrl.searchParams.forEach((value, key) => {
    target.searchParams.set(key, value);
  });

  const headers = new Headers({
    Accept: "application/json",
  });
  const cookieToken = await getAuthCookieToken();
  const authorization = request.headers.get("Authorization") ?? (cookieToken ? `Bearer ${cookieToken}` : null);
  const contentType = request.headers.get("Content-Type");
  const idempotencyKey = request.headers.get("Idempotency-Key");

  if (authorization) {
    headers.set("Authorization", authorization);
  }

  if (contentType) {
    headers.set("Content-Type", contentType);
  }

  if (idempotencyKey) {
    headers.set("Idempotency-Key", idempotencyKey);
  }

  const response = await fetch(target, {
    body: request.method === "GET" ? undefined : await request.arrayBuffer(),
    cache: "no-store",
    headers,
    method: request.method,
  });

  const responseHeaders = new Headers();
  const responseContentType = response.headers.get("Content-Type");
  const contentDisposition = response.headers.get("Content-Disposition");

  if (responseContentType) {
    responseHeaders.set("Content-Type", responseContentType);
  }

  if (contentDisposition) {
    responseHeaders.set("Content-Disposition", contentDisposition);
  }

  return new Response(await response.arrayBuffer(), {
    headers: {
      ...Object.fromEntries(responseHeaders),
    },
    status: response.status,
  });
}
