"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { IconMenu2, IconX } from "@tabler/icons-react";
import Logo from "@/components/logo";
import { ButtonLink } from "@/components/landing/button-link";
import { navLinks } from "@/components/landing/data";
import { cn } from "@/lib/cn";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header js-header">
      <div className="header-inner">
        <Link href="/" className="logo-link motion-control" aria-label="Puncak Travellers home">
          <Logo className="site-logo" />
        </Link>

        <nav className="desktop-nav" aria-label="Primary navigation">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="nav-link motion-control">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="desktop-actions">
          <ButtonLink href="/login" variant="ghost" size="sm">
            Log in
          </ButtonLink>
          <ButtonLink href="/signup" variant="light" size="sm">
            Sign up
          </ButtonLink>
        </div>

        <button
          type="button"
          className="mobile-menu-button motion-control"
          aria-expanded={open}
          aria-controls="mobile-navigation"
          aria-label={open ? "Close navigation" : "Open navigation"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <IconX aria-hidden size={22} /> : <IconMenu2 aria-hidden size={22} />}
        </button>
      </div>

      <div
        id="mobile-navigation"
        className={cn("mobile-nav-panel", open && "mobile-nav-panel-open")}
      >
        <nav aria-label="Mobile navigation">
          {navLinks.map((link, index) => (
            <Link
              key={link.href}
              href={link.href}
              className="mobile-nav-link"
              style={{ "--item-index": index } as CSSProperties}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="mobile-actions">
          <ButtonLink href="/login" variant="outline">
            Log in
          </ButtonLink>
          <ButtonLink href="/signup" variant="primary">
            Sign up
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}
