import Image from "next/image";
import {
  IconArrowRight,
  IconChevronRight,
  IconMapPin,
  IconMountain,
  IconPlayerPlayFilled,
  IconSparkles,
} from "@tabler/icons-react";
import { Badge } from "@/components/landing/badge";
import { ButtonLink } from "@/components/landing/button-link";
import { bookingSteps } from "@/components/landing/data";
import {
  ActivityCard,
  BookingStep,
  CommunityCard,
  EventCard,
} from "@/components/landing/cards";
import { SectionHeading } from "@/components/landing/section-heading";
import type {
  LandingActivity,
  LandingCommunity,
  LandingEvent,
  LandingGalleryImage,
  LandingHeroStat,
  LandingLiveEvent,
} from "@/components/landing/types";

type HeroSectionProps = {
  stats: LandingHeroStat[];
  upcomingEventsCount: number;
};

type EventsSectionProps = {
  events: LandingEvent[];
};

type ActivitiesSectionProps = {
  activities: LandingActivity[];
};

type LiveEventSectionProps = {
  liveEvent: LandingLiveEvent;
};

type CommunitiesSectionProps = {
  communities: LandingCommunity[];
};

type GallerySectionProps = {
  images: LandingGalleryImage[];
};

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="landing-empty-state js-reveal">
      <p>{title}</p>
      <span>{description}</span>
    </div>
  );
}

