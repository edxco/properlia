import type { Property } from '../types';

export const HIDDEN_PUBLIC_STATUSES = ['sold', 'leased', 'suspended', 'expired'];

export const isPubliclyVisible = (property: Property) =>
  !HIDDEN_PUBLIC_STATUSES.includes(property.status?.name ?? '');
