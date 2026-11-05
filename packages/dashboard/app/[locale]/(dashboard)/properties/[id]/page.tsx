"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { propertyApi } from '@properlia/shared/services/properties/api';
import { PropertyDetail } from '@properlia/shared';
import type { Property } from '@properlia/shared/types';
import { useLocale } from '@properlia/shared/components/TranslationProvider';
import { Button, DashboardTitle } from '@properlia/shared/components/ui';

export default function PropertyPage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const id = params.id as string;

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const data = await propertyApi.getById(id);
        console.log('Fetched property data:', data);
        console.log('Property images:', data?.images);
        setProperty(data);
      } catch (err: any) {
        console.error('Error fetching property:', err);
        setError(err?.message || 'Failed to load property');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProperty();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto"></div>
          <p className="mt-4 text-brand-carbon/70">Loading property...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <DashboardTitle className="mb-2">Property Not Found</DashboardTitle>
          <p className="text-brand-carbon/70 mb-4">{error || 'The property you are looking for does not exist.'}</p>
          <Button size="sm" onClick={() => router.push('/properties')}>
            Back to Properties
          </Button>
        </div>
      </div>
    );
  }

  return <PropertyDetail property={property} locale={locale} />;
}
