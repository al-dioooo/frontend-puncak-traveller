import type { Metadata } from "next";
import {
  IconMail,
  IconMapPin,
  IconPhone,
} from "@tabler/icons-react";
import { PublicPageShell } from "@/components/site/public-page-shell";
import { PageHero } from "@/components/site/page-hero";
import { getContactMethods } from "@/lib/puncak-api";

export const metadata: Metadata = {
  title: "Contact | Puncak Travellers",
  description:
    "Contact Puncak Travellers about events, partnerships, and community adventures in Indonesia's highlands.",
};

const icons = [IconMail, IconPhone, IconMapPin] as const;

export default async function ContactPage() {
  const contactMethods = await getContactMethods();

  return (
    <PublicPageShell>
      <PageHero
        compact
        eyebrow="Get in touch"
        title="Say halo"
        lead="Questions about an event, partnerships, or joining a crew? Drop us a line - we usually reply within a day."
        image="/pages/contact-hero.jpg"
        imageAlt="A dramatic highland trail leading toward the mountains"
      />

      <section className="section contact-section">
        <div className="wrap contact-info-layout">
          <div className="section-heading contact-info-heading">
            <div>
              <p className="eyebrow eyebrow-teal">Current contact information</p>
              <h2>Reach the right crew.</h2>
            </div>
            <p>
              Use the channel that fits your question. Event-day and booking questions
              are fastest through WhatsApp; partnerships and media are best by email.
            </p>
          </div>

          <div className="contact-methods contact-methods-readonly">
            {contactMethods.map((method, index) => {
              const Icon = icons[index] ?? IconMail;
              return (
                <article key={method.title} className="contact-method-card motion-card js-card">
                  <span className="contact-method-icon">
                    <Icon aria-hidden size={22} />
                  </span>
                  <h2>{method.title}</h2>
                  <strong>{method.value}</strong>
                  <p>{method.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </PublicPageShell>
  );
}
