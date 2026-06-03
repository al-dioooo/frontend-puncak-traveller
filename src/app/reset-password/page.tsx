import Image from "next/image";
import type { Metadata } from "next";
import { Suspense } from "react";
import Logo from "@/components/logo";
import { ResetPasswordPanel } from "@/components/auth/password-reset-panels";
import { SmoothScrollProvider } from "@/components/landing/smooth-scroll-provider";

export const metadata: Metadata = {
  title: "Reset password | Puncak Travellers",
  description: "Set a new password for your Puncak Travellers account.",
};

export default function ResetPasswordPage() {
  return (
    <SmoothScrollProvider>
      <main className="auth-page">
        <section className="auth-visual">
          <Image
            src="/auth/login-bg.jpg"
            alt="Warm mountain texture for the Puncak Travellers reset password screen"
            fill
            priority
            sizes="(min-width: 900px) 52vw, 100vw"
            className="image-cover"
          />
          <div className="auth-visual-overlay" />
          <div className="auth-copy js-hero-item">
            <Logo className="auth-logo" />
            <h1>Set a fresh password.</h1>
            <p>Choose a new password and continue managing your Puncak trips.</p>
          </div>
        </section>
        <section className="auth-panel-section" aria-label="Reset password form">
          <Suspense fallback={<div className="login-panel js-card">Loading reset form...</div>}>
            <ResetPasswordPanel />
          </Suspense>
        </section>
      </main>
    </SmoothScrollProvider>
  );
}