export function HeroSection({
  stats,
  upcomingEventsCount,
}: HeroSectionProps) {
  const eventLabel =
    upcomingEventsCount === 0
      ? "No events scheduled yet"
      : `${upcomingEventsCount} upcoming ${upcomingEventsCount === 1 ? "event" : "events"}`;

  return (
    <section className="hero-section" aria-labelledby="hero-title">
      <div className="hero-bg js-hero-media">
        <Image
          src="/landing/hero-mountain.jpg"
          alt="Warm mountain landscape in Indonesia's highlands"
          fill
          priority
          sizes="100vw"
          className="image-cover"
        />
      </div>
      <div className="hero-overlay" />
      <div className="wrap hero-content">
        <div className="hero-copy">
          <Badge tone="light" icon={IconSparkles} className="js-hero-item">
            {eventLabel}
          </Badge>
          <h1 id="hero-title" className="js-hero-item">
            Your next high-altitude adventure starts here.
          </h1>
          <p className="hero-lead js-hero-item">
            Halo! Join a community of runners, walkers & campers exploring
            Indonesia&apos;s mountain regions - one healthy event at a time.
          </p>
          <div className="hero-actions js-hero-item">
            <ButtonLink href="/events" size="lg" icon={IconArrowRight}>
              Explore
            </ButtonLink>
            <span className="hero-location">
              <IconMapPin aria-hidden size={18} />
              West Java
            </span>
          </div>
        </div>

        {stats.length > 0 ? (
          <div className="hero-stats js-hero-item">
            {stats.map((stat) => (
              <div key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function EventsSection({ events }: EventsSectionProps) {
  return (
    <section className="section events-section" aria-labelledby="events-title">
      <div className="wrap">
        <SectionHeading
          eyebrow="Recommended for you"
          title="Upcoming adventures"
          action={
            <ButtonLink href="/events" variant="ghost" size="sm" icon={IconChevronRight}>
              See all events
            </ButtonLink>
          }
        />
        {events.length > 0 ? (
          <div className="events-grid">
            {events.map((event, index) => (
              <EventCard key={event.href} event={event} featured={index === 0} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No upcoming adventures yet"
            description="New runs, walks, and camps will appear here as soon as the Puncak crew publishes them."
          />
        )}
      </div>
    </section>
  );
}

export function ActivitiesSection({ activities }: ActivitiesSectionProps) {
  return (
    <section className="section activities-section" aria-labelledby="activities-title">
      <div className="wrap">
        <SectionHeading eyebrow="Ways to move" title="Find your kind of wild" />
        {activities.length > 0 ? (
          <div className="activity-grid">
            {activities.map((activity) => (
              <ActivityCard key={activity.href} activity={activity} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Activities are being planned"
            description="The activity board is empty because the API has no published activity counts yet."
          />
        )}
      </div>
    </section>
  );
}

export function LiveEventSection({ liveEvent }: LiveEventSectionProps) {
  return (
    <section className="section live-section js-live-pin" aria-labelledby="live-title">
      <div className="wrap live-grid">
        <div className="live-copy js-reveal">
          {liveEvent ? (
            <>
              <Badge tone="teal" icon={IconPlayerPlayFilled}>
                Happening now
              </Badge>
              <p className="eyebrow eyebrow-teal">Happening today</p>
              <h2 id="live-title">{liveEvent.title}</h2>
              <p>{liveEvent.description}</p>
              <div className="live-stats">
                {liveEvent.stats.map((stat) => (
                  <div key={stat.label} className="js-live-stat">
                    <strong>{stat.value}</strong>
                    <span>{stat.label}</span>
                  </div>
                ))}
              </div>
              <div className="live-actions">
                <ButtonLink href={liveEvent.href} icon={IconArrowRight}>
                  Live leaderboard
                </ButtonLink>
                <ButtonLink href={liveEvent.recapHref} variant="light">
                  View recap later
                </ButtonLink>
              </div>
            </>
          ) : (
            <>
              <Badge tone="teal" icon={IconPlayerPlayFilled}>
                Trail is quiet
              </Badge>
              <p className="eyebrow eyebrow-teal">No live event</p>
              <h2 id="live-title">No one is on course right now</h2>
              <p>
                Live coverage will appear here when an event is actively
                happening. Until then, browse the next published adventure.
              </p>
              <div className="live-actions">
                <ButtonLink href="/events" icon={IconArrowRight}>
                  Browse upcoming events
                </ButtonLink>
              </div>
            </>
          )}
        </div>
        <div className="live-visual js-live-visual">
          <Image
            src={liveEvent?.image ?? "/landing/live-trail.jpg"}
            alt={liveEvent?.imageAlt ?? "Trail runners passing through a green forest route"}
            fill
            sizes="(min-width: 1024px) 44vw, 100vw"
            className="image-cover"
          />
          <div className="live-orbit">
            <IconMountain aria-hidden size={28} />
            <span>On the trail</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export function CommunitiesSection({ communities }: CommunitiesSectionProps) {
  return (
    <section className="section communities-section" aria-labelledby="communities-title">
      <div className="wrap">
        <SectionHeading
          eyebrow="One community, many trails"
          title="Join a Puncak crew"
          action={
            <ButtonLink href="/communities" variant="ghost" size="sm" icon={IconChevronRight}>
              All communities
            </ButtonLink>
          }
          eyebrowTone="teal"
        />
        {communities.length > 0 ? (
          <div className="community-grid">
            {communities.map((community) => (
              <CommunityCard key={community.href} community={community} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No crews published yet"
            description="Community cards will appear after the API has public Puncak crews."
          />
        )}
      </div>
    </section>
  );
}

export function BookingStepsSection() {
  return (
    <section className="section booking-section" aria-labelledby="booking-title">
      <div className="wrap booking-grid">
        <div className="booking-intro js-reveal">
          <p className="eyebrow">Booking, the easy way</p>
          <h2 id="booking-title">From couch to summit in three steps</h2>
        </div>
        <div className="booking-steps">
          {bookingSteps.map((step) => (
            <BookingStep key={step.number} step={step} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function GallerySection({ images }: GallerySectionProps) {
  return (
    <section className="section gallery-section" aria-labelledby="gallery-title">
      <div className="wrap">
        <SectionHeading
          eyebrow="From the trail"
          title="Moments at the puncak"
          action={
            <ButtonLink href="/galleries" variant="ghost" size="sm" icon={IconChevronRight}>
              Open gallery
            </ButtonLink>
          }
          eyebrowTone="teal"
        />
      </div>
      {images.length > 0 ? (
        <div className="gallery-viewport js-gallery">
          <div className="gallery-track js-gallery-track">
            {images.map((image, index) => (
              <figure key={image.src} className="gallery-item motion-card js-card">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(min-width: 1024px) 36vw, (min-width: 640px) 60vw, 86vw"
                  className="image-cover"
                />
                <figcaption>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {image.label}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      ) : (
        <div className="wrap">
          <EmptyState
            title="No trail moments yet"
            description="Gallery media will appear here when the API publishes public images."
          />
        </div>
      )}
    </section>
  );
}

export function FinalCtaSection() {
  return (
    <section className="final-cta-section" aria-labelledby="cta-title">
      <div className="cta-image js-cta-media">
        <Image
          src="/landing/cta-mountains.jpg"
          alt="A dramatic highland trail leading toward the mountains"
          fill
          sizes="100vw"
          className="image-cover"
        />
      </div>
      <div className="cta-overlay" />
      <div className="wrap cta-content js-reveal">
        <h2 id="cta-title">Ready to meet the mountains?</h2>
        <p>
          Create a free account and book your first event today. The trail is
          calling.
        </p>
        <div className="cta-actions">
          <ButtonLink href="/login" size="lg" icon={IconArrowRight}>
            Get started - it&apos;s free
          </ButtonLink>
          <ButtonLink href="/events" size="lg" variant="light">
            Browse events
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
