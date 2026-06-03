"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { IconKey, IconMail } from "@tabler/icons-react";
import { ActionButton } from "@/components/ui/action-button";
import { localAuthRoutes } from "@/lib/auth-routes";

type ApiMessage = {
  message?: string;
};

export function ForgotPasswordPanel() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setPending(true);

    try {
      const response = await fetch(localAuthRoutes.forgotPassword, {
        body: JSON.stringify({ email }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const data = (await response.json()) as ApiMessage;

      if (!response.ok) {
        setMessage(data.message ?? "Unable to send a reset link.");
        return;
      }

      setSent(true);
      setMessage(data.message ?? "Check your email for a password reset link.");
    } catch {
      setMessage("The auth service is not reachable right now.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="login-panel js-card">
      <div className="login-panel-head">
        <p className="eyebrow eyebrow-teal">Password help</p>
        <h2>Reset password</h2>
        <p>Enter your email and we will send a secure reset link.</p>
      </div>

      <form className="login-form" onSubmit={onSubmit}>
        <label className="form-field" htmlFor="forgot-email">
          <span>Email address</span>
          <input
            id="forgot-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <ActionButton type="submit" icon={IconMail} disabled={pending || sent}>
          {pending ? "Sending..." : sent ? "Link sent" : "Send reset link"}
        </ActionButton>
        <p
          className={`form-status ${sent ? "form-status-success" : "form-status-error"}`}
          aria-live="polite"
        >
          {message}
        </p>
      </form>

      <p className="auth-switch">
        Remembered it? <Link href="/login">Back to login</Link>
      </p>
    </div>
  );
}

export function ResetPasswordPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setPending(true);

    try {
      const response = await fetch(localAuthRoutes.resetPassword, {
        body: JSON.stringify({
          email,
          password,
          password_confirmation: passwordConfirmation,
          token: searchParams.get("token") ?? "",
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });
      const data = (await response.json()) as ApiMessage;

      if (!response.ok) {
        setMessage(data.message ?? "Unable to reset this password.");
        return;
      }

      router.push("/login?reset=success");
    } catch {
      setMessage("The auth service is not reachable right now.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="login-panel js-card">
      <div className="login-panel-head">
        <p className="eyebrow eyebrow-teal">New password</p>
        <h2>Choose a new password</h2>
        <p>Use the email address that received the reset link.</p>
      </div>

      <form className="login-form" onSubmit={onSubmit}>
        <label className="form-field" htmlFor="reset-email">
          <span>Email address</span>
          <input
            id="reset-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label className="form-field" htmlFor="reset-password">
          <span>New password</span>
          <input
            id="reset-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <label className="form-field" htmlFor="reset-password-confirmation">
          <span>Confirm password</span>
          <input
            id="reset-password-confirmation"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={passwordConfirmation}
            onChange={(event) => setPasswordConfirmation(event.target.value)}
          />
        </label>
        <ActionButton type="submit" icon={IconKey} disabled={pending}>
          {pending ? "Saving..." : "Reset password"}
        </ActionButton>
        <p className="form-status form-status-error" aria-live="polite">
          {message}
        </p>
      </form>
    </div>
  );
}
