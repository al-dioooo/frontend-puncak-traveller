"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconUserPlus } from "@tabler/icons-react";
import { ActionButton } from "@/components/ui/action-button";
import { localAuthRoutes, type LoginResult } from "@/lib/auth-routes";
import { writeStoredAuth } from "@/lib/client-auth";

export function SignupPanel() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setPending(true);

    try {
      const response = await fetch(localAuthRoutes.register, {
        body: JSON.stringify({ name, email, password }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const data = (await response.json()) as LoginResult;

      if (!response.ok) {
        setMessage(data.message ?? "Unable to create this account.");
        return;
      }

      writeStoredAuth({
        email: data.user?.email ?? email,
        name: data.user?.name ?? name,
        role: data.user?.role,
        avatarUrl: data.user?.avatarUrl ?? data.user?.avatar_url ?? null,
      });
      router.push("/account");
    } catch {
      setMessage("The auth service is not reachable right now.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="login-panel js-card">
      <div className="login-panel-head">
        <p className="eyebrow eyebrow-teal">Join the crew</p>
        <h2>Create account</h2>
        <p>Book events and keep your tickets in one place.</p>
      </div>

      <form className="login-form" onSubmit={onSubmit}>
        <label className="form-field" htmlFor="signup-name">
          <span>Name</span>
          <input
            id="signup-name"
            autoComplete="name"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <label className="form-field" htmlFor="signup-email">
          <span>Email address</span>
          <input
            id="signup-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label className="form-field" htmlFor="signup-password">
          <span>Password</span>
          <input
            id="signup-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <ActionButton type="submit" icon={IconUserPlus} disabled={pending}>
          {pending ? "Creating..." : "Create account"}
        </ActionButton>
        <p className="form-status form-status-error" aria-live="polite">
          {message}
        </p>
      </form>

      <p className="auth-switch">
        Already have an account? <Link href="/login">Log in</Link>
      </p>
    </div>
  );
}
