import "server-only";

import type {
  LandingActivity,
  LandingCommunity,
  LandingEvent,
  LandingGalleryImage,
  LandingHeroStat,
  LandingLiveEvent,
} from "@/components/landing/types";
import type {
  AccountBooking,
  ContactMethod,
  EventDetail,
  EventSummary,
  EventTicketTier,
  GalleryItem,
} from "@/lib/reference-data";

const API_TIMEOUT_MS = 8000;
const DEFAULT_API_BASE_URL = "http://api-puncak-traveller.test";

type ApiEnvelope<T> = {
  data: T;
};

type ApiPaginatedEnvelope<T> = ApiEnvelope<T[]> & {
  meta: {
    page: number;
    perPage: number;
    total: number;
  };
};

type ApiCommunity = {
  id: number;
  parent_id: number | null;
  name: string;
  slug: string;
  description: string | null;
  image_path: string | null;
  image_url: string | null;
  member_count: number;
};

type ApiTicketTier = {
  id: string;
  eventId: string;
  name: string;
  description: string;
  price: number;
  currency: "IDR";
  stock: number;
  capacityLabel: string;
  maxPerUser?: number;
};

type ApiEvent = {
  id: string;
  slug: string;
  title: string;
  category: EventSummary["category"];
  activity: EventSummary["activity"];
  status: EventSummary["status"];
  statusLabel: string;
  createdAt?: string;
  startsAt: string;
  endsAt?: string;
  dateLabel: string;
  fullDateLabel: string;
  timeLabel: string;
  location: string;
  region: string;
  priceFrom: number;
  priceLabel: string;
  spotsRemaining: number;
  spotsLabel: string;
  imageUrl: string;
  imageAlt: string;
  detailHref: string;
  bookingHref: string;
  recapHref?: string;
  organiser?: EventDetail["organiser"] & { id?: string };
  distanceLabel?: string;
  elevationLabel?: string;
  difficulty?: string;
  venueName?: string;
  venueDescription?: string;
  summary?: string[];
  includes?: string[];
  schedule?: EventDetail["schedule"];
  tickets?: ApiTicketTier[];
  participant_count?: number;
};

type ApiLandingActivity = {
  activity_type: string;
  activity_label: string;
  upcoming_count: number;
};

type ApiLandingStat = {
  label: string;
  value: number;
};

type ApiGallery = {
  id: string;
  title: string;
  event: string;
  category: GalleryItem["category"];
  year: GalleryItem["year"];
  imageUrl: string | null;
  imageAlt: string;
};

type ApiLandingPayload = {
  hero_stats: ApiLandingStat[];
  upcoming_events: ApiEvent[];
  activities: ApiLandingActivity[];
  live_event: ApiEvent | null;
  communities: ApiCommunity[];
  gallery: ApiGallery[];
};

export type AccountProfile = {
  name: string;
  location?: string;
  memberSince: string;
  crew?: string;
  avatarUrl?: string;
  role?: string;
  stats: Array<{ value: string; label: string }>;
};

type ApiUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  location?: string | null;
  memberSince: string;
  crew?: string | null;
  role?: string | null;
  stats: {
    eventsBooked: number;
    completed: number;
    kilometersLogged: number;
  };
};

export type LandingPageData = {
  heroStats: LandingHeroStat[];
  upcomingEventsCount: number;
  events: LandingEvent[];
  activities: LandingActivity[];
  liveEvent: LandingLiveEvent;
  communities: LandingCommunity[];
  galleryImages: LandingGalleryImage[];
};

const emptyLandingPageData: LandingPageData = {
  heroStats: [],
  upcomingEventsCount: 0,
  events: [],
  activities: [],
  liveEvent: null,
  communities: [],
  galleryImages: [],
};

const activityAssets: Record<
  string,
  Pick<LandingActivity, "tone" | "image" | "imageAlt">
> = {
  "trail-run": {
    tone: "orange",
    image: "/landing/community-runners.jpg",
    imageAlt: "Runners moving through a forest trail",
  },
  walk: {
    tone: "teal",
    image: "/landing/community-walkers.jpg",
    imageAlt: "Walkers following a mountain path together",
  },
  camping: {
    tone: "navy",
    image: "/landing/community-campers.jpg",
    imageAlt: "Camping tents set in a misty highland field",
  },
  hike: {
    tone: "earth",
    image: "/events/misty-ridge-hike.jpg",
    imageAlt: "A mountain ridge path covered with morning mist",
  },
  wellness: {
    tone: "earth",
    image: "/events/mindful-mountain-yoga.jpg",
    imageAlt: "A quiet mountain scene for wellness activities",
  },
  "fun-run": {
    tone: "orange",
    image: "/events/forest-fun-run.jpg",
    imageAlt: "Runners moving through a forest route",
  },
};

export async function getLandingPageData(): Promise<LandingPageData> {
  try {
    const payload = await puncakApiFetch<ApiEnvelope<ApiLandingPayload>>(
      "/api/v1/landing",
    );

    return mapLandingPayload(payload.data);
  } catch (error) {
    console.error("Unable to load Puncak landing data.", error);
    return emptyLandingPageData;
  }
}

