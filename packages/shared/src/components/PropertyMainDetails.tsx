"use client";

import React from "react";
import type { Property } from "../types";
import styles from "./styles/PropertyDetailsGrid.module.css";
import shower from "./public/shower.svg";
import toilet from "./public/toilet.svg";
import parking from "./public/parking.svg";
import bed from "./public/bed.svg";
import land_area from "./public/land_area.svg";
import home_area from "./public/construction-house.svg";
import { useT } from "./TranslationProvider";

interface PropertyMainDetailsProps {
  property: Property;
  locale?: string;
}

export const PropertyMainDetails: React.FC<PropertyMainDetailsProps> = ({
  property,
  locale = "en",
}) => {
  const t = useT();

  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>
        {t("propertyDetails")}
        {locale === "es" ? "Detalles de la Propiedad" : "Property Details"}
      </h2>
      <div className={styles.detailsGrid}>
        {property.built_area && (
          <div className={styles.detailItem}>
            <div>
              <img
                src={home_area.src || home_area}
                alt="Built Area"
                width={32}
                height={32}
                className={styles.imagePropertyIcon}
              />
            </div>
            <div>
              <p className={styles.detailLabel}>
                {locale === "es" ? "m² Construidos" : "Built Area m²"}
              </p>
              <p className={styles.detailNumber}>
                {property.built_area.toLocaleString()} m&#178;
              </p>
            </div>
          </div>
        )}
        {property.land_area && (
          <div className={styles.detailItem}>
            <div>
              <img
                src={land_area.src || land_area}
                alt="Land Area"
                width={32}
                height={32}
                className={styles.imagePropertyIcon}
              />
            </div>
            <div>
              <p className={styles.detailLabel}>
                {locale === "es" ? "m² de Terreno" : "Land Area m²"}
              </p>
              <p className={styles.detailNumber}>
                {property.land_area.toLocaleString()} m&#178;
              </p>
            </div>
          </div>
        )}
        {property.rooms > 0 && (
          <div className={styles.detailItem}>
            <div>
              <img
                src={bed.src || bed}
                alt="Rooms"
                width={32}
                height={32}
                className={styles.imagePropertyIcon}
              />
            </div>
            <div>
              <p className={styles.detailLabel}>
                {locale === "es" ? "Habitaciones" : "Bedrooms"}
              </p>
              <p className={styles.detailNumber}>{property.rooms}</p>
            </div>
          </div>
        )}
        {property.bathrooms > 0 && (
          <div className={styles.detailItem}>
            <div>
              <img
                src={shower.src || shower}
                alt="Full Bathroom"
                width={32}
                height={32}
                className={styles.imagePropertyIcon}
              />
            </div>
            <div>
              <p className={styles.detailLabel}>
                {locale === "es" ? "Baños" : "Bathrooms"}
              </p>
              <p className={styles.detailNumber}>{property.bathrooms}</p>
            </div>
          </div>
        )}
        {property.half_bathrooms > 0 && (
          <div className={styles.detailItem}>
            <div>
              <img
                src={toilet.src || toilet}
                alt="Half Bathroom"
                width={32}
                height={32}
                className={styles.imagePropertyIcon}
              />
            </div>
            <div>
              <p className={styles.detailLabel}>
                {locale === "es" ? "Medios Baños" : "Half Baths"}
              </p>
              <p className={styles.detailNumber}>{property.half_bathrooms}</p>
            </div>
          </div>
        )}
        {property.parking_spaces > 0 && (
          <div className={styles.detailItem}>
            <div>
              <img
                src={parking.src || parking}
                alt="Parking spaces"
                width={32}
                height={32}
                className={styles.imagePropertyIcon}
              />
            </div>
            <div>
              <p className={styles.detailLabel}>
                {locale === "es" ? "Estacionamientos" : "Parking"}
              </p>
              <p className={styles.detailNumber}>{property.parking_spaces}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
