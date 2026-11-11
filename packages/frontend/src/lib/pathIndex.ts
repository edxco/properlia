import type { PublicLocationPath, PublicPaths, PublicPropertyPath } from "@properlia/shared/types";

// In-memory copy of GET /public_paths for the proxy, which needs it on every
// property/geo request to answer 301s without hitting the API each time.
// Kept on globalThis so the revalidate route can invalidate it in the same process.

const TTL_MS = 5 * 60 * 1000;
const RETRY_MS = 30 * 1000;
const FETCH_TIMEOUT_MS = 3000;
const API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

type City = PublicLocationPath & { state_id: string };

export interface PathIndex {
  propertiesById: Map<string, PublicPropertyPath>;
  propertiesByCode: Map<string, PublicPropertyPath>;
  states: PublicLocationPath[];
  statesById: Map<string, PublicLocationPath>;
  citiesById: Map<string, City>;
  citiesByState: Map<string, City[]>;
}

interface CacheEntry {
  index: PathIndex | null;
  expiresAt: number;
  pending: Promise<PathIndex | null> | null;
}

const CACHE_KEY = Symbol.for("properlia.pathIndex");
const globalCache = globalThis as unknown as Record<symbol, CacheEntry | undefined>;

function cacheEntry(): CacheEntry {
  return (globalCache[CACHE_KEY] ??= { index: null, expiresAt: 0, pending: null });
}

function buildIndex(paths: PublicPaths): PathIndex {
  const citiesByState = new Map<string, City[]>();
  for (const city of paths.cities) {
    citiesByState.set(city.state_id, [...(citiesByState.get(city.state_id) ?? []), city]);
  }
  return {
    propertiesById: new Map(paths.properties.map((p) => [p.id, p])),
    propertiesByCode: new Map(paths.properties.map((p) => [p.code.toUpperCase(), p])),
    states: paths.states,
    statesById: new Map(paths.states.map((s) => [s.id, s])),
    citiesById: new Map(paths.cities.map((c) => [c.id, c])),
    citiesByState,
  };
}

async function load(entry: CacheEntry): Promise<PathIndex | null> {
  try {
    const res = await fetch(`${API_URL}/public_paths`, {
      cache: "no-store",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`public_paths responded ${res.status}`);
    entry.index = buildIndex(await res.json());
    entry.expiresAt = Date.now() + TTL_MS;
  } catch (error) {
    console.error("[pathIndex] could not load public paths:", error);
    // Keep serving the stale index; try again soon.
    entry.expiresAt = Date.now() + RETRY_MS;
  } finally {
    entry.pending = null;
  }
  return entry.index;
}

/** Returns the cached index (possibly stale), or null if it has never loaded. */
export async function getPathIndex(): Promise<PathIndex | null> {
  const entry = cacheEntry();
  if (entry.index && Date.now() < entry.expiresAt) return entry.index;
  entry.pending ??= load(entry);
  return entry.pending;
}

export function invalidatePathIndex() {
  cacheEntry().expiresAt = 0;
}

type Slugged = { slug: string; slug_en: string; previous_slugs: string[] };

/** Matches a URL slug against current (either locale) or previous slugs. */
export function matchesSlug(location: Slugged, slug: string): boolean {
  return location.slug === slug || location.slug_en === slug || location.previous_slugs.includes(slug);
}

export const findState = (index: PathIndex, slug: string) => index.states.find((s) => matchesSlug(s, slug));

export const findCity = (index: PathIndex, stateId: string, slug: string) =>
  (index.citiesByState.get(stateId) ?? []).find((c) => matchesSlug(c, slug));
