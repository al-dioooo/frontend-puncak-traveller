"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { IconBrandGoogle, IconLock } from "@tabler/icons-react";
import { ActionButton } from "@/components/ui/action-button";
import {
  localAuthRoutes,
  type BasicLoginPayload,
  type LoginResult,
} from "@/lib/auth-routes";
import { writeStoredAuth } from "@/lib/client-auth";

type LoginPanelProps = {
  returnTo?: string;
  onAuthenticated?: () => void;
  compact?: boolean;
  isBooking?: boolean;
};

export function LoginPanel({
  returnTo = "/account",
  onAuthenticated,
  compact = false,
  isBooking = false
}: LoginPanelProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  function startGoogleSignIn() {
    const resolvedReturnTo = getResolvedReturnTo(returnTo);
    const params = new URLSearchParams({ return_to: resolvedReturnTo });
    window.location.href = `${localAuthRoutes.google}?${params.toString()}`;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setPending(true);

    const payload: BasicLoginPayload = {
      email,
      password,
      remember,
    };

    try {
      const response = await fetch(localAuthRoutes.login, {
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const data = (await response.json()) as LoginResult;

      if (!response.ok) {
        setMessage(data.message ?? "Unable to sign in with those credentials.");
        return;
      }

      writeStoredAuth({
        email,
        name: data.user?.name ?? "Puncak Traveller",
        role: data.user?.role,
      });
      onAuthenticated?.();
      router.push(data.user?.role === "admin" ? "/admin" : getResolvedReturnTo(returnTo));
    } catch {
      setMessage("The auth service is not reachable right now.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={compact ? "login-panel login-panel-compact" : "login-panel js-card"}>
      <div className="login-panel-head">
        {!isBooking && (
          <>
            <p className="eyebrow eyebrow-teal">Welcome back</p>
            <h2>Halo again</h2>
            <p>Log in to continue your adventure.</p>
          </>
        )}
      </div>

      <ActionButton
        className="login-google"
        variant="light"
        icon={IconBrandGoogle}
        iconPosition="left"
        onClick={startGoogleSignIn}
      >
        Continue with Google
      </ActionButton>

      <div className="form-divider"><span>or</span></div>

      <form className="login-form" onSubmit={onSubmit}>
        <label className="form-field" htmlFor="email">
          <span>Email address</span>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label className="form-field" htmlFor="password">
          <span>Password</span>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <div className="login-row">
          <label className="checkbox-field">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
            />
            <span>Remember me</span>
          </label>
          <a href="/forgot-password">Forgot password?</a>
        </div>
        <ActionButton type="submit" icon={IconLock} disabled={pending}>
          {pending ? "Signing in..." : "Log in"}
        </ActionButton>
        <p className="form-status form-status-error" aria-live="polite">
          {message}
        </p>
      </form>
    </div>
  );
}

function getResolvedReturnTo(fallback: string): string {
  const queryReturnTo = new URLSearchParams(window.location.search).get("return_to");

  return queryReturnTo?.startsWith("/") ? queryReturnTo : fallback;
}
