import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

type HeadingProps = HTMLAttributes<HTMLHeadingElement>;

export function PageTitle({ className, ...props }: HeadingProps) {
  return (
    <h1
      className={cn(
        "font-display text-4xl font-medium tracking-tight text-brand-navy md:text-5xl",
        className
      )}
      {...props}
    />
  );
}

export function SectionTitle({ className, ...props }: HeadingProps) {
  return (
    <h2
      className={cn("font-display text-3xl font-medium text-brand-navy md:text-4xl", className)}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: HeadingProps) {
  return (
    <h3
      className={cn("font-display text-2xl font-medium text-brand-navy", className)}
      {...props}
    />
  );
}

/** Title of a dashboard screen. */
export function DashboardTitle({ className, ...props }: HeadingProps) {
  return (
    <h1
      className={cn("font-display text-2xl font-medium text-brand-navy", className)}
      {...props}
    />
  );
}

export function Eyebrow({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "text-xs font-medium uppercase tracking-[0.14em] text-brand-blue",
        className
      )}
      {...props}
    />
  );
}

export function Price({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn("font-medium tabular-nums text-brand-gold", className)} {...props} />
  );
}
