import Image from "next/image";
import { Badge } from "@/components/landing/badge";
import { cn } from "@/lib/cn";

type PageHeroStat = {
  value: string;
  label: string;
};

type PageHeroProps = {
  eyebrow: string;
  title: string;
  lead: string;
  image?: string;
  imageAlt?: string;
  stats?: PageHeroStat[];
  children?: React.ReactNode;
  compact?: boolean;
  tone?: "light" | "dark";
};

export function PageHero({
  eyebrow,
  title,
  lead,
  image,
  imageAlt = "",
  stats,
  children,
  compact = false,
  tone = image ? "dark" : "light",
}: PageHeroProps) {
  return (
    <section
      className={cn(
        "page-hero js-page-hero",
        tone === "dark" && "page-hero-dark",
        compact && "page-hero-compact",
      )}
    >
      {image ? (
        <>
          <div className="page-hero-media js-hero-media">
            <Image
              src={image}
              alt={imageAlt}
              fill
              priority
              sizes="100vw"
              className="image-cover"
            />
          </div>
          <div className="page-hero-overlay" />
        </>
      ) : null}

      <div className="wrap page-hero-content">
        <div className="page-hero-copy">
          <Badge tone={tone === "dark" ? "light" : "orange"} className="js-hero-item">
            {eyebrow}
          </Badge>
          <h1 className="js-hero-item">{title}</h1>
          <p className="page-hero-lead js-hero-item">{lead}</p>
          {children ? <div className="page-hero-actions js-hero-item">{children}</div> : null}
        </div>

        {stats && stats.length > 0 ? (
          <div className="page-hero-stats js-hero-item">
            {stats.map((stat) => (
              <div key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
