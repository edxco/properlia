import type { Property } from '../types';
import en from '../messages/en.json';
import es from '../messages/es.json';

type PropertyText = Pick<
  Property,
  | 'title'
  | 'title_en'
  | 'description'
  | 'description_en'
  | 'land_area'
  | 'built_area'
  | 'price'
  | 'neighborhood'
  | 'city'
  | 'property_type'
  | 'listing_type'
>;

const dictionaries: Record<string, Record<string, string>> = { en, es };

const fill = (template: string, values: Record<string, string>) =>
  template.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? '');

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

function templateTitle(property: PropertyText, locale: string): string {
  const dict = dictionaries[locale] ?? es;
  const isEn = locale === 'en';
  const type = (isEn ? property.property_type?.name : property.property_type?.es_name) ?? '';
  const operation = (isEn ? property.listing_type?.name : property.listing_type?.es_name) ?? '';
  const area = property.built_area || property.land_area;
  const city = (isEn ? property.city?.name : property.city?.es_name || property.city?.name) ?? '';
  const location = [property.neighborhood, city].filter(Boolean).join(', ');

  return [
    fill(dict.propertyTitleTemplate, { type: capitalize(type), operation }).trim(),
    area ? `${new Intl.NumberFormat(isEn ? 'en-US' : 'es-MX').format(area)} m²` : '',
    location,
  ]
    .filter(Boolean)
    .join(' – ');
}

export function localizedTitle(property: PropertyText, locale: string): string {
  if (locale !== 'en') return property.title;
  return property.title_en?.trim() || templateTitle(property, 'en');
}

export function localizedDescription(property: PropertyText, locale: string): string | null {
  if (locale === 'en' && property.description_en?.trim()) return property.description_en;
  return property.description ?? null;
}

export function localizedMetaDescription(property: PropertyText, locale: string): string {
  if (locale === 'en' && !property.description_en?.trim()) {
    const price = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0,
    }).format(property.price);
    return fill(en.propertyMetaDescriptionTemplate, {
      title: localizedTitle(property, 'en'),
      price,
    });
  }
  return (localizedDescription(property, locale) ?? '').slice(0, 160);
}
