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

    return <PropertyDetail property={property} locale={locale} />;
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

    const formattedPrice = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(property.price);

    return {
      title: `${property.title} - ${formattedPrice}`,
      description: property.description || `${property.title} for sale`,
    };
  } catch (error) {
    return {
      title: 'Property Not Found',
    };
  }
}
