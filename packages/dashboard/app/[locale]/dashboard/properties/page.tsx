'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Property, PropertyPayload } from '@properlia/shared/types';

import { useCreateProperty, useProperties, useUpdateProperty } from '@/src/services/properties/queries';
import { usePropertyTypes } from '@/src/services/property-types/queries';
import { useStatuses } from '@/src/services/statuses/queries';

type FormState = {
  title: string;
  address: string;
  price: string;
  property_type_id: string;
  status_id: string;
  city: string;
  state: string;
  rooms: string;
  bathrooms: string;
  parking_spaces: string;
  description: string;
  featured: boolean;
};

const emptyForm: FormState = {
  title: '',
  address: '',
  price: '',
  property_type_id: '',
  status_id: '',
  city: '',
  state: '',
  rooms: '',
  bathrooms: '',
  parking_spaces: '',
  description: '',
  featured: false,
};

export default function PropertiesPage() {
  const [filters, setFilters] = useState<{ status_id?: string }>({});
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const { data, isLoading, isFetching, error } = useProperties({
    status_id: filters.status_id || undefined,
  });
  const { data: propertyTypes } = usePropertyTypes();
  const { data: statuses } = useStatuses();
  const { mutateAsync: createProperty, isPending: creating } = useCreateProperty();
  const { mutateAsync: updateProperty, isPending: updating } = useUpdateProperty();

  const properties = useMemo(() => data?.data ?? [], [data]);
  const metadata = data?.metadata;

  useEffect(() => {
    if (editingProperty) {
      setForm({
        title: editingProperty.title ?? '',
        address: editingProperty.address ?? '',
        price: editingProperty.price?.toString() ?? '',
        property_type_id: editingProperty.property_type_id ?? '',
        status_id: editingProperty.status_id ?? '',
        city: editingProperty.city ?? '',
        state: editingProperty.state ?? '',
        rooms: editingProperty.rooms?.toString() ?? '',
        bathrooms: editingProperty.bathrooms?.toString() ?? '',
        parking_spaces: editingProperty.parking_spaces?.toString() ?? '',
        description: editingProperty.description ?? '',
        featured: editingProperty.featured ?? false,
      });
    } else {
      setForm(emptyForm);
    }
  }, [editingProperty]);

  const handleChange = (field: keyof FormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const payload: PropertyPayload = {
      title: form.title.trim(),
      address: form.address.trim(),
      price: parseFloat(form.price) || 0,
      property_type_id: form.property_type_id,
      status_id: form.status_id || undefined,
      city: form.city || undefined,
      state: form.state || undefined,
      rooms: form.rooms ? Number(form.rooms) : undefined,
      bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
      parking_spaces: form.parking_spaces ? Number(form.parking_spaces) : undefined,
      description: form.description || undefined,
      featured: form.featured,
    };

    if (!payload.title || !payload.address || !payload.property_type_id) {
      setFormError('Title, address, and property type are required.');
      return;
    }

    if (!form.price || Number.isNaN(payload.price) || payload.price <= 0) {
      setFormError('Price must be greater than 0.');
      return;
    }

    try {
      if (editingProperty) {
        await updateProperty({ id: editingProperty.id, data: payload });
      } else {
        await createProperty(payload);
      }
      setEditingProperty(null);
      setForm(emptyForm);
    } catch (mutationError: any) {
      setFormError(
        mutationError?.message ||
          'There was a problem saving the property. Please try again.'
      );
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error loading properties: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Properties</h2>
          <p className="text-sm text-gray-500">
            Connected to the Rails API: list, create, and update properties.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600">Filter by status</label>
          <select
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            value={filters.status_id ?? ''}
            onChange={(event) =>
              setFilters((prev) => ({
                ...prev,
                status_id: event.target.value || undefined,
              }))
            }
          >
            <option value="">All</option>
            {statuses?.map((status) => (
              <option key={status.id} value={status.id}>
                {status.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {editingProperty ? 'Edit property' : 'Add property'}
              </h3>
              {editingProperty && (
                <button
                  onClick={() => setEditingProperty(null)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Cancel edit
                </button>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Required fields: title, address, price, and property type.
            </p>

            {formError && (
              <div className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(event) => handleChange('title', event.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Modern apartment in CDMX"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(event) => handleChange('address', event.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Street, number, neighborhood"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(event) => handleChange('city', event.target.value)}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">State</label>
                  <input
                    type="text"
                    value={form.state}
                    onChange={(event) => handleChange('state', event.target.value)}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    placeholder="State"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Price</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.price}
                    onChange={(event) => handleChange('price', event.target.value)}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    placeholder="5000000"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Property type</label>
                  <select
                    value={form.property_type_id}
                    onChange={(event) => handleChange('property_type_id', event.target.value)}
                    className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Select type</option>
                    {propertyTypes?.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={form.status_id}
                    onChange={(event) => handleChange('status_id', event.target.value)}
                    className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value="">Select status</option>
                    {statuses?.map((status) => (
                      <option key={status.id} value={status.id}>
                        {status.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <input
                    id="featured"
                    type="checkbox"
                    checked={form.featured}
                    onChange={(event) => handleChange('featured', event.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="featured" className="text-sm text-gray-700">
                    Mark as featured
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Rooms</label>
                  <input
                    type="number"
                    min={0}
                    value={form.rooms}
                    onChange={(event) => handleChange('rooms', event.target.value)}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Bathrooms</label>
                  <input
                    type="number"
                    min={0}
                    value={form.bathrooms}
                    onChange={(event) => handleChange('bathrooms', event.target.value)}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Parking</label>
                  <input
                    type="number"
                    min={0}
                    value={form.parking_spaces}
                    onChange={(event) => handleChange('parking_spaces', event.target.value)}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(event) => handleChange('description', event.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  rows={3}
                  placeholder="Key highlights for this listing"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 disabled:opacity-50"
                disabled={creating || updating}
              >
                {creating || updating
                  ? 'Saving...'
                  : editingProperty
                    ? 'Update property'
                    : 'Create property'}
              </button>
            </form>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  {metadata?.count ?? 0} properties
                </p>
                <p className="text-xs text-gray-500">
                  {isFetching ? 'Refreshing...' : 'Live data from the API'}
                </p>
              </div>
              {metadata && (
                <div className="text-right text-xs text-gray-500">
                  Page {metadata.page} of {metadata.pages}
                </div>
              )}
            </div>

            {isLoading ? (
              <div className="flex justify-center px-6 py-12 text-gray-500">
                Loading properties...
              </div>
            ) : properties.length ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {properties.map((property) => (
                    <tr key={property.id}>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="font-semibold text-gray-900">{property.title}</div>
                        <div className="text-xs text-gray-500">
                          {property.featured ? 'Featured • ' : ''}
                          {property.description ? property.description.slice(0, 60) : ''}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                        {property.property_type?.name ?? '—'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                        ${Number(property.price || 0).toLocaleString()}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                        {property.city || '—'}, {property.state || '—'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                        <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                          {property.status?.name ?? 'Unspecified'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                        <button
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => setEditingProperty(property)}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="px-6 py-12 text-center text-gray-500">
                <p className="font-medium text-gray-700">No properties found</p>
                <p className="text-sm text-gray-500">
                  Use the form on the left to create your first listing.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
