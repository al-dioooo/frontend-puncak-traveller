import type { ButtonHTMLAttributes, ComponentType } from "react";
import type { IconProps } from "@tabler/icons-react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "light" | "outline" | "ghost" | "teal";
type ButtonSize = "sm" | "md" | "lg";

type ActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ComponentType<IconProps>;
  iconPosition?: "left" | "right";
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

export function ActionButton({
  children,
  className,
  variant = "primary",
  size = "md",
  icon: Icon,
  iconPosition = "right",
  type = "button",
  ...props
}: ActionButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "btn motion-control",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      {Icon && iconPosition === "left" ? <Icon aria-hidden size={18} /> : null}
      <span>{children}</span>
      {Icon && iconPosition === "right" ? <Icon aria-hidden size={18} /> : null}
    </button>
  );
}
