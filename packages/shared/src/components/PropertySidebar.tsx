"use client";

import React from "react";
import type { Property } from "../types";
import styles from "./styles/PropertyDetailsGrid.module.css";

interface PropertySidebarProps {
  property: Property;
  locale?: string;
}

export const PropertySidebar: React.FC<PropertySidebarProps> = ({
  property,
  locale = "en",
}) => {
  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarCard}>
        <h3 className={styles.sidebarTitle}>
          {locale === "es"
            ? "Información Adicional"
            : "Additional Information"}
        </h3>
        <div className={styles.infoList}>
          {property.property_type && (
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>
                {locale === "es" ? "Tipo" : "Type"}:
              </span>
              <span className={styles.infoValue}>
                {locale === "es"
                  ? property.property_type.es_name
                  : property.property_type.name}
              </span>
            </div>
          )}
          {property.status && (
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>
                {locale === "es" ? "Estado" : "Status"}:
              </span>
              <span className={styles.infoValue}>
                {locale === "es"
                  ? property.status.es_name
                  : property.status.name}
              </span>
            </div>
          )}
          {property.city && (
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>
                {locale === "es" ? "Ciudad" : "City"}:
              </span>
              <span className={styles.infoValue}>
                {locale === "es" ? property.city.es_name : property.city.name}
              </span>
            </div>
          )}
          {property.state && (
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>
                {locale === "es" ? "Estado" : "State"}:
              </span>
              <span className={styles.infoValue}>
                {locale === "es" ? property.state.es_name : property.state.name}
              </span>
            </div>
          )}
          {property.zip_code && (
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>
                {locale === "es" ? "Código Postal" : "Zip Code"}:
              </span>
              <span className={styles.infoValue}>{property.zip_code}</span>
            </div>
          )}
          {property.neighborhood && (
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>
                {locale === "es" ? "Colonia" : "Neighborhood"}:
              </span>
              <span className={styles.infoValue}>
                {property.neighborhood}
              </span>
            </div>
          )}
        </div>

        <button className={styles.contactButton}>
          {locale === "es" ? "Contactar" : "Contact Us"}
        </button>
      </div>
    </div>
  );
};
