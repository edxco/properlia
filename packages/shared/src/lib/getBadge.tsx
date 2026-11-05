import { Badge, type BadgeTone } from "../components/ui";

export interface BadgeItem {
  id: string;
  name: string;
  es_name: string;
}

const capitalizeFirstWord = (value: string) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : value;

const BADGE_TONE_BY_ID: Record<string, BadgeTone> = {
  // property status
  "4470cd78-8e77-40de-b702-15c6b4ca473d": "info", // active
  "8f3bd072-51dd-4d16-b1b5-5bcc11e372f1": "warning", // on-hold
  "9f3b6e4a-2c7d-4a8a-9c1d-6e7f8a2b5c31": "success", // sold
  "c1a8e5d4-9b62-4f3e-8a71-2d6c9f0e4b58": "success", // leased
  "7d4a2f8e-6c91-4b5d-a3f2-9e0c1b8a7d64": "danger", // suspended
  "e2b6a9d1-5c4f-4e7a-8b3d-0f9a6c1e52d8": "muted", // expired
  // property types
  "0221da24-d7df-4052-a63d-2d16501ec360": "navy", // departament
  "6431658b-1ebc-4805-ac61-97bf39699353": "navy", // house
  "23d3905f-a5c1-4372-995e-362b2c10f77f": "navy", // land
  "044af3c1-7cea-4ec5-86e7-07b10afdb147": "navy", // retail space
  "37beb05a-ff6a-4138-8959-c2c9be60e6f5": "navy", // warehouse
  // listing types
  "a7f8e2d1-3c4b-5a6e-9f8d-7c1b2a3e4f5d": "info", // pre-sale
  "b8e9f3d2-4c5a-6b7e-0f9e-8d2c3b4e5f6a": "info", // sale
  "c9f0e4d3-5c6b-7a8e-1f0e-9d3c4b5e6f7b": "info", // rent
};

export const getBadgeTone = (id: string): BadgeTone => BADGE_TONE_BY_ID[id] ?? "neutral";

export const getBadge = (item: BadgeItem, locale: string) => (
  <Badge tone={getBadgeTone(item.id)} size="sm" className="mx-0.5 text-[11px]">
    {capitalizeFirstWord(locale === "es" ? item.es_name : item.name)}
  </Badge>
);
