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
