"use client";

import { useState, type ComponentProps } from "react";
import { cn } from "../../lib/utils";
import { Input } from "./field";

export interface PasswordInputProps extends Omit<ComponentProps<typeof Input>, "type"> {
  showLabel: string;
  hideLabel: string;
  /** Controlled visibility, e.g. to reveal a password and its confirmation together. */
  visible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
}

export function PasswordInput({
  showLabel,
  hideLabel,
  visible,
  onVisibleChange,
  className,
  ...props
}: PasswordInputProps) {
  const [internalVisible, setInternalVisible] = useState(false);
  const isVisible = visible ?? internalVisible;

  const toggle = () => {
    const next = !isVisible;
    if (visible === undefined) setInternalVisible(next);
    onVisibleChange?.(next);
  };

  return (
    <div className="relative">
      <Input type={isVisible ? "text" : "password"} className={cn("pr-11", className)} {...props} />
      <button
        type="button"
        onClick={toggle}
        aria-label={isVisible ? hideLabel : showLabel}
        aria-pressed={isVisible}
        disabled={props.disabled}
        className="absolute right-1.5 top-1/2 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-brand-gray transition-colors hover:bg-brand-pale hover:text-brand-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue disabled:pointer-events-none disabled:opacity-50"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-[18px]"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {isVisible ? (
            <>
              <path d="M10.585 10.587a2 2 0 0 0 2.829 2.828" />
              <path d="M16.681 16.673a8.717 8.717 0 0 1 -4.681 1.327c-3.6 0 -6.6 -2 -9 -6c1.272 -2.12 2.712 -3.678 4.32 -4.674m2.86 -1.146a9.055 9.055 0 0 1 1.82 -.18c3.6 0 6.6 2 9 6c-.666 1.11 -1.379 2.067 -2.138 2.87" />
              <path d="M3 3l18 18" />
            </>
          ) : (
            <>
              <path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" />
              <path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6" />
            </>
          )}
        </svg>
      </button>
    </div>
  );
}
