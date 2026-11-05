"use client";

import React from "react";
import type { Property } from "../types";
import { Breadcrumbs, type BreadcrumbItem } from "./Breadcrumbs";
import { ImageCarousel, type CarouselImage } from "./ImageCarousel";
import { PropertyDetailsGrid } from "./PropertyDetailsGrid";
import { getAbsoluteImageUrl } from "../lib/api-client";
import styles from "./styles/PropertyDetail.module.css";
import { PageTitle, Price } from "./ui";

interface PropertyDetailProps {
  property: Property;
  locale?: string;
  breadcrumbs?: BreadcrumbItem[];
}

export const PropertyDetail: React.FC<PropertyDetailProps> = ({
  property,
  locale = "en",
  breadcrumbs,
}) => {
  // Build breadcrumb items: State > City > Zip Code > Neighborhood
  const breadcrumbItems: BreadcrumbItem[] = breadcrumbs ? [...breadcrumbs] : [];

  if (!breadcrumbs && property.state) {
    const stateLabel = (locale === "es" && property.state.es_name) || property.state.name;
    breadcrumbItems.push({
      label: stateLabel,
      href: `/properties?state_id=${encodeURIComponent(property.state.id)}`,
    });
  }

  if (!breadcrumbs && property.city) {
    const cityLabel = (locale === "es" && property.city.es_name) || property.city.name;
    breadcrumbItems.push({
      label: cityLabel,
      href: `/properties?city_id=${encodeURIComponent(property.city.id)}`,
    });
  }

  if (!breadcrumbs && property.zip_code) {
    breadcrumbItems.push({
      label: property.zip_code,
      href: `/properties?zip_code=${encodeURIComponent(property.zip_code)}`,
    });
  }

  if (!breadcrumbs && property.neighborhood) {
    breadcrumbItems.push({
      label: property.neighborhood,
    });
  }

  // Convert property images to carousel format
  const carouselImages: CarouselImage[] =
    property.images?.map((img) => ({
      url: getAbsoluteImageUrl(img.url),
      filename: img.filename,
    })) || [];

  // Format price
  const formattedPrice = new Intl.NumberFormat(
    locale === "es" ? "es-MX" : "en-US",
    {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 0,
    }
  ).format(property.price);

  return (
    <div className={styles.propertyDetailContainer}>
      {/* Breadcrumbs */}
      {breadcrumbItems.length > 0 && (
        <div className={styles.breadcrumbsWrapper}>
          <Breadcrumbs items={breadcrumbItems} />
        </div>
      )}

      {/* Title and Price */}
      <div className={styles.header}>
        <PageTitle className="mb-2 text-3xl md:text-4xl">{property.title}</PageTitle>
        <Price className="block text-2xl">{formattedPrice}</Price>
        {property.address && (
          <p className="mt-2 text-brand-carbon/70">{property.address}</p>
        )}
      </div>

      {/* Image Carousel */}
      <div className={styles.carouselWrapper}>
        <ImageCarousel images={carouselImages} title={property.title} />
      </div>

      {/* Property Details Grid */}
      <PropertyDetailsGrid property={property} locale={locale} />
    </div>
  );
};