export async function getEvents(): Promise<EventSummary[]> {
  const payload = await puncakApiFetch<ApiPaginatedEnvelope<ApiEvent>>(
    "/api/v1/events?per_page=50",
  );

  return sortEventsForListing(payload.data.map(mapEventSummary));
}

export async function getEventDetailBySlugFromApi(
  slug: string,
  preview?: boolean,
): Promise<EventDetail | null> {
  try {
    const path = preview
      ? `/api/v1/events/${slug}?preview=true`
      : `/api/v1/events/${slug}`;
    const payload = await puncakApiFetch<ApiEnvelope<ApiEvent>>(path);

    return mapEventDetail(payload.data);
  } catch {
    return null;
  }
}

export async function getGalleryItems(): Promise<GalleryItem[]> {
  const payload = await puncakApiFetch<ApiPaginatedEnvelope<ApiGallery>>(
    "/api/v1/galleries?per_page=50",
  );

  return payload.data.filter(hasGalleryImage).map(mapGalleryItem);
}

export async function getContactMethods(): Promise<ContactMethod[]> {
  const payload = await puncakApiFetch<ApiEnvelope<ContactMethod[]>>(
    "/api/v1/contact-methods",
  );

  return payload.data;
}

export async function getAccountProfile(token: string): Promise<AccountProfile> {
  const payload = await puncakApiFetch<ApiEnvelope<ApiUser>>("/api/v1/me", {
    token,
  });

  return mapAccountProfile(payload.data);
}

export async function getAccountBookings(
  token: string,
  status: AccountBooking["status"] | "all" = "all",
): Promise<AccountBooking[]> {
  const path =
    status === "saved"
      ? "/api/v1/me/saved-events"
      : `/api/v1/bookings?status=${status}`;
  const payload = await puncakApiFetch<ApiEnvelope<AccountBooking[]>>(path, {
    token,
  });

  return payload.data;
}

