import type { Metadata } from "next";
import { GalleryExplorer } from "@/components/galleries/gallery-explorer";
import { PublicPageShell } from "@/components/site/public-page-shell";
import { PageHero } from "@/components/site/page-hero";
import { getGalleryItems } from "@/lib/puncak-api";

export const metadata: Metadata = {
  title: "Galleries | Puncak Travellers",
  description:
    "Explore Puncak Travellers community photos from sunrise trails, camps, wellness sessions, and highland hikes.",
};

export default async function GalleriesPage() {
  const galleryItems = await getGalleryItems();
  const activities = new Set(galleryItems.map((item) => item.category)).size;
  const years = new Set(galleryItems.map((item) => item.year)).size;

  return (
    <PublicPageShell>
      <PageHero
        eyebrow="Galleries"
        title="Moments at the puncak"
        lead="Every sunrise, summit and finish line - captured by our community photographers."
        stats={[
          { value: String(galleryItems.length), label: "Photos" },
          { value: String(activities), label: "Activities" },
          { value: String(years), label: "Years" },
        ]}
      />
      <GalleryExplorer galleryItems={galleryItems} />
    </PublicPageShell>
  );
}
