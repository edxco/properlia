import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

const PADDING = {
  none: "",
  sm: "p-5",
  md: "p-6 md:p-8",
} as const;

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: keyof typeof PADDING;
  interactive?: boolean;
}

export function cardClasses({
  padding = "md",
  interactive,
  className,
}: Pick<CardProps, "padding" | "interactive" | "className"> = {}) {
  return cn(
    "rounded-card border border-brand-border bg-white shadow-card",
    PADDING[padding],
    interactive && "transition hover:-translate-y-0.5 hover:shadow-overlay motion-reduce:hover:translate-y-0",
    className
  );
}

export function Card({ padding, interactive, className, ...props }: CardProps) {
  return <div className={cardClasses({ padding, interactive, className })} {...props} />;
}
