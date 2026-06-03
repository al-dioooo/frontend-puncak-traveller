export type EventStatus = "upcoming" | "ongoing" | "completed";

export type ActivityType =
  | "all"
  | "trail-run"
  | "walk"
  | "camping"
  | "hike"
  | "wellness"
  | "fun-run";

export type EventTicketTier = {
  id: string;
  name: string;
  description: string;
  price: number;
  priceLabel: string;
  stock: number;
  capacityLabel: string;
};

export type EventSummary = {
  slug: string;
  title: string;
  category: string;
  activity: ActivityType;
  status: EventStatus;
  statusLabel: string;
  createdAt?: string;
  date: string;
  fullDate: string;
  time: string;
  location: string;
  region: string;
  priceLabel: string;
  spotsLabel: string;
  image: string;
  imageAlt: string;
  detailHref: string;
  bookingHref: string;
  recapHref?: string;
};

export type EventDetail = EventSummary & {
  organiser: {
    name: string;
    description: string;
    eventsHosted: number;
    href: string;
  };
  distanceLabel: string;
  elevationLabel: string;
  difficulty: string;
  summary: string[];
  includes: string[];
  schedule: Array<{
    time: string;
    title: string;
  }>;
  venueName: string;
  venueDescription: string;
  tickets: EventTicketTier[];
};

export type GalleryItem = {
  id: string;
  title: string;
  event: string;
  category: Exclude<ActivityType, "all" | "fun-run"> | "trail-run";
  year: "2026" | "2025";
  image: string;
  imageAlt: string;
};

export type AccountBooking = {
  id: string;
  status: "upcoming" | "past" | "saved";
  badge: string;
  title: string;
  date: string;
  location: string;
  reference: string;
  paymentStatus?: string;
  ticketLabel: string;
  primaryAction: string;
  primaryHref?: string;
  secondaryAction?: string;
  secondaryHref?: string;
};

export type ContactMethod = {
  title: string;
  value: string;
  description: string;
};

export const bookingFee = 5000;

export const authReturnParam = "return_to";

export const statusFilters: Array<{
  value: EventStatus | "all";
  label: string;
}> = [
  { value: "all", label: "All" },
  { value: "upcoming", label: "Upcoming" },
  { value: "ongoing", label: "Happening now" },
  { value: "completed", label: "Past" },
];

export const activityFilters: Array<{
  value: ActivityType;
  label: string;
}> = [
  { value: "all", label: "All activities" },
  { value: "trail-run", label: "Trail runs" },
  { value: "walk", label: "Walks" },
  { value: "camping", label: "Camping" },
  { value: "hike", label: "Hikes" },
  { value: "wellness", label: "Wellness" },
];

