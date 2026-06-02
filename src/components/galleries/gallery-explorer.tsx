"use client";

import { useMemo, useState } from "react";
import { ActionButton } from "@/components/ui/action-button";
import { GalleryCard } from "@/components/site/cards";
import type { ActivityType, GalleryItem } from "@/lib/reference-data";

type GalleryCategory = "all" | Exclude<ActivityType, "fun-run">;
type GalleryYear = "all" | "2026" | "2025";

const categoryOptions: Array<{ value: GalleryCategory; label: string }> = [
  { value: "all", label: "All" },
  { value: "trail-run", label: "Trail runs" },
  { value: "camping", label: "Camping" },
  { value: "walk", label: "Walks" },
  { value: "wellness", label: "Wellness" },
  { value: "hike", label: "Hikes" },
];

const yearOptions: Array<{ value: GalleryYear; label: string }> = [
  { value: "all", label: "All years" },
  { value: "2026", label: "2026" },
  { value: "2025", label: "2025" },
];

type GalleryExplorerProps = {
  galleryItems: GalleryItem[];
};

export function GalleryExplorer({ galleryItems }: GalleryExplorerProps) {
  const [category, setCategory] = useState<GalleryCategory>("all");
  const [year, setYear] = useState<GalleryYear>("all");

  const visibleItems = useMemo(
    () =>
      galleryItems.filter((item) => {
        const matchesCategory = category === "all" || item.category === category;
        const matchesYear = year === "all" || item.year === year;
        return matchesCategory && matchesYear;
      }),
    [category, galleryItems, year],
  );

  return (
    <section className="section gallery-page-section" aria-labelledby="gallery-grid-title">
      <div className="wrap">
        <div className="filter-groups gallery-filter-groups">
          <div className="filter-chips js-reveal" aria-label="Gallery category filters">
            {categoryOptions.map((option) => (
              <ActionButton
                key={option.value}
                size="sm"
                variant={category === option.value ? "primary" : "outline"}
                className="chip-button"
                aria-pressed={category === option.value}
                onClick={() => setCategory(option.value)}
              >
                {option.label}
              </ActionButton>
            ))}
          </div>

          <div className="filter-chips js-reveal" aria-label="Gallery year filters">
            {yearOptions.map((option) => (
              <ActionButton
                key={option.value}
                size="sm"
                variant={year === option.value ? "teal" : "outline"}
                className="chip-button"
                aria-pressed={year === option.value}
                onClick={() => setYear(option.value)}
              >
                {option.label}
              </ActionButton>
            ))}
          </div>
        </div>

        <div className="listing-header">
          <div>
            <p className="eyebrow eyebrow-teal">Community photos</p>
            <h2 id="gallery-grid-title">{visibleItems.length} trail moments</h2>
          </div>
        </div>

        {visibleItems.length > 0 ? (
          <div className="gallery-page-grid">
            {visibleItems.map((item, index) => (
              <GalleryCard key={item.id} item={item} featured={index === 0} />
            ))}
          </div>
        ) : (
          <div className="empty-panel js-reveal">
            <h2>No photos in this view</h2>
            <p>Try another category or year.</p>
          </div>
        )}

        <div className="load-more-row js-reveal">
          <ActionButton variant="outline">Load more photos</ActionButton>
        </div>
      </div>
    </section>
  );
}
