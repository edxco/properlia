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
import {
  Button,
  Card,
  DashboardTitle,
  Field,
  Input,
} from '@properlia/shared/components/ui';

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
          <DashboardTitle>{t('propertyFeatures')}</DashboardTitle>
          <p className="text-sm text-brand-gray">{t('propertyFeaturesDescription')}</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4" />
          {t('addPropertyFeature')}
        </Button>
      </div>

      {/* Create Form */}
      {showForm && (
        <Card>
          <h3 className="mb-4 text-lg font-medium text-brand-carbon">{t('addPropertyFeature')}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Field label={t('englishName')}>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                />
              </Field>
              <Field label={t('spanishName')}>
                <Input
                  type="text"
                  value={formData.es_name}
                  onChange={(e) => setFormData({ ...formData, es_name: e.target.value })}
                  required
                />
              </Field>
              <Field label="Slug">
                <Input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                />
              </Field>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                {t('save')}
              </Button>
              <Button variant="secondary" onClick={() => setShowForm(false)}>
                {t('cancel')}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Features List */}
      <Card padding="none" className="overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-brand-gray" />
          </div>
        ) : features && features.length > 0 ? (
          <table className="min-w-full divide-y divide-brand-border">
            <thead className="bg-brand-bg">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-brand-gray">
                  {t('name')} (EN)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-brand-gray">
                  {t('name')} (ES)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-brand-gray">
                  Slug
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-brand-gray">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border bg-white">
              {features.map((feature) => (
                <tr key={feature.id} className="hover:bg-brand-bg">
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-brand-carbon">
                    {feature.name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-brand-carbon">
                    {feature.es_name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-brand-gray">
                    {feature.slug}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(feature.id)}
                      disabled={deleteMutation.isPending}
                      className="size-8 text-danger hover:bg-danger-soft"
                      aria-label={t('delete')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-12 text-center">
            <p className="text-sm text-brand-gray">{t('noPropertyFeatures')}</p>
          </div>
        )}
      </Card>
    </div>
  );
}