async function puncakApiFetch<T>(
  path: string,
  options: { token?: string } = {},
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const headers = new Headers({
      Accept: "application/json",
    });

    if (options.token) {
      headers.set("Authorization", `Bearer ${options.token}`);
    }

    const response = await fetch(buildApiUrl(path), {
      cache: "no-store",
      headers,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Puncak API returned ${response.status}`);
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

export function buildApiUrl(path: string): string {
  const baseUrl = process.env.PUNCAK_API_BASE_URL ?? DEFAULT_API_BASE_URL;
  return new URL(path, baseUrl).toString();
}

function mapLandingPayload(payload: ApiLandingPayload): LandingPageData {
  const events = payload.upcoming_events.map(mapLandingEvent);

  return {
    heroStats: payload.hero_stats.map((stat) => ({
      label: stat.label,
      value: formatCompactNumber(stat.value),
    })),
    upcomingEventsCount: events.length,
    events,
    activities: payload.activities.map(mapActivity),
    liveEvent: mapLiveEvent(payload.live_event),
    communities: payload.communities.map(mapCommunity),
    galleryImages: payload.gallery.filter(hasGalleryImage).map(mapGalleryImage),
  };
}

function mapEventSummary(event: ApiEvent): EventSummary {
  return {
    slug: event.slug,
    title: event.title,
    category: event.category,
    activity: event.activity,
    status: event.status,
    statusLabel: event.statusLabel,
    createdAt: event.createdAt,
    date: event.dateLabel,
    fullDate: event.fullDateLabel,
    time: event.timeLabel,
    location: event.location,
    region: event.region,
    priceLabel: event.priceLabel,
    spotsLabel: event.spotsLabel,
    image: event.imageUrl,
    imageAlt: event.imageAlt,
    detailHref: event.detailHref,
    bookingHref: event.bookingHref,
    recapHref: event.recapHref,
  };
}

const eventListingStatusRank: Record<EventSummary["status"], number> = {
  upcoming: 0,
  ongoing: 1,
  completed: 2,
};

function sortEventsForListing(events: EventSummary[]): EventSummary[] {
  return [...events].sort((a, b) => {
    const statusDelta =
      eventListingStatusRank[a.status] - eventListingStatusRank[b.status];

    if (statusDelta !== 0) {
      return statusDelta;
    }

    return getOptionalTimestamp(b.createdAt) - getOptionalTimestamp(a.createdAt);
  });
}

function getOptionalTimestamp(value?: string): number {
  if (!value) {
    return 0;
  }

  const timestamp = Date.parse(value);

  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function mapEventDetail(event: ApiEvent): EventDetail {
  return {
    ...mapEventSummary(event),
    organiser: {
      name: event.organiser?.name ?? "Puncak Travellers",
      description:
        event.organiser?.description ?? "Organiser - community adventure host",
      eventsHosted: event.organiser?.eventsHosted ?? 240,
      href: event.organiser?.href ?? "/about",
    },
    distanceLabel: event.distanceLabel ?? event.category,
    elevationLabel: event.elevationLabel ?? "Community-supported route",
    difficulty: event.difficulty ?? "Friendly pace",
    summary:
      event.summary && event.summary.length > 0
        ? event.summary
        : [`${event.title} is part of the Puncak Travellers calendar.`],
    includes: event.includes ?? [],
    schedule: event.schedule ?? [],
    venueName: event.venueName ?? event.location,
    venueDescription:
      event.venueDescription ??
      "Full route notes will be shared with registered participants.",
    tickets: (event.tickets ?? []).map(mapTicketTier),
  };
}

function mapTicketTier(ticket: ApiTicketTier): EventTicketTier {
  return {
    id: ticket.id,
    name: ticket.name,
    description: ticket.description,
    price: ticket.price,
    priceLabel: formatPrice(ticket.price),
    stock: ticket.stock,
    capacityLabel: ticket.capacityLabel,
  };
}

type ApiGalleryWithImage = ApiGallery & {
  imageUrl: string;
};

function hasGalleryImage(item: ApiGallery): item is ApiGalleryWithImage {
  return typeof item.imageUrl === "string" && item.imageUrl.length > 0;
}

function mapGalleryItem(item: ApiGalleryWithImage): GalleryItem {
  return {
    id: item.id,
    title: item.title,
    event: item.event,
    category: item.category,
    year: item.year,
    image: item.imageUrl,
    imageAlt: item.imageAlt,
  };
}

function mapLandingEvent(event: ApiEvent): LandingEvent {
  return {
    title: event.title,
    category: event.category,
    status: event.statusLabel,
    date: event.dateLabel || formatEventDate(event.startsAt, event.endsAt),
    location: event.location,
    price: event.priceLabel.replace("From ", ""),
    href: event.detailHref,
    ctaHref: event.bookingHref,
    image: event.imageUrl ?? "/landing/trail-run.jpg",
    imageAlt: event.imageAlt || event.title,
  };
}

function mapActivity(activity: ApiLandingActivity): LandingActivity {
  const asset =
    activityAssets[activity.activity_type] ?? activityAssets["trail-run"];

  return {
    title: activity.activity_label,
    count: `${activity.upcoming_count} upcoming`,
    href: `/events?activity=${activity.activity_type}`,
    image: asset.image,
    imageAlt: asset.imageAlt,
    tone: asset.tone,
  };
}

function mapLiveEvent(event: ApiEvent | null): LandingLiveEvent {
  if (!event) {
    return null;
  }

  const startedAt = new Date(event.startsAt);

  return {
    title: event.title,
    description:
      event.summary?.[0] ??
      `${event.category} is happening now at ${event.location}.`,
    href: `/events/${event.slug}/live`,
    recapHref: event.recapHref ?? `/events/${event.slug}/recap`,
    image: event.imageUrl ?? "/landing/live-trail.jpg",
    imageAlt: event.imageAlt || event.title,
    stats: [
      {
        value: formatCompactNumber(event.participant_count ?? 0),
        label: "On course",
      },
      {
        value: event.distanceLabel ?? event.category,
        label: "Distance",
      },
      {
        value: startedAt.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Asia/Jakarta",
        }),
        label: "Started",
      },
    ],
  };
}

function mapCommunity(community: ApiCommunity): LandingCommunity {
  return {
    title: community.name,
    members: `${formatCompactNumber(community.member_count)} members`,
    description:
      community.description ??
      "A Puncak Travellers crew for shared healthy adventures.",
    href: `/communities/${community.slug}`,
    image: community.image_url ?? "/landing/community-runners.jpg",
    imageAlt: community.name,
  };
}

function mapGalleryImage(gallery: ApiGalleryWithImage): LandingGalleryImage {
  return {
    src: gallery.imageUrl,
    alt: gallery.imageAlt,
    label: gallery.title,
  };
}

function mapAccountProfile(user: ApiUser): AccountProfile {
  return {
    name: user.name,
    location: user.location ?? "Indonesia",
    memberSince: user.memberSince,
    crew: user.crew ?? "Puncak Travellers",
    avatarUrl: user.avatarUrl ?? undefined,
    role: user.role ?? undefined,
    stats: [
      { value: String(user.stats.eventsBooked), label: "Events booked" },
      { value: String(user.stats.completed), label: "Completed" },
      { value: String(user.stats.kilometersLogged), label: "KM logged" },
    ],
  };
}

function formatEventDate(startsAt: string, endsAt?: string): string {
  const start = new Date(startsAt);
  const startDay = start.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "Asia/Jakarta",
  });
  const startTime = start.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  });

  if (!endsAt) {
    return `${startDay} - ${startTime}`;
  }

  const end = new Date(endsAt);
  const endTime = end.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  });

  return `${startDay} - ${startTime}-${endTime}`;
}

function formatPrice(price: number | null | undefined): string {
  if (price === null || price === undefined || price === 0) {
    return "Free";
  }

  return new Intl.NumberFormat("id-ID", {
    currency: "IDR",
    maximumFractionDigits: 0,
    style: "currency",
  })
    .format(price)
    .replace("IDR", "Rp");
}

function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
    notation: "compact",
  }).format(value);
}