export const events: EventSummary[] = [
  {
    slug: "puncak-trail-run-2026",
    title: "Puncak Trail Run 2026",
    category: "Trail Run",
    activity: "trail-run",
    status: "upcoming",
    statusLabel: "Upcoming",
    date: "Sat, 14 Jun - 06:00",
    fullDate: "Saturday, 14 June 2026",
    time: "Flag-off 06:00 WIB",
    location: "Gunung Pangrango, Bogor",
    region: "West Java",
    priceLabel: "From Rp 185K",
    spotsLabel: "42 spots left",
    image: "/events/puncak-trail-run-2026.jpg",
    imageAlt: "Trail runners crossing a misty highland ridge near Bogor",
    detailHref: "/events/puncak-trail-run-2026",
    bookingHref: "/events/puncak-trail-run-2026/booking",
  },
  {
    slug: "sunrise-healthy-walk",
    title: "Sunrise Healthy Walk",
    category: "Walk",
    activity: "walk",
    status: "upcoming",
    statusLabel: "Upcoming",
    date: "Sun, 22 Jun - 05:30",
    fullDate: "Sunday, 22 June 2026",
    time: "Start 05:30 WIB",
    location: "Kebun Raya Cibodas",
    region: "West Java",
    priceLabel: "From Free",
    spotsLabel: "120 spots left",
    image: "/events/sunrise-healthy-walk.jpg",
    imageAlt: "A warm sunrise over a quiet mountain walking route",
    detailHref: "/events/sunrise-healthy-walk",
    bookingHref: "/events/sunrise-healthy-walk/booking",
  },
  {
    slug: "highland-camp-bonfire",
    title: "Highland Camp & Bonfire",
    category: "Camping",
    activity: "camping",
    status: "upcoming",
    statusLabel: "Upcoming",
    date: "Fri-Sun, 4-6 Jul",
    fullDate: "Friday-Sunday, 4-6 July 2026",
    time: "Check-in 15:00 WIB",
    location: "Ranca Upas, Ciwidey",
    region: "West Java",
    priceLabel: "From Rp 320K",
    spotsLabel: "18 spots left",
    image: "/events/highland-camp-bonfire.jpg",
    imageAlt: "Campers gathering near tents in a green highland campsite",
    detailHref: "/events/highland-camp-bonfire",
    bookingHref: "/events/highland-camp-bonfire/booking",
  },
  {
    slug: "forest-fun-run-10k",
    title: "Forest Fun Run 10K",
    category: "Fun Run",
    activity: "fun-run",
    status: "ongoing",
    statusLabel: "Happening now",
    date: "Today - 07:00",
    fullDate: "Happening today",
    time: "Started 07:00 WIB",
    location: "Taman Hutan Raya, Bandung",
    region: "West Java",
    priceLabel: "From Rp 120K",
    spotsLabel: "Sold out",
    image: "/events/forest-fun-run.jpg",
    imageAlt: "Runners moving through a forest route during a live event",
    detailHref: "/events/forest-fun-run-10k",
    bookingHref: "/events/forest-fun-run-10k/booking",
  },
  {
    slug: "misty-ridge-hike",
    title: "Misty Ridge Hike",
    category: "Hike",
    activity: "hike",
    status: "upcoming",
    statusLabel: "Upcoming",
    date: "Sat, 28 Jun - 06:30",
    fullDate: "Saturday, 28 June 2026",
    time: "Start 06:30 WIB",
    location: "Gunung Papandayan",
    region: "West Java",
    priceLabel: "From Rp 150K",
    spotsLabel: "30 spots left",
    image: "/events/misty-ridge-hike.jpg",
    imageAlt: "A mountain ridge path covered with soft morning mist",
    detailHref: "/events/misty-ridge-hike",
    bookingHref: "/events/misty-ridge-hike/booking",
  },
  {
    slug: "mindful-mountain-yoga",
    title: "Mindful Mountain Yoga",
    category: "Wellness",
    activity: "wellness",
    status: "upcoming",
    statusLabel: "Upcoming",
    date: "Sun, 29 Jun - 07:00",
    fullDate: "Sunday, 29 June 2026",
    time: "Start 07:00 WIB",
    location: "Bukit Moko, Bandung",
    region: "West Java",
    priceLabel: "From Rp 95K",
    spotsLabel: "25 spots left",
    image: "/events/mindful-mountain-yoga.jpg",
    imageAlt: "A quiet highland view used for morning wellness activities",
    detailHref: "/events/mindful-mountain-yoga",
    bookingHref: "/events/mindful-mountain-yoga/booking",
  },
  {
    slug: "puncak-pass-half-marathon",
    title: "Puncak Pass Half Marathon",
    category: "Trail Run",
    activity: "trail-run",
    status: "completed",
    statusLabel: "Completed",
    date: "Sun, 11 May - 06:00",
    fullDate: "Sunday, 11 May 2026",
    time: "Finished 08:14 WIB",
    location: "Puncak Pass, Cianjur",
    region: "West Java",
    priceLabel: "From Rp 200K",
    spotsLabel: "480 finishers",
    image: "/events/puncak-pass-half-marathon.jpg",
    imageAlt: "A running community gathered on a mountain road",
    detailHref: "/events/puncak-pass-half-marathon",
    bookingHref: "/events/puncak-pass-half-marathon/booking",
    recapHref: "/events/puncak-pass-half-marathon/recap",
  },
  {
    slug: "lakeside-camp-weekend",
    title: "Lakeside Camp Weekend",
    category: "Camping",
    activity: "camping",
    status: "completed",
    statusLabel: "Completed",
    date: "Apr 18-20",
    fullDate: "18-20 April 2026",
    time: "Weekend camp",
    location: "Situ Patenggang",
    region: "West Java",
    priceLabel: "From Rp 280K",
    spotsLabel: "96 finishers",
    image: "/events/lakeside-camp-weekend.jpg",
    imageAlt: "Camping tents in a highland morning field",
    detailHref: "/events/lakeside-camp-weekend",
    bookingHref: "/events/lakeside-camp-weekend/booking",
    recapHref: "/events/lakeside-camp-weekend/recap",
  },
];

