import Image from "next/image";
import type { Metadata } from "next";
import Logo from "@/components/logo";
import { ForgotPasswordPanel } from "@/components/auth/password-reset-panels";
import { SmoothScrollProvider } from "@/components/landing/smooth-scroll-provider";

export const metadata: Metadata = {
  title: "Forgot password | Puncak Travellers",
  description: "Request a secure password reset link for your Puncak Travellers account.",
};

export default function ForgotPasswordPage() {
  return (
    <SmoothScrollProvider>
      <main className="auth-page">
        <section className="auth-visual">
          <Image
            src="/auth/login-bg.jpg"
            alt="Warm mountain texture for the Puncak Travellers password reset screen"
            fill
            priority
            sizes="(min-width: 900px) 52vw, 100vw"
            className="image-cover"
          />
          <div className="auth-visual-overlay" />
          <div className="auth-copy js-hero-item">
            <Logo className="auth-logo" />
            <h1>Get back to your booking flow.</h1>
            <p>We will send a secure reset link to the email on your account.</p>
          </div>
        </section>
        <section className="auth-panel-section" aria-label="Forgot password form">
          <ForgotPasswordPanel />
        </section>
      </main>
    </SmoothScrollProvider>
  );
}
