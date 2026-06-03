import Image from "next/image";
import type { Metadata } from "next";
import Logo from "@/components/logo";
import { SignupPanel } from "@/components/auth/signup-panel";
import { SmoothScrollProvider } from "@/components/landing/smooth-scroll-provider";

export const metadata: Metadata = {
  title: "Sign up | Puncak Travellers",
  description: "Create a Puncak Travellers account to book events and manage tickets.",
};

export default function SignupPage() {
  return (
    <SmoothScrollProvider>
      <main className="auth-page">
        <section className="auth-visual">
          <Image
            src="/auth/login-bg.jpg"
            alt="Warm mountain texture for the Puncak Travellers signup screen"
            fill
            priority
            sizes="(min-width: 900px) 52vw, 100vw"
            className="image-cover"
          />
          <div className="auth-visual-overlay" />
          <div className="auth-copy js-hero-item">
            <Logo className="auth-logo" />
            <h1>Join the Puncak Travellers community.</h1>
            <p>Create an account to reserve events, save trips, and manage tickets.</p>
            <div className="auth-stats">
              <span>18K+ Members</span>
              <span>240+ Events</span>
              <span>West Java</span>
            </div>
          </div>
        </section>
        <section className="auth-panel-section" aria-label="Signup form">
          <SignupPanel />
        </section>
      </main>
    </SmoothScrollProvider>
  );
}
