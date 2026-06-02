import "server-only";

import type {
  LandingActivity,
  LandingCommunity,
  LandingEvent,
  LandingGalleryImage,
  LandingHeroStat,
  LandingLiveEvent,
} from "@/components/landing/types";

const API_TIMEOUT_MS = 8000;
const DEFAULT_API_BASE_URL = "http://api-puncak-traveller.test";

type ApiEnvelope<T> = {
  data: T;
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

type ApiPlace = {
  id: number;
  community_id: number;
  name: string;
  lat: number;
  lng: number;
  description: string | null;
};

type ApiEvent = {
  id: number;
  community_id: number;
  place_id: number | null;
  title: string;
  slug: string;
  description: string | null;
  activity_type: string;
  activity_label: string;
  distance_label: string | null;
  status: "past" | "ongoing" | "upcoming";
  starts_at: string;
  ends_at: string;
  starting_price?: number | null;
  cover_image: string | null;
  cover_image_url: string | null;
  participant_count?: number;
  community?: ApiCommunity;
  place?: ApiPlace;
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
  id: number;
  community_id: number;
  event_id: number | null;
  image_path: string;
  image_url: string;
  caption: string | null;
  community?: ApiCommunity;
  event?: ApiEvent;
};

type ApiLandingPayload = {
  hero_stats: ApiLandingStat[];
  upcoming_events: ApiEvent[];
  activities: ApiLandingActivity[];
  live_event: ApiEvent | null;
  communities: ApiCommunity[];
  gallery: ApiGallery[];
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
  trail_run: {
    tone: "orange",
    image: "/landing/community-runners.jpg",
    imageAlt: "Runners moving through a forest trail",
  },
  healthy_walk: {
    tone: "teal",
    image: "/landing/community-walkers.jpg",
    imageAlt: "Walkers following a mountain path together",
  },
  camping: {
    tone: "navy",
    image: "/landing/community-campers.jpg",
    imageAlt: "Camping tents set in a misty highland field",
  },
  wellness: {
    tone: "earth",
    image: "/landing/gallery-02.jpg",
    imageAlt: "A quiet mountain scene for wellness activities",
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

async function puncakApiFetch<T>(path: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const response = await fetch(buildApiUrl(path), {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
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

function buildApiUrl(path: string): string {
  const baseUrl = process.env.PUNCAK_API_BASE_URL ?? DEFAULT_API_BASE_URL;
  return new URL(path, baseUrl).toString();
}

function mapLandingPayload(payload: ApiLandingPayload): LandingPageData {
  const events = payload.upcoming_events.map(mapEvent);

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
    galleryImages: payload.gallery.map(mapGalleryImage),
  };
}

function mapEvent(event: ApiEvent): LandingEvent {
  return {
    title: event.title,
    category: event.activity_label,
    status: toTitleCase(event.status),
    date: formatEventDate(event.starts_at, event.ends_at),
    location: event.place?.name ?? event.community?.name ?? "Puncak region",
    price: formatPrice(event.starting_price),
    href: `/events/${event.slug}`,
    ctaHref: `/events/${event.slug}/booking`,
    image: event.cover_image_url ?? "/landing/trail-run.jpg",
    imageAlt: event.title,
  };
}

function mapActivity(activity: ApiLandingActivity): LandingActivity {
  const asset = activityAssets[activity.activity_type] ?? activityAssets.trail_run;
  const slug = activity.activity_type.replaceAll("_", "-");

  return {
    title: activity.activity_label,
    count: `${activity.upcoming_count} upcoming`,
    href: `/events?activity=${slug}`,
    image: asset.image,
    imageAlt: asset.imageAlt,
    tone: asset.tone,
  };
}

function mapLiveEvent(event: ApiEvent | null): LandingLiveEvent {
  if (!event) {
    return null;
  }

  const startedAt = new Date(event.starts_at);

  return {
    title: event.title,
    description:
      event.description ??
      `${event.activity_label} is happening now at ${event.place?.name ?? "the Puncak trail"}.`,
    href: `/events/${event.slug}/live`,
    recapHref: `/events/${event.slug}/recap`,
    image: event.cover_image_url ?? "/landing/live-trail.jpg",
    imageAlt: event.title,
    stats: [
      {
        value: formatCompactNumber(event.participant_count ?? 0),
        label: "On course",
      },
      {
        value: event.distance_label ?? event.activity_label,
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
      community.description ?? "A Puncak Travellers crew for shared healthy adventures.",
    href: `/communities/${community.slug}`,
    image: community.image_url ?? "/landing/community-runners.jpg",
    imageAlt: community.name,
  };
}

function mapGalleryImage(gallery: ApiGallery): LandingGalleryImage {
  return {
    src: gallery.image_url,
    alt: gallery.caption ?? gallery.event?.title ?? "Puncak Travellers gallery moment",
    label: gallery.caption ?? gallery.event?.title ?? gallery.community?.name ?? "Trail moment",
  };
}

function formatEventDate(startsAt: string, endsAt: string): string {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
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
  const endTime = end.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  });

  return `${startDay} · ${startTime}-${endTime}`;
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

function toTitleCase(value: string): string {
  return value
    .split("_")
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");
}
