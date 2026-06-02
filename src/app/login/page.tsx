import Image from "next/image";
import type { Metadata } from "next";
import Logo from "@/components/logo";
import { LoginPanel } from "@/components/auth/login-panel";
import { SmoothScrollProvider } from "@/components/landing/smooth-scroll-provider";

export const metadata: Metadata = {
  title: "Log in | Puncak Travellers",
  description:
    "Sign in to Puncak Travellers with Google or email and password to manage bookings and tickets.",
};

export default function LoginPage() {
  return (
    <SmoothScrollProvider>
      <main className="auth-page">
        <section className="auth-visual">
          <Image
            src="/auth/login-bg.jpg"
            alt="Warm mountain texture for the Puncak Travellers login screen"
            fill
            priority
            sizes="(min-width: 900px) 52vw, 100vw"
            className="image-cover"
          />
          <div className="auth-visual-overlay" />
          <div className="auth-copy js-hero-item">
            <Logo className="auth-logo" />
            <h1>Your next high-altitude adventure starts here.</h1>
            <p>Sign in to book events, manage tickets, and join the community.</p>
            <div className="auth-stats">
              <span>18K+ Members</span>
              <span>240+ Events</span>
              <span>4.9 Rating</span>
            </div>
          </div>
        </section>
        <section className="auth-panel-section" aria-label="Login form">
          <LoginPanel />
        </section>
      </main>
    </SmoothScrollProvider>
  );
}
