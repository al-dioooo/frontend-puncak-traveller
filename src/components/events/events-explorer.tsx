"use client";

import { useMemo, useState } from "react";
import { IconSearch } from "@tabler/icons-react";
import { ActionButton } from "@/components/ui/action-button";
import { EventListingCard } from "@/components/site/cards";
import {
  activityFilters,
  statusFilters,
  type ActivityType,
  type EventSummary,
  type EventStatus,
} from "@/lib/reference-data";
import { cn } from "@/lib/cn";

type SortMode = "date" | "price" | "spots";

const sortOptions: Array<{ value: SortMode; label: string }> = [
  { value: "date", label: "Newest" },
  { value: "price", label: "Price" },
  { value: "spots", label: "Spots" },
];

const statusSortRank: Record<EventStatus, number> = {
  upcoming: 0,
  ongoing: 1,
  completed: 2,
};

function getApproxPrice(priceLabel: string) {
  if (priceLabel.toLowerCase().includes("free")) return 0;
  const match = priceLabel.match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}

function getApproxSpots(spotsLabel: string) {
  const match = spotsLabel.match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}

type EventsExplorerProps = {
  events: EventSummary[];
};

export function EventsExplorer({ events }: EventsExplorerProps) {
  const [query, setQuery] = useState("West Java");
  const [status, setStatus] = useState<EventStatus | "all">("all");
  const [activity, setActivity] = useState<ActivityType>("all");
  const [sort, setSort] = useState<SortMode>("date");

  const visibleEvents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return [...events]
      .filter((event) => status === "all" || event.status === status)
      .filter((event) => activity === "all" || event.activity === activity)
      .filter((event) => {
        if (!normalizedQuery) return true;
        return [
          event.title,
          event.category,
          event.location,
          event.region,
          event.statusLabel,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      })
      .sort((a, b) => {
        const statusDelta = statusSortRank[a.status] - statusSortRank[b.status];

        if (statusDelta !== 0) {
          return statusDelta;
        }

        if (sort === "price") {
          const priceDelta = getApproxPrice(a.priceLabel) - getApproxPrice(b.priceLabel);

          if (priceDelta !== 0) {
            return priceDelta;
          }
        }
        if (sort === "spots") {
          const spotsDelta = getApproxSpots(b.spotsLabel) - getApproxSpots(a.spotsLabel);

          if (spotsDelta !== 0) {
            return spotsDelta;
          }
        }
        return events.indexOf(a) - events.indexOf(b);
      });
  }, [activity, events, query, sort, status]);

  return (
    <section className="section listing-section" aria-labelledby="events-results-title">
      <div className="wrap">
        <div className="filter-panel js-reveal">
          <label className="search-field">
            <IconSearch aria-hidden size={18} />
            <span className="sr-only">Search events</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search city, route, or event"
            />
          </label>

          <label className="select-field">
            <span>Sort</span>
            <select value={sort} onChange={(event) => setSort(event.target.value as SortMode)}>
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="filter-groups">
          <div className="filter-chips js-reveal" aria-label="Event status filters">
            {statusFilters.map((item) => {
              const count =
                item.value === "all"
                  ? events.length
                  : events.filter((event) => event.status === item.value).length;

              return (
                <ActionButton
                  key={item.value}
                  size="sm"
                  variant={status === item.value ? "primary" : "outline"}
                  className={cn("chip-button", status === item.value && "chip-button-active")}
                  aria-pressed={status === item.value}
                  onClick={() => setStatus(item.value)}
                >
                  {item.label} {count}
                </ActionButton>
              );
            })}
          </div>

          <div className="filter-chips js-reveal" aria-label="Activity filters">
            {activityFilters.map((item) => (
              <ActionButton
                key={item.value}
                size="sm"
                variant={activity === item.value ? "teal" : "outline"}
                className="chip-button"
                aria-pressed={activity === item.value}
                onClick={() => setActivity(item.value)}
              >
                {item.label}
              </ActionButton>
            ))}
          </div>
        </div>

        <div className="listing-header">
          <div>
            <p className="eyebrow eyebrow-teal">Showing results</p>
            <h2 id="events-results-title">
              {visibleEvents.length} events{query ? ` in ${query}` : ""}
            </h2>
          </div>
        </div>

        {visibleEvents.length > 0 ? (
          <div className="listing-grid">
            {visibleEvents.map((event) => (
              <EventListingCard key={event.slug} event={event} />
            ))}
          </div>
        ) : (
          <div className="empty-panel js-reveal">
            <h2>No matching adventures</h2>
            <p>Try a broader search, another activity, or the all-events filter.</p>
          </div>
        )}

        <div className="load-more-row js-reveal">
          <ActionButton variant="outline">Load more events</ActionButton>
        </div>
      </div>
    </section>
  );
}