export const eventDetails: EventDetail[] = [
  {
    ...events[0],
    organiser: {
      name: "Puncak Runners",
      description: "Organiser - 86 events hosted",
      eventsHosted: 86,
      href: "/communities/puncak-runners",
    },
    distanceLabel: "21K - 10K - 5K",
    elevationLabel: "+1,250 m gain",
    difficulty: "Moderate-hard",
    venueName: "Pangrango Base Camp, Bogor",
    venueDescription:
      "A marked mountain route through pine forest, tea plantations, and misty ridgelines.",
    summary: [
      "Halo, trail lovers! Puncak Trail Run 2026 returns to the slopes of Gunung Pangrango for our biggest sunrise edition yet.",
      "Wind through pine forest, tea plantations and misty ridgelines on a fully-marked, community-supported course, then celebrate at the finish with brunch and good company.",
      "Whether you are chasing a 21K personal best or walking the 5K with family, there is a distance for every pace. All proceeds support trail conservation in the Pangrango national park.",
    ],
    includes: [
      "Race bib & timing chip",
      "Finisher medal & e-certificate",
      "Eco race pack with no single-use plastic",
      "Trail marshals & medical support",
      "Free event photos",
      "Refreshments at the finish",
    ],
    schedule: [
      { time: "04:30", title: "Gate & check-in opens" },
      { time: "05:45", title: "Warm-up & briefing" },
      { time: "06:00", title: "21K flag-off" },
      { time: "06:15", title: "10K & 5K flag-off" },
      { time: "09:30", title: "Awards & community brunch" },
    ],
    tickets: [
      {
        id: "21k",
        name: "21K Mountain Trail",
        description: "Timed - finisher medal - trail support",
        price: 185000,
        priceLabel: "Rp 185K",
        stock: 42,
        capacityLabel: "42 left",
      },
      {
        id: "10k",
        name: "10K Forest Loop",
        description: "Timed - finisher medal",
        price: 150000,
        priceLabel: "Rp 150K",
        stock: 88,
        capacityLabel: "88 left",
      },
      {
        id: "5k",
        name: "5K Family Fun",
        description: "Untimed - open to all ages",
        price: 95000,
        priceLabel: "Rp 95K",
        stock: 110,
        capacityLabel: "110 left",
      },
    ],
  },
];

export const aboutStats = [
  { value: "18,400", label: "Active members" },
  { value: "240+", label: "Events hosted" },
  { value: "52", label: "Mountain regions" },
  { value: "Rp 1.2B", label: "Raised for trails" },
];

export const values = [
  {
    title: "Health first",
    description:
      "Every event is built around movement, fresh air, and feeling good - not finish times.",
  },
  {
    title: "Leave no trace",
    description:
      "Eco race packs, zero single-use, and conservation built into every ticket.",
  },
  {
    title: "Community over clock",
    description:
      "We grow together. Beginners and veterans share the same trail and the same brunch.",
  },
  {
    title: "Respect the puncak",
    description:
      "Local guides, fair pay, and deep respect for the mountains and villages that host us.",
  },
];

export const accountProfile = {
  name: "Alex Puncak",
  location: "Bandung, ID",
  memberSince: "2024",
  crew: "Puncak Runners",
  avatarInitials: "AP",
  stats: [
    { value: "14", label: "Events booked" },
    { value: "11", label: "Completed" },
    { value: "286", label: "KM logged" },
  ],
};

