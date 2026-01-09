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