import Link from "next/link";
import type { ComponentType } from "react";
import type { IconProps } from "@tabler/icons-react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "light" | "outline" | "ghost" | "teal";
type ButtonSize = "sm" | "md" | "lg";

type ButtonLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ComponentType<IconProps>;
  iconPosition?: "left" | "right";
  ariaLabel?: string;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "btn-primary",
  light: "btn-light",
  outline: "btn-outline",
  ghost: "btn-ghost",
  teal: "btn-teal",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "btn-sm",
  md: "btn-md",
  lg: "btn-lg",
};

export function ButtonLink({
  href,
  children,
  className,
  variant = "primary",
  size = "md",
  icon: Icon,
  iconPosition = "right",
  ariaLabel,
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={cn(
        "btn motion-control",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
    >
      {Icon && iconPosition === "left" ? <Icon aria-hidden size={18} /> : null}
      <span>{children}</span>
      {Icon && iconPosition === "right" ? <Icon aria-hidden size={18} /> : null}
    </Link>
  );
}

