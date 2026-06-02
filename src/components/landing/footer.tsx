import Link from "next/link";
import Logo from "@/components/logo";
import { footerGroups } from "@/components/landing/data";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <div className="footer-brand js-reveal">
          <Link href="/" className="logo-link" aria-label="Puncak Travellers home">
            <Logo className="site-logo footer-logo" />
          </Link>
          <p>
            Halo! We&apos;re a community for healthy adventures in Indonesia&apos;s
            highlands - fun runs, walks, and camps that bring people to the puncak.
          </p>
        </div>

        <div className="footer-links">
          {footerGroups.map((group) => (
            <div key={group.title} className="footer-group js-card">
              <h2>{group.title}</h2>
              <ul>
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="wrap footer-bottom">
        <p>© 2026 Puncak Travellers · Made with care in Bogor, Indonesia</p>
        <div>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/cookies">Cookies</Link>
        </div>
      </div>
    </footer>
  );
}

