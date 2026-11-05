import type { ComponentProps } from "react";
import { cn } from "../../lib/utils";

export interface ChipProps extends ComponentProps<"button"> {
  selected?: boolean;
  size?: "sm" | "md";
}

/** Toggleable pill for filters and multi-select options. */
export function chipClasses({
  selected,
  size = "sm",
  className,
}: Pick<ChipProps, "selected" | "size" | "className"> = {}) {
  return cn(
    "inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full border font-medium transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    size === "sm" ? "h-8 px-3 text-xs" : "h-10 px-4 text-sm",
    selected
      ? "border-brand-blue bg-brand-blue text-white hover:border-brand-navy hover:bg-brand-navy"
      : "border-input bg-white text-brand-carbon hover:border-brand-navy/40 hover:bg-brand-pale",
    className
  );
}

export function Chip({ selected, size, className, type = "button", ...props }: ChipProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={chipClasses({ selected, size, className })}
      {...props}
    />
  );
}
