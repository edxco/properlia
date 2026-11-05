import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

export function Container({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mx-auto w-full max-w-[1180px] px-4 md:px-10", className)} {...props} />;
}

const TONES = {
  white: "bg-white",
  base: "bg-brand-bg",
  pale: "bg-brand-pale",
  navy: "bg-brand-navy text-white",
} as const;

export interface SectionProps extends HTMLAttributes<HTMLElement> {
  tone?: keyof typeof TONES;
  spacing?: "none" | "md" | "lg";
}

const SPACING = { none: "", md: "py-12 md:py-16", lg: "py-16 md:py-24" } as const;

export function Section({ tone = "white", spacing = "lg", className, ...props }: SectionProps) {
  return <section className={cn(TONES[tone], SPACING[spacing], className)} {...props} />;
}
