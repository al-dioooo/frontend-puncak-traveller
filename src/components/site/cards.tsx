import Image from "next/image";
import Link from "next/link";
import {
  IconArrowUpRight,
  IconCalendarEvent,
  IconMapPin,
  IconTicket,
} from "@tabler/icons-react";
import { Badge, MetaItem } from "@/components/landing/badge";
import { ButtonLink } from "@/components/landing/button-link";
import type {
  AccountBooking,
  EventSummary,
  GalleryItem,
} from "@/lib/reference-data";
import { cn } from "@/lib/cn";

const statusTone: Record<EventSummary["status"], "orange" | "teal" | "navy"> = {
  completed: "navy",
  ongoing: "teal",
  upcoming: "orange",
};

type EventListingCardProps = {
  event: EventSummary;
};

export function EventListingCard({ event }: EventListingCardProps) {
  const unavailable = event.spotsLabel.toLowerCase().includes("sold out");

  return (
    <article className="listing-card motion-card js-card">
      <Link href={event.detailHref} className="listing-card-image" aria-label={event.title}>
        <Image
          src={event.image}
          alt={event.imageAlt}
          fill
          sizes="(min-width: 1180px) 360px, (min-width: 760px) 42vw, 100vw"
          className="image-cover"
        />
        <div className="listing-card-badges">
          <Badge tone={statusTone[event.status]}>{event.statusLabel}</Badge>
          <Badge tone="light">{event.category}</Badge>
        </div>
      </Link>

      <div className="listing-card-body">
        <div className="listing-card-meta">
          <MetaItem icon={IconCalendarEvent}>{event.date}</MetaItem>
          <MetaItem icon={IconMapPin}>{event.location}</MetaItem>
        </div>
        <h2>
          <Link href={event.detailHref}>{event.title}</Link>
        </h2>
        <div className="listing-card-footer">
          <div>
            <span>{event.priceLabel}</span>
            <strong>{event.spotsLabel}</strong>
          </div>
          <div className="listing-card-actions">
            <ButtonLink href={event.detailHref} variant="outline" size="sm">
              Detail
            </ButtonLink>
            <ButtonLink
              href={unavailable ? event.detailHref : event.bookingHref}
              variant={unavailable ? "ghost" : "primary"}
              size="sm"
              icon={IconArrowUpRight}
            >
              {unavailable ? "Sold out" : event.status === "completed" ? "View recap" : "Book ticket"}
            </ButtonLink>
          </div>
        </div>
      </div>
    </article>
  );
}

type GalleryCardProps = {
  item: GalleryItem;
  featured?: boolean;
};

export function GalleryCard({ item, featured = false }: GalleryCardProps) {
  return (
    <figure className={cn("gallery-card motion-card js-card", featured && "gallery-card-featured")}>
      <Image
        src={item.image}
        alt={item.imageAlt}
        fill
        sizes={featured ? "(min-width: 1024px) 48vw, 100vw" : "(min-width: 1024px) 30vw, 100vw"}
        className="image-cover"
      />
      <figcaption>
        <span>{item.event}</span>
        <strong>{item.title}</strong>
      </figcaption>
    </figure>
  );
}

type StatCardProps = {
  value: string;
  label: string;
};

export function StatCard({ value, label }: StatCardProps) {
  return (
    <div className="stat-card js-card">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

type FeatureCardProps = {
  title: string;
  description: string;
  index?: number;
};

export function FeatureCard({ title, description, index }: FeatureCardProps) {
  return (
    <article className="feature-card motion-card js-card">
      {typeof index === "number" ? <span>{String(index + 1).padStart(2, "0")}</span> : null}
      <h2>{title}</h2>
      <p>{description}</p>
    </article>
  );
}

type AccountBookingCardProps = {
  booking: AccountBooking;
};

export function AccountBookingCard({ booking }: AccountBookingCardProps) {
  return (
    <article className="account-booking-card motion-card js-card">
      <div className="account-booking-head">
        <Badge tone={booking.status === "upcoming" ? "orange" : booking.status === "saved" ? "teal" : "navy"}>
          {booking.badge}
        </Badge>
        <span>{booking.reference}</span>
      </div>
      <h2>{booking.title}</h2>
      <div className="listing-card-meta">
        <MetaItem icon={IconCalendarEvent}>{booking.date}</MetaItem>
        <MetaItem icon={IconMapPin}>{booking.location}</MetaItem>
        <MetaItem icon={IconTicket}>{booking.ticketLabel}</MetaItem>
      </div>
      <div className="account-booking-actions">
        <ButtonLink href={booking.primaryHref ?? "/account"} size="sm">
          {booking.primaryAction}
        </ButtonLink>
        {booking.secondaryAction ? (
          <ButtonLink href={booking.secondaryHref ?? "/account"} size="sm" variant="outline">
            {booking.secondaryAction}
          </ButtonLink>
        ) : null}
      </div>
    </article>
  );
}
