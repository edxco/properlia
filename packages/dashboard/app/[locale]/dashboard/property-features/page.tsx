'use client';

import { useState } from 'react';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { useT } from '@properlia/shared/components/TranslationProvider';
import {
  usePropertyFeatures,
  useCreatePropertyFeature,
  useDeletePropertyFeature,
} from '@/src/services/property-features/queries';
import { useToast } from '@/src/contexts/ToastContext';

export default function PropertyFeaturesPage() {
  const t = useT();
  const { addToast } = useToast();
  const { data: features, isLoading } = usePropertyFeatures();
  const createMutation = useCreatePropertyFeature();
  const deleteMutation = useDeletePropertyFeature();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    es_name: '',
    slug: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync(formData);
      setFormData({ name: '', es_name: '', slug: '' });
      setShowForm(false);
      addToast(t('featureCreated') || 'Feature created successfully', 'success');
    } catch (error) {
      console.error('Failed to create property feature:', error);
      const message = error instanceof Error ? error.message : 'Failed to create feature';
      addToast(message, 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t('confirmDelete') || 'Are you sure you want to delete this feature?')) {
      try {
        await deleteMutation.mutateAsync(id);
        addToast(t('featureDeleted') || 'Feature deleted successfully', 'success');
      } catch (error) {
        console.error('Failed to delete property feature:', error);
        const message = error instanceof Error ? error.message : 'Failed to delete feature';
        addToast(message, 'error');
      }
    }
  };

  const handleNameChange = (value: string) => {
    setFormData({
      ...formData,
      name: value,
      slug: value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('propertyFeatures')}</h2>
          <p className="text-sm text-gray-500">{t('propertyFeaturesDescription')}</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          {t('addPropertyFeature')}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold">{t('addPropertyFeature')}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('englishName')}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('spanishName')}
                </label>
                <input
                  type="text"
                  value={formData.es_name}
                  onChange={(e) => setFormData({ ...formData, es_name: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Slug
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {t('save')}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {t('cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Features List */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : features && features.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t('name')} (EN)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t('name')} (ES)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Slug
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {features.map((feature) => (
                <tr key={feature.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {feature.name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {feature.es_name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {feature.slug}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                    <button
                      onClick={() => handleDelete(feature.id)}
                      disabled={deleteMutation.isPending}
                      className="text-red-600 hover:text-red-800 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-12 text-center">
            <p className="text-sm text-gray-500">{t('noPropertyFeatures')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
