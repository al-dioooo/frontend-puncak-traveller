export const authStorageKey = "puncak.auth";

export type StoredAuth = {
  email?: string;
  name?: string;
  role?: string;
  signedInAt?: string;
};

export function readStoredAuth(): StoredAuth | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawAuth = window.localStorage.getItem(authStorageKey);
  if (!rawAuth) {
    return null;
  }

  try {
    return JSON.parse(rawAuth) as StoredAuth;
  } catch {
    window.localStorage.removeItem(authStorageKey);
    return null;
  }
}

export function getStoredAuthToken(): string | null {
  return null;
}

export function writeStoredAuth(auth: StoredAuth) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    authStorageKey,
    JSON.stringify({
      ...auth,
      signedInAt: auth.signedInAt ?? new Date().toISOString(),
    }),
  );
}
