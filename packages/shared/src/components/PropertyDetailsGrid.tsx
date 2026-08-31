"use client";

import React from "react";
import type { Property } from "../types";
import styles from "./styles/PropertyDetailsGrid.module.css";
import { PropertyMainDetails } from "./PropertyMainDetails";
import { PropertyDescription } from "./PropertyDescription";
import { PropertySidebar } from "./PropertySidebar";

interface PropertyDetailsGridProps {
  property: Property;
  locale?: string;
}

export const PropertyDetailsGrid: React.FC<PropertyDetailsGridProps> = ({
  property,
  locale = "en",
}) => {
  return (
    <div className={styles.container}>
      {/* Main Details */}
      <div className={styles.mainContent}>
        <PropertyMainDetails property={property} locale={locale} />

        {/* Description */}
        {property.description && (
          <PropertyDescription description={property.description} locale={locale} />
        )}
      </div>

      {/* Sidebar - Contact Form or Additional Info */}
      <PropertySidebar property={property} locale={locale} />
    </div>
  );
};
