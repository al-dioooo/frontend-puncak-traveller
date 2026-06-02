import { Footer } from "@/components/landing/footer";
import { Header } from "@/components/landing/header";
import {
  ActivitiesSection,
  BookingStepsSection,
  CommunitiesSection,
  EventsSection,
  FinalCtaSection,
  GallerySection,
  HeroSection,
  LiveEventSection,
} from "@/components/landing/sections";
import { SmoothScrollProvider } from "@/components/landing/smooth-scroll-provider";
import { getLandingPageData } from "@/lib/puncak-api";
import { connection } from "next/server";

export default async function Home() {
  await connection();
  const landing = await getLandingPageData();

  return (
    <SmoothScrollProvider>
      <Header />
      <main className="landing-main">
        <HeroSection
          stats={landing.heroStats}
          upcomingEventsCount={landing.upcomingEventsCount}
        />
        <EventsSection events={landing.events} />
        <ActivitiesSection activities={landing.activities} />
        <LiveEventSection liveEvent={landing.liveEvent} />
        <CommunitiesSection communities={landing.communities} />
        <BookingStepsSection />
        <GallerySection images={landing.galleryImages} />
        <FinalCtaSection />
      </main>
      <Footer />
    </SmoothScrollProvider>
  );
}
