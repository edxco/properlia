export interface BadgeItem {
  id: string;
  name: string;
  es_name: string;
}

type BadgeColor = {
  bgColor: string;
  textColor: string;
};

const capitalizeFirstWord = (value: string) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : value;

/**
 * Explicit ID -> (bgColor, textColor) map
 * Using hex colors for inline styles to ensure they always render
 */
const BADGE_COLOR_BY_ID: Record<string, BadgeColor> = {
  "4470cd78-8e77-40de-b702-15c6b4ca473d": {
    bgColor: "#53eafd", // cyan-300
    textColor: "#000000",
  }, //active
  "8f3bd072-51dd-4d16-b1b5-5bcc11e372f1": {
    bgColor: "#90a1b9", // slate-400
    textColor: "#ffffff",
  }, // on-hold
  "9f3b6e4a-2c7d-4a8a-9c1d-6e7f8a2b5c31": {
    bgColor: "#059669", // emerald-600
    textColor: "#ffffff",
  }, // sold
  "c1a8e5d4-9b62-4f3e-8a71-2d6c9f0e4b58": {
    bgColor: "#059669", // emerald-600
    textColor: "#ffffff",
  }, // leased
  "7d4a2f8e-6c91-4b5d-a3f2-9e0c1b8a7d64": {
    bgColor: "#ec003f", // rose-400
    textColor: "#fcfcfc",
  }, // suspended
  "e2b6a9d1-5c4f-4e7a-8b3d-0f9a6c1e52d8": {
    bgColor: "#e2e8f0", // slate-100
    textColor: "#ffffff",
  }, // expired

  // property types
  "0221da24-d7df-4052-a63d-2d16501ec360": {
    bgColor: "#00bcff", // sky-400
    textColor: "#ffffff",
  }, // departament
  "6431658b-1ebc-4805-ac61-97bf39699353": {
    bgColor: "#00a6f4", // sky-500
    textColor: "#ffffff",
  }, // house
  "23d3905f-a5c1-4372-995e-362b2c10f77f": {
    bgColor: "#0084d1", // sky-600
    textColor: "#0f172a",
  }, // land
  "044af3c1-7cea-4ec5-86e7-07b10afdb147": {
    bgColor: "#0069a8", // sky-700
    textColor: "#ffffff",
  }, // retail space
  "37beb05a-ff6a-4138-8959-c2c9be60e6f5": {
    bgColor: "#024a70", // sky-900
    textColor: "#ffffff",
  }, // warehouse

  // listing types
  "a7f8e2d1-3c4b-5a6e-9f8d-7c1b2a3e4f5d": {
    bgColor: "#fff085", // yellow-200
    textColor: "#000000",
  }, // pre-sale
  "b8e9f3d2-4c5a-6b7e-0f9e-8d2c3b4e5f6a": {
    bgColor: "#fef3c6", // amber-100
    textColor: "#000000",
  }, // sale
  "c9f0e4d3-5c6b-7a8e-1f0e-9d3c4b5e6f7b": {
    bgColor: "#fee685", // amber-200
    textColor: "#000000",
  }, // rent
};

const DEFAULT_BADGE: BadgeColor = {
  bgColor: "#e2e8f0", // slate-200
  textColor: "#0f172a", // slate-900
};

/** Returns only classes for bg + text */
export const getBadgeClassesById = (id: string): BadgeColor => {
  return BADGE_COLOR_BY_ID[id] ?? DEFAULT_BADGE;
};

/** Convenience renderer (uses locale to pick label) */
export const getBadge = (item: BadgeItem, locale: string) => {
  const { bgColor, textColor } = getBadgeClassesById(item.id);
  const label = capitalizeFirstWord(locale === "es" ? item.es_name : item.name);
  const baseClasses =
    "inline-flex items-center rounded-full font-normal";

  return (
    <span
      className={baseClasses}
      style={{
        backgroundColor: bgColor,
        color: textColor,
        margin: "0 2px",
        fontSize: "11px",
        padding: "2px 8px",
      }}
    >
      {label}
    </span>
  );
};
