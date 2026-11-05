import type { ComponentProps } from "react";
import { cn } from "../../lib/utils";

const VARIANTS = {
  primary: "bg-brand-blue text-white hover:bg-brand-navy",
  secondary:
    "border border-brand-navy/25 text-brand-navy hover:border-brand-navy hover:bg-brand-navy/[0.04]",
  ghost: "text-brand-navy hover:bg-brand-pale",
  destructive: "bg-danger text-white hover:bg-danger/90",
  inverse:
    "bg-white text-brand-navy hover:bg-brand-pale focus-visible:ring-white focus-visible:ring-offset-brand-navy",
  outlineInverse:
    "border border-white/40 text-white hover:border-white hover:bg-white/10 focus-visible:ring-white focus-visible:ring-offset-brand-navy",
  link: "h-auto px-0 text-brand-blue underline-offset-4 hover:underline",
} as const;

const SIZES = {
  xs: "h-7 px-2.5 text-xs",
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-12 px-8 text-base",
  icon: "size-10 p-0",
} as const;

export type ButtonVariant = keyof typeof VARIANTS;
export type ButtonSize = keyof typeof SIZES;

export interface ButtonStyleProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
}

/** Classes for elements that must look like a button but aren't one (Link, a). */
export function buttonClasses({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
}: ButtonStyleProps = {}) {
  return cn(
    "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg font-medium transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50",
    SIZES[size],
    VARIANTS[variant],
    fullWidth && "w-full",
    className
  );
}

export interface ButtonProps
  extends ComponentProps<"button">,
    Omit<ButtonStyleProps, "className"> {}

export function Button({
  variant,
  size,
  fullWidth,
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses({ variant, size, fullWidth, className })}
      {...props}
    />
  );
}
