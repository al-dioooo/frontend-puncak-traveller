"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  IconChevronDown,
  IconLayoutDashboard,
  IconLogout,
  IconUserCircle,
} from "@tabler/icons-react";
import { authStorageKey, readStoredAuth, writeStoredAuth, type StoredAuth } from "@/lib/client-auth";
import { cn } from "@/lib/cn";

type ProfileMenuProps = {
  compact?: boolean;
  fallback?: ReactNode;
  mobile?: boolean;
};

export function ProfileMenu({ compact = false, fallback = null, mobile = false }: ProfileMenuProps) {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [auth, setAuth] = useState<StoredAuth | null>(null);
  const [open, setOpen] = useState(false);
  const [failedAvatarUrl, setFailedAvatarUrl] = useState<string | null>(null);
  const avatarUrl = auth?.avatarUrl ?? auth?.avatar_url ?? null;
  const showAvatar = Boolean(avatarUrl && failedAvatarUrl !== avatarUrl);
  const initials = initialsFor(auth?.name ?? auth?.email ?? "PT");
  const isAdmin = auth?.role === "admin";

  useEffect(() => {
    let active = true;
    async function hydrateSession() {
      const storedAuth = readStoredAuth();
      if (active && storedAuth) {
        setAuth(storedAuth);
      }

      try {
        const response = await fetch("/api/puncak/me", {
          cache: "no-store",
          headers: { Accept: "application/json" },
        });

        if (!response.ok) {
          return;
        }

        const payload = await response.json();
        const nextAuth = {
          email: payload.data?.email,
          name: payload.data?.name ?? "Puncak Traveller",
          role: payload.data?.role,
          avatarUrl: payload.data?.avatarUrl ?? payload.data?.avatar_url ?? null,
        };

        if (active) {
          writeStoredAuth(nextAuth);
          setAuth(nextAuth);
        }
      } catch {
        // The menu can still use local mirrored auth if the session check fails.
      }
    }

    hydrateSession();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  if (!auth) {
    return <>{fallback}</>;
  }

  async function logout() {
    window.localStorage.removeItem(authStorageKey);
    setAuth(null);
    setOpen(false);
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    router.push("/login");
    router.refresh();
  }

  return (
    <div
      ref={menuRef}
      className={cn(
        "profile-menu",
        compact && "profile-menu-compact",
        mobile && "profile-menu-mobile",
      )}
    >
      <button
        type="button"
        className="profile-menu-button motion-control"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
      >
        <span className="profile-avatar" aria-hidden>
          {showAvatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl as string} alt="" onError={() => setFailedAvatarUrl(avatarUrl)} />
          ) : (
            <span>{initials}</span>
          )}
        </span>
        {compact ? null : <span className="profile-name">{auth.name ?? "Account"}</span>}
        <IconChevronDown aria-hidden size={16} />
      </button>

      {open ? (
        <div className="profile-dropdown" role="menu">
          <Link href="/account" role="menuitem" onClick={() => setOpen(false)}>
            <IconUserCircle aria-hidden size={17} />
            Account
          </Link>
          {isAdmin ? (
            <Link href="/admin" role="menuitem" onClick={() => setOpen(false)}>
              <IconLayoutDashboard aria-hidden size={17} />
              Go to Dashboard
            </Link>
          ) : null}
          <button type="button" role="menuitem" onClick={logout}>
            <IconLogout aria-hidden size={17} />
            Logout
          </button>
        </div>
      ) : null}
    </div>
  );
}

function initialsFor(value: string) {
  return value
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "PT";
}
