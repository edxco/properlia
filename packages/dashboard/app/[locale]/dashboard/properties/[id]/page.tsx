import { notFound } from 'next/navigation';
import { propertyApi } from '@properlia/shared/services/properties/api';
import { PropertyDetail } from '@properlia/shared';

interface PropertyPageProps {
  params: {
    id: string;
    locale: string;
  };
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { id, locale } = params;

  try {
    const property = await propertyApi.getById(id);

    if (!property) {
      notFound();
    }

    return (
      <div className="p-6">
        <PropertyDetail property={property} locale={locale} />
      </div>
    );
  } catch (error) {
    console.error('Error fetching property:', error);
    notFound();
  }
}

export async function generateMetadata({ params }: PropertyPageProps) {
  const { id } = params;

  try {
    const property = await propertyApi.getById(id);

    if (!property) {
      return {
        title: 'Property Not Found',
      };
    }

    return {
      title: `${property.title} - Dashboard`,
      description: property.description || `${property.title} details`,
    };
  } catch (error) {
    return {
      title: 'Property Not Found',
    };
  }
}
