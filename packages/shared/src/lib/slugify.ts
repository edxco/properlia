export function slugify(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function buildPropertyUrl(property: {
  id: string;
  title: string;
  state?: string | null;
  city?: string | null;
}): string {
  const state = slugify(property.state) || 'na';
  const city = slugify(property.city) || 'na';
  const slug = slugify(property.title);
  return `/properties/${state}/${city}/${property.id}/${slug}`;
}
