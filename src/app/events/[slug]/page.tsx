import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  IconCalendarEvent,
  IconCheck,
  IconMapPin,
  IconMountain,
  IconUsers,
} from "@tabler/icons-react";
import { Badge, MetaItem } from "@/components/landing/badge";
import { ButtonLink } from "@/components/landing/button-link";
import { SaveEventButton } from "@/components/events/save-event-button";
import { PublicPageShell } from "@/components/site/public-page-shell";
import { getEventDetailBySlugFromApi, getEvents } from "@/lib/puncak-api";

type EventDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const events = await getEvents();

  return events.map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({
  params,
}: EventDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventDetailBySlugFromApi(slug);

  if (!event) {
    return {
      title: "Event not found | Puncak Travellers",
    };
  }

  return {
    title: `${event.title} | Puncak Travellers`,
    description: event.summary[0],
  };
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { slug } = await params;
  const event = await getEventDetailBySlugFromApi(slug);

  if (!event) {
    notFound();
  }

  return (
    <PublicPageShell>
      <article className="event-detail-page">
        <section className="event-detail-hero page-hero-dark">
          <div className="event-detail-media js-hero-media">
            <Image
              src={event.image}
              alt={event.imageAlt}
              fill
              priority
              sizes="100vw"
              className="image-cover"
            />
          </div>
          <div className="event-detail-overlay" />
          <div className="wrap event-detail-hero-content">
            <div className="event-detail-breadcrumb js-hero-item">
              <span>Events</span>
              <span>{event.category}</span>
              <span>{event.title}</span>
            </div>
            <div className="event-detail-title-row">
              <div>
                <Badge tone="light" className="js-hero-item">
                  {event.statusLabel}
                </Badge>
                <h1 className="js-hero-item">{event.title}</h1>
              </div>
              <SaveEventButton eventSlug={event.slug} />
            </div>
            <div className="event-detail-meta js-hero-item">
              <MetaItem icon={IconCalendarEvent}>{event.fullDate}</MetaItem>
              <MetaItem icon={IconMapPin}>{event.location}</MetaItem>
              <MetaItem icon={IconMountain}>{event.distanceLabel}</MetaItem>
            </div>
          </div>
        </section>

        <section className="section event-detail-content">
          <div className="wrap event-detail-grid">
            <div className="event-detail-main">
              <div className="detail-facts js-reveal">
                <div>
                  <span>{event.time}</span>
                  <strong>{event.venueName}</strong>
                </div>
                <div>
                  <span>{event.distanceLabel}</span>
                  <strong>Choose your distance</strong>
                </div>
                <div>
                  <span>{event.elevationLabel}</span>
                  <strong>{event.difficulty}</strong>
                </div>
              </div>

              <section className="detail-section js-reveal" aria-labelledby="about-run-title">
                <p className="eyebrow eyebrow-teal">About this run</p>
                <h2 id="about-run-title">A sunrise route with community support</h2>
                {event.summary.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </section>

              <section className="detail-section js-reveal" aria-labelledby="included-title">
                <p className="eyebrow eyebrow-teal">What&apos;s included</p>
                <h2 id="included-title">Everything you need on trail</h2>
                <div className="included-grid">
                  {event.includes.map((item) => (
                    <div key={item} className="included-item js-card">
                      <IconCheck aria-hidden size={18} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="detail-section js-reveal" aria-labelledby="schedule-title">
                <p className="eyebrow eyebrow-teal">Race day schedule</p>
                <h2 id="schedule-title">From check-in to brunch</h2>
                <div className="schedule-list">
                  {event.schedule.map((item) => (
                    <div key={`${item.time}-${item.title}`} className="schedule-row js-card">
                      <strong>{item.time}</strong>
                      <span>{item.title}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="detail-section js-reveal" aria-labelledby="location-title">
                <p className="eyebrow eyebrow-teal">Where it happens</p>
                <h2 id="location-title">{event.venueName}</h2>
                <p>{event.venueDescription}</p>
                <div className="map-panel">
                  <IconMapPin aria-hidden size={26} />
                  <span>{event.location}</span>
                </div>
              </section>
            </div>

            <aside className="event-detail-sidebar js-card">
              <div className="sidebar-price">
                <span>From</span>
                <strong>{event.priceLabel.replace("From ", "")} / ticket</strong>
              </div>
              <h2>Choose your distance</h2>
              <div className="sidebar-ticket-list">
                {event.tickets.map((ticket) => (
                  <div key={ticket.id} className="sidebar-ticket">
                    <div>
                      <strong>{ticket.name}</strong>
                      <span>{ticket.description}</span>
                      <small>{ticket.capacityLabel}</small>
                    </div>
                    <b>{ticket.priceLabel}</b>
                  </div>
                ))}
              </div>
              <ButtonLink href={event.bookingHref} size="lg" className="sidebar-booking-button">
                Book this run
              </ButtonLink>
              <p>Secure checkout - we never oversell</p>

              <div className="organiser-card">
                <MetaItem icon={IconUsers}>{event.organiser.description}</MetaItem>
                <h3>{event.organiser.name}</h3>
                <ButtonLink href={event.organiser.href} variant="outline" size="sm">
                  Follow
                </ButtonLink>
              </div>
            </aside>
          </div>
        </section>
      </article>
    </PublicPageShell>
  );
}
