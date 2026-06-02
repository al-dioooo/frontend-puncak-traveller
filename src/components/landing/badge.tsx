import type { ComponentType } from "react";
import type { IconProps } from "@tabler/icons-react";
import { cn } from "@/lib/cn";

type BadgeTone = "orange" | "teal" | "navy" | "cream" | "light";

type BadgeProps = {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
  icon?: ComponentType<IconProps>;
};

export function Badge({
  children,
  tone = "orange",
  className,
  icon: Icon,
}: BadgeProps) {
  return (
    <span className={cn("badge", `badge-${tone}`, className)}>
      {Icon ? <Icon aria-hidden size={14} stroke={2} /> : null}
      {children}
    </span>
  );
}

type MetaItemProps = {
  children: React.ReactNode;
  icon: ComponentType<IconProps>;
  className?: string;
};

export function MetaItem({ children, icon: Icon, className }: MetaItemProps) {
  return (
    <span className={cn("meta-item", className)}>
      <Icon aria-hidden size={16} stroke={2} />
      {children}
    </span>
  );
}

