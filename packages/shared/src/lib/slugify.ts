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
  state?: { name: string } | null;
  city?: { name: string } | null;
}): string {
  const state = slugify(property.state?.name) || 'na';
  const city = slugify(property.city?.name) || 'na';
  const slug = slugify(property.title);
  return `/properties/${state}/${city}/${property.id}/${slug}`;
}
