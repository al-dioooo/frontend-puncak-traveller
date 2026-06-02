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
import {
  activities,
  bookingSteps,
  communities,
  events,
  galleryImages,
  heroStats,
  liveStats,
} from "@/components/landing/data";
import {
  ActivityCard,
  BookingStep,
  CommunityCard,
  EventCard,
} from "@/components/landing/cards";
import { SectionHeading } from "@/components/landing/section-heading";

export function HeroSection() {
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
            4 events happening this week
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

        <div className="hero-stats js-hero-item">
          {heroStats.map((stat) => (
            <div key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function EventsSection() {
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
        <div className="events-grid">
          {events.map((event, index) => (
            <EventCard key={event.title} event={event} featured={index === 0} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function ActivitiesSection() {
  return (
    <section className="section activities-section" aria-labelledby="activities-title">
      <div className="wrap">
        <SectionHeading eyebrow="Ways to move" title="Find your kind of wild" />
        <div className="activity-grid">
          {activities.map((activity) => (
            <ActivityCard key={activity.title} activity={activity} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function LiveEventSection() {
  return (
    <section className="section live-section js-live-pin" aria-labelledby="live-title">
      <div className="wrap live-grid">
        <div className="live-copy js-reveal">
          <Badge tone="teal" icon={IconPlayerPlayFilled}>
            Happening now
          </Badge>
          <p className="eyebrow eyebrow-teal">Happening today</p>
          <h2 id="live-title">Forest Fun Run 10K</h2>
          <p>
            480 runners are on the trail right now at Taman Hutan Raya,
            Bandung. Follow the live leaderboard and cheer them on.
          </p>
          <div className="live-stats">
            {liveStats.map((stat) => (
              <div key={stat.label} className="js-live-stat">
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
          <div className="live-actions">
            <ButtonLink href="/events/forest-fun-run-10k/live" icon={IconArrowRight}>
              Live leaderboard
            </ButtonLink>
            <ButtonLink href="/events/forest-fun-run-10k/recap" variant="light">
              View recap later
            </ButtonLink>
          </div>
        </div>
        <div className="live-visual js-live-visual">
          <Image
            src="/landing/live-trail.jpg"
            alt="Trail runners passing through a green forest route"
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

export function CommunitiesSection() {
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
        <div className="community-grid">
          {communities.map((community) => (
            <CommunityCard key={community.title} community={community} />
          ))}
        </div>
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

export function GallerySection() {
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
      <div className="gallery-viewport js-gallery">
        <div className="gallery-track js-gallery-track">
          {galleryImages.map((image, index) => (
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
          <ButtonLink href="/signup" size="lg" icon={IconArrowRight}>
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

