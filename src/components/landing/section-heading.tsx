import { cn } from "@/lib/cn";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  lead?: string;
  action?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
  eyebrowTone?: "orange" | "teal" | "light";
};

export function SectionHeading({
  eyebrow,
  title,
  lead,
  action,
  align = "left",
  className,
  eyebrowTone = "orange",
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "section-heading js-reveal",
        align === "center" && "section-heading-center",
        className,
      )}
    >
      <div>
        {eyebrow ? (
          <p className={cn("eyebrow", `eyebrow-${eyebrowTone}`)}>{eyebrow}</p>
        ) : null}
        <h2>{title}</h2>
        {lead ? <p className="section-lead">{lead}</p> : null}
      </div>
      {action ? <div className="section-action">{action}</div> : null}
    </div>
  );
}

