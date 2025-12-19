'use client';

import { useMemo } from 'react';
import { useProperties } from '@/src/services/properties/queries';
import { usePropertyTypes } from '@/src/services/property-types/queries';
import { useStatuses } from '@/src/services/statuses/queries';

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
        <h2 className="text-2xl font-bold">Dashboard overview</h2>
        <p className="text-sm text-gray-500">
          Live stats pulled from the properties API.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Total properties</p>
          <p className="mt-2 text-3xl font-bold text-blue-600">
            {isLoading ? '—' : totalProperties}
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Featured listings (page)</p>
          <p className="mt-2 text-3xl font-bold text-green-600">
            {isLoading ? '—' : featuredCount}
          </p>
          <p className="text-xs text-gray-500">Based on the fetched page.</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Property types available</p>
          <p className="mt-2 text-3xl font-bold text-indigo-600">
            {types ? types.length : '—'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Status breakdown</h3>
          <div className="mt-4 space-y-2">
            {(statuses ?? []).map((status) => (
              <div key={status.id} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{status.name}</span>
                <span className="text-sm font-semibold text-gray-900">
                  {statusBreakdown[status.name] ?? 0}
                </span>
              </div>
            ))}
            {!statuses?.length && (
              <p className="text-sm text-gray-500">No statuses registered yet.</p>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Recently fetched</h3>
          {isLoading ? (
            <p className="mt-2 text-sm text-gray-500">Loading properties...</p>
          ) : properties.length ? (
            <ul className="mt-2 divide-y divide-gray-200">
              {properties.slice(0, 5).map((property) => (
                <li key={property.id} className="py-2">
                  <p className="text-sm font-semibold text-gray-900">{property.title}</p>
                  <p className="text-xs text-gray-500">
                    {property.city || '—'}, {property.state || '—'} ·{' '}
                    {property.property_type?.name || 'No type'}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-gray-500">
              No properties found. Create one from the properties tab.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
