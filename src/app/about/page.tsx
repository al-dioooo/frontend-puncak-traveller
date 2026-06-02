import type { Metadata } from "next";
import { IconArrowRight } from "@tabler/icons-react";
import { ButtonLink } from "@/components/landing/button-link";
import { PublicPageShell } from "@/components/site/public-page-shell";
import { PageHero } from "@/components/site/page-hero";
import { FeatureCard, StatCard } from "@/components/site/cards";
import { aboutStats, values } from "@/lib/reference-data";

export const metadata: Metadata = {
  title: "About | Puncak Travellers",
  description:
    "Learn why Puncak Travellers brings people to Indonesia's mountain trails, healthy walks, camps, and outdoor communities.",
};

export default function AboutPage() {
  return (
    <PublicPageShell>
      <PageHero
        eyebrow="Our story"
        title="We bring people to the mountains - and to each other."
        lead="Puncak Travellers started in 2024 with one Sunday morning run up Pangrango. Today we are 18,000 members strong."
        image="/pages/about-hero.jpg"
        imageAlt="A warm highland mountain landscape at sunrise"
      >
        <ButtonLink href="/events" size="lg" icon={IconArrowRight}>
          Join the community
        </ButtonLink>
      </PageHero>

      <section id="community" className="section about-story-section">
        <div className="wrap about-story-grid">
          <div className="about-story-copy js-reveal">
            <p className="eyebrow eyebrow-teal">Why we exist</p>
            <h2>Healthy adventure, open to everyone.</h2>
          </div>
          <div className="about-story-body js-reveal">
            <p>
              We believe the best version of yourself is found outdoors, in good company.
              So we organise fun runs, healthy walks, and camping trips across Indonesia&apos;s
              highlands - friendly events where showing up matters more than being fast.
            </p>
            <p>
              From a single trail crew to a family of sub-communities - Puncak Runners,
              Campers, and Walkers - we&apos;re building the warmest outdoor community in the
              archipelago.
            </p>
          </div>
        </div>
      </section>

      <section className="section values-section" aria-labelledby="values-title">
        <div className="wrap">
          <div className="section-heading">
            <div>
              <p className="eyebrow">What we stand for</p>
              <h2 id="values-title">Four trail rules we live by</h2>
            </div>
          </div>
          <div className="feature-grid">
            {values.map((value, index) => (
              <FeatureCard
                key={value.title}
                title={value.title}
                description={value.description}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="section stats-band" aria-labelledby="about-stats-title">
        <div className="wrap">
          <div className="section-heading section-heading-center">
            <div>
              <p className="eyebrow eyebrow-teal">The movement so far</p>
              <h2 id="about-stats-title">More people, more trails, better weekends.</h2>
            </div>
          </div>
          <div className="stats-grid">
            {aboutStats.map((stat) => (
              <StatCard key={stat.label} value={stat.value} label={stat.label} />
            ))}
          </div>
        </div>
      </section>
    </PublicPageShell>
  );
}
