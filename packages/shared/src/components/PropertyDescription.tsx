"use client";

import React, { useState } from "react";
import styles from "./styles/PropertyDetailsGrid.module.css";
import { Button, Card, CardTitle } from "./ui";

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
    <Card padding="none" className="mb-6 min-w-0 overflow-hidden p-6">
      <CardTitle className="mb-4">
        {locale === "es" ? "Descripción" : "Description"}
      </CardTitle>
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
        <Button
          variant="link"
          onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
          className="mt-2"
        >
          {isDescriptionExpanded
            ? locale === "es"
              ? "Ver menos"
              : "Read less"
            : locale === "es"
            ? "Ver más"
            : "Read more"}
        </Button>
      </div>
    </Card>
  );
};
