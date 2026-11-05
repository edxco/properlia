import type { ComponentProps, LabelHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/utils";

const CONTROL =
  "w-full rounded-lg border bg-white px-3.5 text-sm text-brand-carbon placeholder:text-brand-gray transition-colors focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/20 disabled:cursor-not-allowed disabled:bg-brand-bg disabled:text-brand-gray";

const CONTROL_SIZES = {
  sm: "h-9 px-2.5 text-xs",
  md: "h-11",
} as const;

export type ControlSize = keyof typeof CONTROL_SIZES;

export function controlClasses({
  invalid,
  multiline,
  size = "md",
  className,
}: { invalid?: boolean; multiline?: boolean; size?: ControlSize; className?: string } = {}) {
  return cn(
    CONTROL,
    multiline ? "py-2.5" : CONTROL_SIZES[size],
    invalid ? "border-danger focus:border-danger focus:ring-danger/20" : "border-input",
    className
  );
}

interface ControlProps {
  invalid?: boolean;
  controlSize?: ControlSize;
}

export function Input({
  invalid,
  controlSize,
  className,
  ...props
}: ComponentProps<"input"> & ControlProps) {
  return (
    <input
      aria-invalid={invalid || undefined}
      className={controlClasses({ invalid, size: controlSize, className })}
      {...props}
    />
  );
}

export function Textarea({
  invalid,
  className,
  ...props
}: ComponentProps<"textarea"> & Omit<ControlProps, "controlSize">) {
  return (
    <textarea
      aria-invalid={invalid || undefined}
      className={controlClasses({ invalid, multiline: true, className })}
      {...props}
    />
  );
}

export function Select({
  invalid,
  controlSize,
  className,
  ...props
}: ComponentProps<"select"> & ControlProps) {
  return (
    <select
      aria-invalid={invalid || undefined}
      className={controlClasses({ invalid, size: controlSize, className: cn("cursor-pointer", className) })}
      {...props}
    />
  );
}

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("mb-1.5 block text-sm font-medium text-brand-carbon", className)}
      {...props}
    />
  );
}

export interface FieldProps {
  label?: ReactNode;
  htmlFor?: string;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

export function Field({ label, htmlFor, hint, error, required, className, children }: FieldProps) {
  return (
    <div className={className}>
      {label && (
        <Label htmlFor={htmlFor}>
          {label}
          {required && <span className="ml-0.5 text-danger">*</span>}
        </Label>
      )}
      {children}
      {error ? (
        <p role="alert" className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-sm text-brand-gray">{hint}</p>
      )}
    </div>
  );
}
