"use client";

import React, { useState } from "react";
import styles from "./styles/PropertyDetailsGrid.module.css";

interface PropertyDescriptionProps {
  description: string;
  locale?: string;
}

export const PropertyDescription: React.FC<PropertyDescriptionProps> = ({
  description,
  locale = "en",
}) => {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>
        {locale === "es" ? "Descripción" : "Description"}
      </h2>
      <div className={styles.descriptionWrapper}>
        <div
          className={`${styles.descriptionContent} ${
            isDescriptionExpanded ? styles.expanded : styles.collapsed
          }`}
        >
          <p className={styles.description}>{description}</p>
          {!isDescriptionExpanded && (
            <div className={styles.descriptionGradient} />
          )}
        </div>
        <button
          onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
          className={styles.readMoreButton}
        >
          {isDescriptionExpanded
            ? locale === "es"
              ? "Ver menos"
              : "Read less"
            : locale === "es"
            ? "Ver más"
            : "Read more"}
        </button>
      </div>
    </div>
  );
};
