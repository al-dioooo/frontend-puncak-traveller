import type { Metadata } from "next";
import { EventsExplorer } from "@/components/events/events-explorer";
import { PublicPageShell } from "@/components/site/public-page-shell";
import { PageHero } from "@/components/site/page-hero";
import { getEvents } from "@/lib/puncak-api";

export const metadata: Metadata = {
  title: "Events | Puncak Travellers",
  description:
    "Browse past, ongoing, and upcoming Puncak Travellers events across Indonesia's highlands.",
};

export default async function EventsPage() {
  const events = await getEvents();
  const upcoming = events.filter((event) => event.status === "upcoming").length;
  const ongoing = events.filter((event) => event.status === "ongoing").length;
  const past = events.filter((event) => event.status === "completed").length;

  return (
    <PublicPageShell>
      <PageHero
        eyebrow="Events"
        title="Find your next adventure"
        lead="Browse every Puncak event - past, happening now, and upcoming. Filter by activity or community."
        stats={[
          { value: String(events.length), label: "All events" },
          { value: String(upcoming), label: "Upcoming" },
          { value: String(ongoing), label: "Happening now" },
          { value: String(past), label: "Past events" },
        ]}
      />
      <EventsExplorer events={events} />
    </PublicPageShell>
  );
}
