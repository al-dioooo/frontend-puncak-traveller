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

export default function Home() {
  return (
    <SmoothScrollProvider>
      <Header />
      <main className="landing-main">
        <HeroSection />
        <EventsSection />
        <ActivitiesSection />
        <LiveEventSection />
        <CommunitiesSection />
        <BookingStepsSection />
        <GallerySection />
        <FinalCtaSection />
      </main>
      <Footer />
    </SmoothScrollProvider>
  );
}
