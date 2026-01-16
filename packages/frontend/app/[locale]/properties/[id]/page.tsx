'use client';

import { useParams } from 'next/navigation';
import { useProperty } from '@/src/services/properties/queries';
import { PropertyDetail } from '@properlia/shared';

export default function Page() {
  const params = useParams();
  const id = params?.id as string;
  const locale = params?.locale as string;

  const { data: property, isLoading, isError } = useProperty(id);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-stone-600">Loading property...</div>
      </div>
    );
  }

  if (isError || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Property not found</div>
      </div>
    );
  }

  return <PropertyDetail property={property} locale={locale} />;
}