export const accountBookings: AccountBooking[] = [
  {
    id: "PTR-26-8F3K2A",
    status: "upcoming",
    badge: "Upcoming in 13 days",
    title: "Puncak Trail Run 2026",
    date: "Sat, 14 Jun 2026 - 06:00",
    location: "Gunung Pangrango, Bogor",
    reference: "PTR-26-8F3K2A",
    ticketLabel: "Tickets 2 - 21K + 5K",
    primaryAction: "View ticket",
    secondaryAction: "Manage booking",
  },
  {
    id: "PTC-26-2M9X1B",
    status: "upcoming",
    badge: "Upcoming in 33 days",
    title: "Highland Camp & Bonfire",
    date: "Fri-Sun, 4-6 Jul 2026",
    location: "Ranca Upas, Ciwidey",
    reference: "PTC-26-2M9X1B",
    ticketLabel: "Tickets 1 - Weekend pass",
    primaryAction: "View ticket",
    secondaryAction: "Manage booking",
  },
  {
    id: "PHM-26-7K2P0Q",
    status: "past",
    badge: "Finished - 2:14:08",
    title: "Puncak Pass Half Marathon",
    date: "Sun, 11 May 2026",
    location: "Puncak Pass, Cianjur",
    reference: "PHM-26-7K2P0Q",
    ticketLabel: "Tickets 1 - 21K",
    primaryAction: "Certificate",
    secondaryAction: "View recap",
  },
  {
    id: "SAVED-MISTY",
    status: "saved",
    badge: "Saved",
    title: "Misty Ridge Hike",
    date: "Sat, 28 Jun 2026 - 06:30",
    location: "Gunung Papandayan",
    reference: "Saved event",
    ticketLabel: "30 spots left",
    primaryAction: "Book ticket",
  },
];

export const contactMethods: ContactMethod[] = [
  {
    title: "Email us",
    value: "halo@puncaktravellers.id",
    description: "For event questions, partnerships, and media.",
  },
  {
    title: "WhatsApp",
    value: "+62 812 3456 7890",
    description: "Fast help before race day or camp check-in.",
  },
  {
    title: "Find us",
    value: "Jl. Pajajaran No.12, Bogor, West Java",
    description: "Our base for crew meetups and event briefings.",
  },
];

export function getEventBySlug(slug: string): EventDetail | EventSummary | undefined {
  return eventDetails.find((event) => event.slug === slug) ?? events.find((event) => event.slug === slug);
}

export function getEventDetailBySlug(slug: string): EventDetail | undefined {
  const detail = eventDetails.find((event) => event.slug === slug);

  if (detail) {
    return detail;
  }

  const summary = events.find((event) => event.slug === slug);
  if (!summary) {
    return undefined;
  }

  return {
    ...summary,
    organiser: {
      name: "Puncak Travellers",
      description: "Organiser - community adventure host",
      eventsHosted: 240,
      href: "/about",
    },
    distanceLabel: summary.category,
    elevationLabel: "Community-supported route",
    difficulty: "Friendly pace",
    venueName: summary.location,
    venueDescription: "Full route notes will be shared with registered participants.",
    summary: [
      `${summary.title} is part of the Puncak Travellers calendar for healthy highland adventures.`,
      "Book your spot, meet the crew, and enjoy a well-supported outdoor day in West Java.",
    ],
    includes: [
      "Community host and route briefing",
      "Trail support and safety coordination",
      "Shared event photos",
      "Participant updates before event day",
    ],
    schedule: [
      { time: "05:30", title: "Meet the crew" },
      { time: "06:00", title: "Briefing and warm-up" },
      { time: "06:30", title: "Route starts" },
      { time: "09:00", title: "Community cool-down" },
    ],
    tickets: [
      {
        id: "general",
        name: "General Entry",
        description: "Standard participant access",
        price: summary.priceLabel.includes("Free") ? 0 : 150000,
        priceLabel: summary.priceLabel.includes("Free") ? "Free" : "Rp 150K",
        stock: summary.spotsLabel.includes("Sold out") ? 0 : 24,
        capacityLabel: summary.spotsLabel,
      },
    ],
  };
}

export function formatRupiah(value: number): string {
  if (value === 0) {
    return "Free";
  }

  return new Intl.NumberFormat("id-ID", {
    currency: "IDR",
    maximumFractionDigits: 0,
    style: "currency",
  })
    .format(value)
    .replace("IDR", "Rp");
}

export function getBookingReference(): string {
  return `PTR-26-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}
