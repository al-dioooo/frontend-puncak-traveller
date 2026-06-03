import Image from "next/image";
import Link from "next/link";
import {
  IconArrowUpRight,
  IconCalendarEvent,
  IconMapPin,
  IconMountain,
  IconTent,
  IconTrees,
  IconUsers,
  IconWalk,
} from "@tabler/icons-react";
import { Badge, MetaItem } from "@/components/landing/badge";
import { ButtonLink } from "@/components/landing/button-link";
import type {
  LandingActivity,
  LandingCommunity,
  LandingEvent,
} from "@/components/landing/types";
import { cn } from "@/lib/cn";
import { shouldBypassImageOptimization } from "@/lib/image-optimization";

type EventCardProps = {
  event: LandingEvent;
  featured?: boolean;
};

export function EventCard({ event, featured = false }: EventCardProps) {
  return (
    <article className={cn("event-card motion-card js-card", featured && "event-card-featured")}>
      <Link href={event.href} className="event-card-image" aria-label={event.title}>
        <Image
          src={event.image}
          alt={event.imageAlt}
          fill
          sizes={featured ? "(min-width: 1024px) 420px, 100vw" : "(min-width: 1024px) 360px, 100vw"}
          className="image-cover"
          unoptimized={shouldBypassImageOptimization(event.image)}
        />
        <div className="event-card-image-shade" />
        <div className="event-card-badges">
          <Badge tone="light">{event.status}</Badge>
          <Badge tone="teal">{event.category}</Badge>
        </div>
      </Link>
      <div className="event-card-body">
        <div className="event-card-meta">
          <MetaItem icon={IconCalendarEvent}>{event.date}</MetaItem>
          <MetaItem icon={IconMapPin}>{event.location}</MetaItem>
        </div>
        <h3>
          <Link href={event.href}>{event.title}</Link>
        </h3>
        <div className="event-card-footer">
          <div>
            <span className="price-label">From</span>
            <strong>{event.price}</strong>
          </div>
          <ButtonLink href={event.ctaHref} size="sm" icon={IconArrowUpRight}>
            Book now
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}

const activityIcons = {
  orange: IconMountain,
  teal: IconWalk,
  navy: IconTent,
  earth: IconTrees,
} as const;

type ActivityCardProps = {
  activity: LandingActivity;
};

export function ActivityCard({ activity }: ActivityCardProps) {
  const Icon = activityIcons[activity.tone];

  return (
    <Link
      href={activity.href}
      className={cn("activity-card motion-card js-card", `activity-${activity.tone}`)}
    >
      <Image
        src={activity.image}
        alt={activity.imageAlt}
        fill
        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
        className="image-cover"
      />
      <span className="activity-icon" aria-hidden>
        <Icon size={22} stroke={2} />
      </span>
      <span className="activity-count">{activity.count}</span>
      <span className="activity-title">{activity.title}</span>
    </Link>
  );
}

type CommunityCardProps = {
  community: LandingCommunity;
};

export function CommunityCard({ community }: CommunityCardProps) {
  return (
    <article className="community-card motion-card js-card">
      <Link href={community.href} className="community-image" aria-label={community.title}>
        <Image
          src={community.image}
          alt={community.imageAlt}
          fill
          sizes="(min-width: 1024px) 360px, 100vw"
          className="image-cover"
          unoptimized={shouldBypassImageOptimization(community.image)}
        />
      </Link>
      <div className="community-body">
        <div className="community-meta">
          <Badge tone="cream" icon={IconUsers}>
            Sub-community
          </Badge>
          <span>{community.members}</span>
        </div>
        <h3>{community.title}</h3>
        <p>{community.description}</p>
        <ButtonLink href={community.href} size="sm" variant="outline" icon={IconArrowUpRight}>
          Join crew
        </ButtonLink>
      </div>
    </article>
  );
}

type BookingStepProps = {
  step: {
    number: string;
    title: string;
    description: string;
  };
};

export function BookingStep({ step }: BookingStepProps) {
  return (
    <article className="booking-step js-card">
      <span className="booking-number">{step.number}</span>
      <div>
        <h3>{step.title}</h3>
        <p>{step.description}</p>
      </div>
    </article>
  );
}
