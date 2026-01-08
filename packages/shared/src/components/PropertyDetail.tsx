'use client';

import React from 'react';
import type { Property } from '../types';
import { Breadcrumbs, type BreadcrumbItem } from './Breadcrumbs';
import { ImageCarousel, type CarouselImage } from './ImageCarousel';

interface PropertyDetailProps {
  property: Property;
  locale?: string;
}

export const PropertyDetail: React.FC<PropertyDetailProps> = ({
  property,
  locale = 'en',
}) => {
  // Build breadcrumb items: State > City > Zip Code > Neighborhood
  const breadcrumbItems: BreadcrumbItem[] = [];

  if (property.state) {
    breadcrumbItems.push({
      label: property.state,
      href: `/properties?state=${encodeURIComponent(property.state)}`,
    });
  }

  if (property.city) {
    breadcrumbItems.push({
      label: property.city,
      href: `/properties?city=${encodeURIComponent(property.city)}`,
    });
  }

  if (property.zip_code) {
    breadcrumbItems.push({
      label: property.zip_code,
      href: `/properties?zip_code=${encodeURIComponent(property.zip_code)}`,
    });
  }

  if (property.neighborhood) {
    breadcrumbItems.push({
      label: property.neighborhood,
    });
  }

  // Convert property images to carousel format
  const carouselImages: CarouselImage[] = property.images.map((img) => ({
    url: img.url,
    filename: img.filename,
  }));

  // Format price
  const formattedPrice = new Intl.NumberFormat(locale === 'es' ? 'es-MX' : 'en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(property.price);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      {breadcrumbItems.length > 0 && (
        <Breadcrumbs items={breadcrumbItems} className="mb-6" />
      )}

      {/* Title and Price */}
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          {property.title}
        </h1>
        <p className="text-2xl font-semibold text-blue-600">{formattedPrice}</p>
        {property.address && (
          <p className="text-gray-600 mt-2">{property.address}</p>
        )}
      </div>

      {/* Image Carousel */}
      <ImageCarousel
        images={carouselImages}
        title={property.title}
        className="mb-8"
      />

      {/* Property Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Details */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">
              {locale === 'es' ? 'Detalles de la Propiedad' : 'Property Details'}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {property.rooms > 0 && (
                <div className="text-center p-4 bg-gray-50 rounded">
                  <p className="text-3xl font-bold text-gray-900">{property.rooms}</p>
                  <p className="text-sm text-gray-600">
                    {locale === 'es' ? 'Habitaciones' : 'Bedrooms'}
                  </p>
                </div>
              )}
              {property.bathrooms > 0 && (
                <div className="text-center p-4 bg-gray-50 rounded">
                  <p className="text-3xl font-bold text-gray-900">{property.bathrooms}</p>
                  <p className="text-sm text-gray-600">
                    {locale === 'es' ? 'Baños' : 'Bathrooms'}
                  </p>
                </div>
              )}
              {property.half_bathrooms > 0 && (
                <div className="text-center p-4 bg-gray-50 rounded">
                  <p className="text-3xl font-bold text-gray-900">{property.half_bathrooms}</p>
                  <p className="text-sm text-gray-600">
                    {locale === 'es' ? 'Medios Baños' : 'Half Baths'}
                  </p>
                </div>
              )}
              {property.parking_spaces > 0 && (
                <div className="text-center p-4 bg-gray-50 rounded">
                  <p className="text-3xl font-bold text-gray-900">{property.parking_spaces}</p>
                  <p className="text-sm text-gray-600">
                    {locale === 'es' ? 'Estacionamientos' : 'Parking'}
                  </p>
                </div>
              )}
              {property.built_area && (
                <div className="text-center p-4 bg-gray-50 rounded">
                  <p className="text-3xl font-bold text-gray-900">
                    {property.built_area.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    {locale === 'es' ? 'm² Construidos' : 'Built Area m²'}
                  </p>
                </div>
              )}
              {property.land_area && (
                <div className="text-center p-4 bg-gray-50 rounded">
                  <p className="text-3xl font-bold text-gray-900">
                    {property.land_area.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    {locale === 'es' ? 'm² de Terreno' : 'Land Area m²'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {property.description && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">
                {locale === 'es' ? 'Descripción' : 'Description'}
              </h2>
              <p className="text-gray-700 whitespace-pre-line">{property.description}</p>
            </div>
          )}
        </div>

        {/* Sidebar - Contact Form or Additional Info */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
            <h3 className="text-xl font-bold mb-4">
              {locale === 'es' ? 'Información Adicional' : 'Additional Information'}
            </h3>
            <div className="space-y-3 text-sm">
              {property.property_type && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">
                    {locale === 'es' ? 'Tipo' : 'Type'}:
                  </span>
                  <span className="font-medium">
                    {locale === 'es' ? property.property_type.es_name : property.property_type.name}
                  </span>
                </div>
              )}
              {property.status && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">
                    {locale === 'es' ? 'Estado' : 'Status'}:
                  </span>
                  <span className="font-medium">
                    {locale === 'es' ? property.status.es_name : property.status.name}
                  </span>
                </div>
              )}
              {property.city && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">
                    {locale === 'es' ? 'Ciudad' : 'City'}:
                  </span>
                  <span className="font-medium">{property.city}</span>
                </div>
              )}
              {property.state && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">
                    {locale === 'es' ? 'Estado' : 'State'}:
                  </span>
                  <span className="font-medium">{property.state}</span>
                </div>
              )}
              {property.zip_code && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">
                    {locale === 'es' ? 'Código Postal' : 'Zip Code'}:
                  </span>
                  <span className="font-medium">{property.zip_code}</span>
                </div>
              )}
              {property.neighborhood && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">
                    {locale === 'es' ? 'Colonia' : 'Neighborhood'}:
                  </span>
                  <span className="font-medium">{property.neighborhood}</span>
                </div>
              )}
            </div>

            <button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
              {locale === 'es' ? 'Contactar' : 'Contact Us'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
