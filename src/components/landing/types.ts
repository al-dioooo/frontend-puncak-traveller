export type LandingHeroStat = {
  value: string;
  label: string;
};

export type LandingEvent = {
  title: string;
  category: string;
  status: string;
  date: string;
  location: string;
  price: string;
  href: string;
  ctaHref: string;
  image: string;
  imageAlt: string;
};

export type LandingActivity = {
  title: string;
  count: string;
  href: string;
  image: string;
  imageAlt: string;
  tone: "orange" | "teal" | "navy" | "earth";
};

export type LandingLiveStat = {
  value: string;
  label: string;
};

export type LandingLiveEvent = {
  title: string;
  description: string;
  href: string;
  recapHref: string;
  image: string;
  imageAlt: string;
  stats: LandingLiveStat[];
} | null;

export type LandingCommunity = {
  title: string;
  members: string;
  description: string;
  href: string;
  image: string;
  imageAlt: string;
};

export type LandingGalleryImage = {
  src: string;
  alt: string;
  label: string;
};
