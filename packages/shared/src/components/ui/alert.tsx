import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

const TONES = {
  info: "border-brand-blue/20 bg-brand-pale text-brand-navy",
  success: "border-success/30 bg-success-soft text-success",
  warning: "border-warning/30 bg-warning-soft text-warning",
  danger: "border-danger/30 bg-danger-soft text-danger",
} as const;

export type AlertTone = keyof typeof TONES;

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  tone?: AlertTone;
}

export function Alert({ tone = "info", className, role, ...props }: AlertProps) {
  return (
    <div
      role={role ?? (tone === "danger" ? "alert" : "status")}
      className={cn("rounded-lg border p-4 text-sm", TONES[tone], className)}
      {...props}
    />
  );
}
