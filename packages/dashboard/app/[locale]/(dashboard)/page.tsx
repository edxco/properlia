'use client';

import { useMemo } from 'react';
import { useProperties } from '@/src/services/properties/queries';
import { usePropertyTypes } from '@/src/services/property-types/queries';
import { useStatuses } from '@/src/services/statuses/queries';
import { Card, DashboardTitle } from '@properlia/shared/components/ui';

export default function DashboardPage() {
  const { data, isLoading } = useProperties({ items: 50 });
  const { data: types } = usePropertyTypes();
  const { data: statuses } = useStatuses();

  const properties = useMemo(() => data?.data ?? [], [data]);
  const totalProperties = data?.metadata?.count ?? properties.length;
  const featuredCount = useMemo(
    () => properties.filter((property) => property.featured).length,
    [properties]
  );

  const statusBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    properties.forEach((property) => {
      const statusKey = property.status?.name ?? 'Unspecified';
      counts[statusKey] = (counts[statusKey] ?? 0) + 1;
    });
    return counts;
  }, [properties]);

  return (
    <div className="space-y-6">
      <div>
        <DashboardTitle>Dashboard overview</DashboardTitle>
        <p className="text-sm text-brand-gray">
          Live stats pulled from the properties API.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-brand-gray">Total properties</p>
          <p className="mt-2 text-3xl font-medium tabular-nums text-brand-blue">
            {isLoading ? '—' : totalProperties}
          </p>
        </Card>

        <Card>
          <p className="text-sm text-brand-gray">Featured listings (page)</p>
          <p className="mt-2 text-3xl font-medium tabular-nums text-success">
            {isLoading ? '—' : featuredCount}
          </p>
          <p className="text-xs text-brand-gray">Based on the fetched page.</p>
        </Card>

        <Card>
          <p className="text-sm text-brand-gray">Property types available</p>
          <p className="mt-2 text-3xl font-medium tabular-nums text-brand-blue">
            {types ? types.length : '—'}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <h3 className="text-lg font-medium text-brand-carbon">Status breakdown</h3>
          <div className="mt-4 space-y-2">
            {(statuses ?? []).map((status) => (
              <div key={status.id} className="flex items-center justify-between">
                <span className="text-sm text-brand-carbon">{status.name}</span>
                <span className="text-sm font-medium text-brand-carbon">
                  {statusBreakdown[status.name] ?? 0}
                </span>
              </div>
            ))}
            {!statuses?.length && (
              <p className="text-sm text-brand-gray">No statuses registered yet.</p>
            )}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-medium text-brand-carbon">Recently fetched</h3>
          {isLoading ? (
            <p className="mt-2 text-sm text-brand-gray">Loading properties...</p>
          ) : properties.length ? (
            <ul className="mt-2 divide-y divide-brand-border">
              {properties.slice(0, 5).map((property) => (
                <li key={property.id} className="py-2">
                  <p className="text-sm font-medium text-brand-carbon">{property.title}</p>
                  <p className="text-xs text-brand-gray">
                    {property.city?.name || '—'}, {property.state?.name || '—'} ·{' '}
                    {property.property_type?.name || 'No type'}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-brand-gray">
              No properties found. Create one from the properties tab.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
