"use client";

import React from "react";
import type { Property } from "../types";
import { Breadcrumbs, type BreadcrumbItem } from "./Breadcrumbs";
import { ImageCarousel, type CarouselImage } from "./ImageCarousel";
import { PropertyDetailsGrid } from "./PropertyDetailsGrid";
import { getAbsoluteImageUrl } from "../lib/api-client";
import styles from "./styles/PropertyDetail.module.css";

interface PropertyDetailProps {
  property: Property;
  locale?: string;
}

export const PropertyDetail: React.FC<PropertyDetailProps> = ({
  property,
  locale = "en",
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
  const carouselImages: CarouselImage[] =
    property.images?.map((img) => ({
      url: getAbsoluteImageUrl(img.url),
      filename: img.filename,
    })) || [];

  // Debug logging
  console.log("PropertyDetail - property.images:", property.images);
  console.log("PropertyDetail - carouselImages:", carouselImages);

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
        <h1 className={styles.title}>{property.title}</h1>
        <p className={styles.price}>{formattedPrice}</p>
        {property.address && (
          <p className={styles.address}>{property.address}</p>
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
