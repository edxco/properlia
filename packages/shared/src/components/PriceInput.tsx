"use client";

import { cn, formatPriceInput, parsePriceInput } from "../lib/utils";
import { controlClasses } from "./ui";

export interface PriceInputProps {
  /** Current value (formatted or raw) */
  value: string;
  /** Callback when value changes - receives formatted value */
  onChange: (formattedValue: string, numericValue: number) => void;
  /** Input placeholder */
  placeholder?: string;
  /** Input id */
  id?: string;
  /** Input name */
  name?: string;
  /** Whether the input is required */
  required?: boolean;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Additional CSS classes for the input element */
  className?: string;
  /** Additional CSS classes for the wrapper div */
  wrapperClassName?: string;
  /** Additional CSS classes for the currency symbol */
  symbolClassName?: string;
  /** Error state - adds error styling */
  hasError?: boolean;
  /** Currency symbol to display (default: "$") */
  currencySymbol?: string;
}

/**
 * A price input component with automatic thousand separator formatting and currency symbol
 *
 * @example
 * ```tsx
 * const [price, setPrice] = useState("");
 *
 * <PriceInput
 *   value={price}
 *   onChange={(formatted, numeric) => setPrice(formatted)}
 *   placeholder="5,000,000"
 * />
 * ```
 */
export function PriceInput({
  value,
  onChange,
  placeholder = "0",
  id,
  name,
  required = false,
  disabled = false,
  className = "",
  wrapperClassName = "",
  symbolClassName = "",
  hasError = false,
  currencySymbol = "$",
}: PriceInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formattedValue = formatPriceInput(rawValue);
    const numericValue = parsePriceInput(formattedValue);
    onChange(formattedValue, numericValue);
  };

  return (
    <div className={cn("relative", wrapperClassName)}>
      <span
        className={cn("absolute left-3 top-1/2 -translate-y-1/2 text-sm text-brand-gray", symbolClassName)}
      >
        {currencySymbol}
      </span>
      <input
        type="text"
        id={id}
        name={name}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        inputMode="numeric"
        className={controlClasses({ invalid: hasError, className: cn("pl-7 tabular-nums", className) })}
        aria-invalid={hasError}
      />
    </div>
  );
}
