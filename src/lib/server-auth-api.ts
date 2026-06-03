import "server-only";

const DEFAULT_API_BASE_URL = "http://api-puncak-traveller.test";

export const backendAuthEndpoints = {
  googleRedirect: "/api/v1/auth/google/redirect",
  googleExchange: "/api/v1/auth/google/exchange",
  forgotPassword: "/api/v1/auth/forgot-password",
  login: "/api/v1/auth/login",
  logout: "/api/v1/auth/logout",
  register: "/api/v1/auth/register",
  resetPassword: "/api/v1/auth/reset-password",
  user: "/api/v1/auth/user",
} as const;

export function buildBackendAuthUrl(
  endpoint: keyof typeof backendAuthEndpoints,
  params?: Record<string, string>,
) {
  const baseUrl = process.env.PUNCAK_API_BASE_URL ?? DEFAULT_API_BASE_URL;
  const url = new URL(backendAuthEndpoints[endpoint], baseUrl);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        url.searchParams.set(key, value);
      }
    });
  }

  return url;
}
