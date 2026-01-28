"use client";

import { formatPriceInput, parsePriceInput } from "../lib/utils";

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
  /** Additional CSS classes */
  className?: string;
  /** Error state - adds error styling */
  hasError?: boolean;
}

/**
 * A price input component with automatic thousand separator formatting
 *
 * @example
 * ```tsx
 * const [price, setPrice] = useState("");
 *
 * <PriceInput
 *   value={price}
 *   onChange={(formatted, numeric) => setPrice(formatted)}
 *   placeholder="Enter price"
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
  hasError = false,
}: PriceInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const formattedValue = formatPriceInput(rawValue);
    const numericValue = parsePriceInput(formattedValue);
    onChange(formattedValue, numericValue);
  };

  return (
    <input
      type="text"
      id={id}
      name={name}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      inputMode="decimal"
      className={className}
      aria-invalid={hasError}
    />
  );
}
