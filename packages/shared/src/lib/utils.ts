import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Capitalizes the first word of a string and converts the rest to lowercase
 * @param str - The string to capitalize
 * @returns The string with the first word capitalized and the rest lowercase
 * @example
 * capitalizeFirstWord("hello world") // "Hello world"
 * capitalizeFirstWord("HELLO") // "Hello"
 * capitalizeFirstWord("hello World") // "Hello world"
 * capitalizeFirstWord("") // ""
 */
export function capitalizeFirstWord(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Formats large numbers with K (thousands), M (millions), B (billions), T (trillions) suffixes
 * @param value - The number to format
 * @param decimals - Number of decimal places to show (default: 1)
 * @returns Formatted string with appropriate suffix
 * @example
 * formatLargeNumber(1234) // "1.2K"
 * formatLargeNumber(1234567) // "1.2M"
 * formatLargeNumber(1234567890) // "1.2B"
 * formatLargeNumber(1234567890123) // "1.2T"
 * formatLargeNumber(123) // "123"
 */
export function formatLargeNumber(value: number, decimals: number = 1): string {
  if (value === 0) return '0';

  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  const suffixes = [
    { value: 1e12, suffix: 'T' },
    { value: 1e9, suffix: 'B' },
    { value: 1e6, suffix: 'M' },
    { value: 1e3, suffix: 'K' },
  ];

  for (const { value: threshold, suffix } of suffixes) {
    if (absValue >= threshold) {
      const formatted = (absValue / threshold).toFixed(decimals);
      // Remove trailing zeros and decimal point if not needed
      const cleaned = formatted.replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
      return `${sign}${cleaned}${suffix}`;
    }
  }

  return `${sign}${absValue.toLocaleString()}`;
}

/**
 * Formats a price string with thousand separators (commas)
 * @param value - The raw input string (may contain non-numeric characters)
 * @returns Formatted string with commas as thousand separators
 * @example
 * formatPriceInput("1234567") // "1,234,567"
 * formatPriceInput("1234567.89") // "1,234,567.89"
 * formatPriceInput("$1,234") // "1,234"
 * formatPriceInput("abc123") // "123"
 */
export function formatPriceInput(value: string): string {
  // Remove non-numeric characters except decimal point
  const numericValue = value.replace(/[^\d.]/g, "");

  // Split into integer and decimal parts
  const parts = numericValue.split(".");

  // Format integer part with commas
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // Rejoin with decimal part if it exists (limit to 2 decimal places)
  if (parts.length > 1) {
    // Limit decimal places to 2
    parts[1] = parts[1].slice(0, 2);
    return parts.slice(0, 2).join(".");
  }

  return parts[0];
}

/**
 * Parses a formatted price string back to a number
 * @param value - The formatted price string (may contain commas, currency symbols)
 * @returns The numeric value, or NaN if invalid
 * @example
 * parsePriceInput("1,234,567") // 1234567
 * parsePriceInput("$1,234.56") // 1234.56
 * parsePriceInput("") // NaN
 */
export function parsePriceInput(value: string): number {
  // Remove all non-numeric characters except decimal point
  const cleanValue = value.replace(/[^\d.]/g, "");
  return parseFloat(cleanValue);
}

/**
 * Formats a number as a display price with currency symbol and thousand separators
 * @param value - The numeric price value
 * @param locale - The locale for formatting (default: "en-US")
 * @param currency - The currency code (default: "USD")
 * @returns Formatted currency string
 * @example
 * formatPriceDisplay(1234567) // "$1,234,567.00"
 * formatPriceDisplay(1234567, "es-MX", "MXN") // "$1,234,567.00"
 */
export function formatPriceDisplay(
  value: number,
  locale: string = "en-US",
  currency: string = "MXN"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}