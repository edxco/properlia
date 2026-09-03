import type { CSSProperties } from "react";

// Properlia typography scale (matches packages/frontend/components/property/typography.ts).
export const textStyles: Record<string, CSSProperties> = {
  h1: {
    fontFamily: "var(--font-playfair)",
    fontSize: 36,
    lineHeight: 1.2,
    color: "#1A3A5C",
    fontWeight: 600,
  },
  h2: {
    fontFamily: "var(--font-playfair)",
    fontSize: 26,
    lineHeight: 1.3,
    color: "#1A3A5C",
    fontWeight: 600,
  },
  h3: {
    fontFamily: "var(--font-inter)",
    fontSize: 18,
    color: "#2C2C2A",
    fontWeight: 500,
  },
  price: {
    fontFamily: "var(--font-inter)",
    fontSize: 22,
    color: "#C4A44A",
    fontWeight: 500,
  },
  body: {
    fontFamily: "var(--font-inter)",
    fontSize: 15,
    color: "#444441",
    fontWeight: 400,
    lineHeight: 1.6,
  },
  meta: {
    fontFamily: "var(--font-inter)",
    fontSize: 13,
    color: "#888780",
    fontWeight: 400,
  },
  label: {
    fontFamily: "var(--font-inter)",
    fontSize: 11,
    color: "#888780",
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  button: {
    fontFamily: "var(--font-inter)",
    fontSize: 13,
    fontWeight: 500,
  },
};
