import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

const TONES = {
  neutral: "bg-brand-bg text-brand-carbon",
  muted: "bg-brand-bg text-brand-gray",
  info: "bg-brand-pale text-brand-blue",
  navy: "bg-brand-navy text-white",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  onPhoto: "bg-white/95 text-brand-carbon shadow-badge tabular-nums",
} as const;

const SIZES = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-[11px] py-[5px] text-[11px]",
  lg: "px-2.5 py-1.5 text-xs",
} as const;

export type BadgeTone = keyof typeof TONES;

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  size?: keyof typeof SIZES;
}

export function badgeClasses({
  tone = "neutral",
  size = "sm",
  className,
}: Pick<BadgeProps, "tone" | "size" | "className"> = {}) {
  return cn(
    "inline-flex items-center gap-1 whitespace-nowrap rounded-full font-medium",
    SIZES[size],
    TONES[tone],
    className
  );
}

export function Badge({ tone, size, className, ...props }: BadgeProps) {
  return <span className={badgeClasses({ tone, size, className })} {...props} />;
}
