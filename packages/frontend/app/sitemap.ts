import type { MetadataRoute } from "next";
import { slugify } from "@properlia/shared/lib/slugify";

const BASE_URL = "https://properlia.com";
const API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";
const LOCALES = ["es", "en"] as const;

interface Property {
  id: string;
  title: string;
  state?: string | null;
  city?: string | null;
  updated_at?: string;
}

interface PaginatedResponse {
  data: Property[];
  metadata: { pages: number; next: number | null };
}

async function fetchAllProperties(): Promise<Property[]> {
  const properties: Property[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    try {
      const res = await fetch(`${API_URL}/properties?page=${page}&items=100`, {
        next: { revalidate: 3600 },
      });
      if (!res.ok) break;
      const json: PaginatedResponse = await res.json();
      properties.push(...json.data);
      totalPages = json.metadata.pages;
      page++;
    } catch {
      break;
    }
  }

  return properties;
}

function buildPropertyPath(property: Property): string {
  const state = slugify(property.state) || "na";
  const city = slugify(property.city) || "na";
  const slug = slugify(property.title);
  return `/properties/${state}/${city}/${property.id}/${slug}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    { path: "", priority: 1.0, changeFrequency: "weekly" as const },
    { path: "/properties", priority: 0.8, changeFrequency: "daily" as const },
    { path: "/buyer-consultation", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/seller-consultation", priority: 0.7, changeFrequency: "monthly" as const },
  ];

  const entries: MetadataRoute.Sitemap = [];

  for (const route of staticRoutes) {
    for (const locale of LOCALES) {
      entries.push({
        url: `${BASE_URL}/${locale}${route.path}`,
        lastModified: new Date(),
        changeFrequency: route.changeFrequency,
        priority: route.priority,
        alternates: {
          languages: {
            es: `${BASE_URL}/es${route.path}`,
            en: `${BASE_URL}/en${route.path}`,
          },
        },
      });
    }
  }

  const properties = await fetchAllProperties();

  for (const property of properties) {
    const path = buildPropertyPath(property);
    for (const locale of LOCALES) {
      entries.push({
        url: `${BASE_URL}/${locale}${path}`,
        lastModified: property.updated_at ? new Date(property.updated_at) : new Date(),
        changeFrequency: "weekly",
        priority: 0.6,
        alternates: {
          languages: {
            es: `${BASE_URL}/es${path}`,
            en: `${BASE_URL}/en${path}`,
          },
        },
      });
    }
  }

  return entries;
}
