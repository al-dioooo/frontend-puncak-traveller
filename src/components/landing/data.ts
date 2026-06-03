export const navLinks = [
  { label: "Home", href: "/" },
  { label: "Events", href: "/events" },
  { label: "Galleries", href: "/galleries" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export const heroStats = [
  { value: "18K+", label: "Active members" },
  { value: "240+", label: "Events hosted" },
  { value: "52", label: "Mountain regions" },
  { value: "4.9★", label: "Member rating" },
] as const;

export const events = [
  {
    title: "Puncak Trail Run 2026",
    category: "Trail Run",
    status: "Upcoming",
    date: "Sat, 14 Jun · 06:00",
    location: "Gunung Pangrango, Bogor",
    price: "Rp 185K",
    href: "/events/puncak-trail-run-2026",
    ctaHref: "/events/puncak-trail-run-2026/booking",
    image: "/landing/trail-run.jpg",
    imageAlt: "Trail runners crossing a misty highland ridge near Bogor",
  },
  {
    title: "Sunrise Healthy Walk",
    category: "Walk",
    status: "Upcoming",
    date: "Sun, 22 Jun · 05:30",
    location: "Kebun Raya Cibodas",
    price: "Free",
    href: "/events/sunrise-healthy-walk",
    ctaHref: "/events/sunrise-healthy-walk/booking",
    image: "/landing/sunrise-walk.jpg",
    imageAlt: "A warm sunrise over a quiet mountain walking route",
  },
  {
    title: "Highland Camp & Bonfire",
    category: "Camping",
    status: "Upcoming",
    date: "Fri-Sun, 4-6 Jul",
    location: "Ranca Upas, Ciwidey",
    price: "Rp 320K",
    href: "/events/highland-camp-bonfire",
    ctaHref: "/events/highland-camp-bonfire/booking",
    image: "/landing/camp-bonfire.jpg",
    imageAlt: "Campers gathering near tents in a green highland campsite",
  },
] as const;

export const activities = [
  {
    title: "Trail Runs",
    count: "12 upcoming",
    href: "/events?activity=trail-runs",
    image: "/landing/community-runners.jpg",
    imageAlt: "Runners moving through a forest trail",
    tone: "orange",
  },
  {
    title: "Healthy Walks",
    count: "8 upcoming",
    href: "/events?activity=healthy-walks",
    image: "/landing/community-walkers.jpg",
    imageAlt: "Walkers following a mountain path together",
    tone: "teal",
  },
  {
    title: "Camping",
    count: "5 upcoming",
    href: "/events?activity=camping",
    image: "/landing/community-campers.jpg",
    imageAlt: "Camping tents set in a misty highland field",
    tone: "navy",
  },
  {
    title: "Wellness",
    count: "6 upcoming",
    href: "/events?activity=wellness",
    image: "/events/mindful-mountain-yoga.jpg",
    imageAlt: "A quiet mountain scene for wellness activities",
    tone: "earth",
  },
] as const;

export const liveStats = [
  { value: "480", label: "On course" },
  { value: "10K", label: "Distance" },
  { value: "07:00", label: "Started" },
] as const;

export const communities = [
  {
    title: "Puncak Runners",
    members: "3.2K members",
    description: "Trail & road runners chasing sunrise summits.",
    href: "/communities/puncak-runners",
    image: "/landing/community-runners.jpg",
    imageAlt: "Puncak Runners community on a mountain trail",
  },
  {
    title: "Puncak Campers",
    members: "1.8K members",
    description: "Weekend camps, bonfires & stargazing.",
    href: "/communities/puncak-campers",
    image: "/landing/community-campers.jpg",
    imageAlt: "Puncak Campers tents in a highland camping area",
  },
  {
    title: "Puncak Walkers",
    members: "2.4K members",
    description: "Gentle highland walks for every pace.",
    href: "/communities/puncak-walkers",
    image: "/landing/community-walkers.jpg",
    imageAlt: "Puncak Walkers moving across a green highland path",
  },
] as const;

export const bookingSteps = [
  {
    number: "01",
    title: "Find your adventure",
    description:
      "Browse events by activity, community, or date - past, ongoing, and upcoming.",
  },
  {
    number: "02",
    title: "Reserve your spot",
    description:
      "Pick your ticket, sign in with Google, and book in seconds. We never oversell.",
  },
  {
    number: "03",
    title: "Show up & thrive",
    description:
      "Get your QR ticket, meet the community, and reach the puncak together.",
  },
] as const;

export const footerGroups = [
  {
    title: "Upcoming events",
    links: [
      { label: "Trail runs", href: "/events?activity=trail-runs" },
      { label: "Camping trips", href: "/events?activity=camping" },
      { label: "Healthy walks", href: "/events?activity=healthy-walks" },
      { label: "Galleries", href: "/galleries" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Puncak Runners", href: "/about#community" },
      { label: "Puncak Campers", href: "/about#community" },
      { label: "Become a member", href: "/login" },
      { label: "Volunteer", href: "/contact" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help center", href: "/help" },
      { label: "Contact us", href: "/contact" },
      { label: "Booking policy", href: "/booking-policy" },
      { label: "Safety on trail", href: "/safety" },
    ],
  },
] as const;
