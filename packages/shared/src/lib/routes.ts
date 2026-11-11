// Public URL map of the website. Every link, canonical, hreflang and sitemap entry
// is built from here; components never hand-write paths.

export const LOCALES = ['es', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'es';

export const isLocale = (value: unknown): value is Locale => LOCALES.includes(value as Locale);
export const toLocale = (value: string): Locale => (isLocale(value) ? value : DEFAULT_LOCALE);

// Public first-level segment per locale, and the app/[locale]/ folder that renders it.
export const ROUTES = {
  home: { es: '', en: '', internal: '' },
  properties: { es: 'propiedades', en: 'properties', internal: 'properties' },
  buyerConsultation: { es: 'consulta-comprador', en: 'buyer-consultation', internal: 'buyer-consultation' },
  sellerConsultation: { es: 'consulta-vendedor', en: 'seller-consultation', internal: 'seller-consultation' },
  contact: { es: 'contacto', en: 'contact', internal: 'contact' },
  services: { es: 'servicios', en: 'services', internal: 'services' },
  privacy: { es: 'aviso-de-privacidad', en: 'privacy', internal: 'privacy' },
  terms: { es: 'terminos-y-condiciones', en: 'terms', internal: 'terms' },
  sitemap: { es: 'mapa-del-sitio', en: 'sitemap', internal: 'sitemap' },
} as const;

export type RouteKey = keyof typeof ROUTES;

// Third geo level: /{state}/{city}/{operation}. `listingType` is the API listing_type name.
export const OPERATIONS = {
  sale: { es: 'venta', en: 'sale', listingType: 'sale', filter: 'buy' },
  rent: { es: 'renta', en: 'rent', listingType: 'rent', filter: 'rent' },
} as const;

export type OperationKey = keyof typeof OPERATIONS;

export type LocalizedPaths = Record<Locale, string>;

/** Finds the route whose public (any locale) or internal segment is `segment`. */
export function findRouteBySegment(segment: string): RouteKey | undefined {
  if (!segment) return undefined;
  return (Object.keys(ROUTES) as RouteKey[]).find((key) => {
    const route = ROUTES[key];
    return route.es === segment || route.en === segment || route.internal === segment;
  });
}

export function findOperationBySegment(segment: string): OperationKey | undefined {
  return (Object.keys(OPERATIONS) as OperationKey[]).find(
    (key) => OPERATIONS[key].es === segment || OPERATIONS[key].en === segment
  );
}

export function findOperationByFilter(filter: string | undefined): OperationKey | undefined {
  return (Object.keys(OPERATIONS) as OperationKey[]).find(
    (key) => OPERATIONS[key].filter === filter || OPERATIONS[key].listingType === filter
  );
}

/** /{locale}/{segment}{query}, e.g. localizedPath('es', 'contact') => /es/contacto */
export function localizedPath(locale: string, key: RouteKey, query = ''): string {
  const loc = toLocale(locale);
  const segment = ROUTES[key][loc];
  return `/${loc}${segment ? `/${segment}` : ''}${query}`;
}

export function routePaths(key: RouteKey): LocalizedPaths {
  return { es: localizedPath('es', key), en: localizedPath('en', key) };
}

export interface SluggedLocation {
  slug?: string | null;
  slug_en?: string | null;
}

export const locationSlug = (location: SluggedLocation, locale: string): string =>
  (toLocale(locale) === 'en' ? location.slug_en : location.slug) || location.slug || '';

/** /{locale}/{state}[/{city}[/{operation}]] */
export function geoPath(
  locale: string,
  state: SluggedLocation,
  city?: SluggedLocation | null,
  operation?: OperationKey | null
): string {
  const loc = toLocale(locale);
  const parts = [loc, locationSlug(state, loc)];
  if (city) {
    parts.push(locationSlug(city, loc));
    if (operation) parts.push(OPERATIONS[operation][loc]);
  }
  return `/${parts.join('/')}`;
}

export function geoPaths(
  state: SluggedLocation,
  city?: SluggedLocation | null,
  operation?: OperationKey | null
): LocalizedPaths {
  return { es: geoPath('es', state, city, operation), en: geoPath('en', state, city, operation) };
}

/**
 * Same page in the other locale, translating fixed segments (route and operation).
 * Location and title slugs are left as they are; the proxy 301s them to the right locale.
 */
export function switchLocalePath(pathname: string, target: Locale): string {
  const segments = pathname.split('/').filter(Boolean);
  if (isLocale(segments[0])) segments.shift();
  if (segments.length === 0) return `/${target}`;

  const route = findRouteBySegment(segments[0]);
  if (route) {
    segments[0] = ROUTES[route][target];
  } else if (segments.length === 3) {
    const operation = findOperationBySegment(segments[2]);
    if (operation) segments[2] = OPERATIONS[operation][target];
  }
  return `/${[target, ...segments].filter(Boolean).join('/')}`;
}
