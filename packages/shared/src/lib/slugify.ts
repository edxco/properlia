import { ROUTES, toLocale } from './routes';

// Mirrors Slugger.slugify in packages/backend/app/services/slugger.rb; both must match.
export function slugify(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export interface PropertyUrlFields {
  code: string;
  title: string;
  title_en?: string | null;
}

/** Last URL segment of a property: {title-slug}-{code}, e.g. casa-en-venta-pue-r0012. */
export function propertySlug(property: PropertyUrlFields, locale: string): string {
  const title = toLocale(locale) === 'en' ? property.title_en?.trim() || property.title : property.title;
  return [slugify(title), property.code.toLowerCase()].filter(Boolean).join('-');
}

export function propertyPathFromSlug(locale: string, slug: string): string {
  const loc = toLocale(locale);
  return `/${loc}/${ROUTES.properties[loc]}/${slug}`;
}

/** /{locale}/{propiedades|properties}/{title-slug}-{code}. Mirrors PropertyPublicUrl in the backend. */
export function buildPropertyUrl(property: PropertyUrlFields, locale: string): string {
  return propertyPathFromSlug(locale, propertySlug(property, locale));
}

// Codes look like PUE-R0012: city code, type letter and a sequence of 4+ digits.
const PROPERTY_CODE_PATTERN = /(?:^|-)([a-z0-9]{3}-[a-z]\d{4,})$/i;

/** Extracts the public code (uppercase) from a {title-slug}-{code} segment. */
export function parsePropertyCode(slugWithCode: string): string | null {
  const match = slugWithCode.match(PROPERTY_CODE_PATTERN);
  return match ? match[1].toUpperCase() : null;
}

export function hasPublicLocation(property: {
  state?: { name: string } | null;
  city?: { name: string } | null;
}): boolean {
  return Boolean(slugify(property.state?.name) && slugify(property.city?.name));
}
