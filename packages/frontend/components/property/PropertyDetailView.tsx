"use client";

import { useState } from "react";
import { Bed, Bath, DoorOpen, Car, Home, Trees, Copy, Check } from "lucide-react";
import type { Property } from "@properlia/shared/types";
import { getAbsoluteImageUrl } from "@properlia/shared";
import { useT } from "@properlia/shared/components/TranslationProvider";
import { Breadcrumbs, type BreadcrumbItem } from "@properlia/shared/components/Breadcrumbs";
import { Button, Card, CardTitle, PageTitle, Price } from "@properlia/shared/components/ui";
import { PropertyGallery } from "./PropertyGallery";

interface PropertyDetailViewProps {
  property: Property;
  locale: string;
  title: string;
  description: string | null;
  breadcrumbs: BreadcrumbItem[];
}

export const PropertyDetailView = ({
  property,
  locale,
  title,
  description,
  breadcrumbs,
}: PropertyDetailViewProps) => {
  const t = useT();
  const isEs = locale === "es";
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(property.code);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    } catch {
      setCodeCopied(false);
    }
  };

  const label = (entity: { name: string; es_name: string }) =>
    (isEs && entity.es_name) || entity.name;
  const formatNumber = (value: number) => value.toLocaleString(isEs ? "es-MX" : "en-US");

  const formattedPrice = new Intl.NumberFormat(isEs ? "es-MX" : "en-US", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
  }).format(property.price);

  const images = property.images.map((img) => getAbsoluteImageUrl(img.url));

  const stats = [
    property.built_area
      ? { icon: Home, label: t("propertyDetailBuiltArea"), value: `${formatNumber(property.built_area)} m²` }
      : null,
    property.land_area
      ? { icon: Trees, label: t("propertyDetailLandArea"), value: `${formatNumber(property.land_area)} m²` }
      : null,
    property.rooms > 0 ? { icon: Bed, label: t("propertyDetailBedrooms"), value: property.rooms } : null,
    property.bathrooms > 0
      ? { icon: Bath, label: t("propertyDetailBathrooms"), value: property.bathrooms }
      : null,
    property.half_bathrooms > 0
      ? { icon: DoorOpen, label: t("propertyDetailHalfBathrooms"), value: property.half_bathrooms }
      : null,
    property.parking_spaces > 0
      ? { icon: Car, label: t("propertyDetailParking"), value: property.parking_spaces }
      : null,
  ].filter(Boolean) as { icon: typeof Home; label: string; value: string | number }[];

  const infoRows = [
    property.property_type && { label: t("propertyDetailType"), value: label(property.property_type) },
    property.status && { label: t("propertyDetailStatus"), value: label(property.status) },
    property.city && { label: t("city"), value: label(property.city) },
    property.state && { label: t("state"), value: label(property.state) },
    property.zip_code && { label: t("zipCode"), value: property.zip_code },
    property.neighborhood && { label: t("neighborhood"), value: property.neighborhood },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="mx-auto max-w-[1180px] px-4 py-8 md:px-10">
      {breadcrumbs.length > 0 && <Breadcrumbs items={breadcrumbs} className="mb-4" />}

      <header className="mb-6">
        <PageTitle className="text-3xl md:text-4xl">{title}</PageTitle>
        <div className="mt-2 flex flex-wrap items-baseline gap-2">
          <Price className="text-2xl">{formattedPrice}</Price>
          <span className="text-sm text-brand-gray">MXN</span>
        </div>
        {property.address && <p className="mt-2 text-brand-carbon/70">{property.address}</p>}
        {property.code && (
          <div className="mt-3 flex items-center gap-2 text-sm text-brand-gray">
            <span>{t("propertyCode")}</span>
            <span className="font-medium tabular-nums tracking-wide text-brand-navy">{property.code}</span>
            <button
              type="button"
              onClick={copyCode}
              aria-label={codeCopied ? t("propertyCodeCopied") : t("propertyCodeCopy")}
              title={codeCopied ? t("propertyCodeCopied") : t("propertyCodeCopy")}
              className="inline-flex size-7 items-center justify-center rounded-full text-brand-gray transition-colors hover:bg-brand-pale hover:text-brand-blue"
            >
              {codeCopied ? <Check size={16} strokeWidth={1.75} /> : <Copy size={16} strokeWidth={1.75} />}
            </button>
          </div>
        )}
      </header>

      <PropertyGallery images={images} title={title} />

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-8 lg:col-span-2">
          {stats.length > 0 && (
            <Card padding="none" className="p-6">
              <CardTitle className="mb-5">{t("propertyDetails")}</CardTitle>
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
                {stats.map(({ icon: Icon, label: statLabel, value }) => (
                  <div key={statLabel} className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-pale text-brand-navy">
                      <Icon size={20} strokeWidth={1.75} />
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-brand-gray">{statLabel}</p>
                      <p className="mt-0.5 text-lg font-medium tabular-nums text-brand-carbon">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {description && (
            <Card padding="none" className="p-6">
              <CardTitle className="mb-4">{t("description")}</CardTitle>
              <p
                className={`whitespace-pre-line text-base leading-relaxed text-brand-carbon ${
                  descriptionExpanded ? "" : "line-clamp-5"
                }`}
              >
                {description}
              </p>
              <Button
                variant="link"
                size="sm"
                onClick={() => setDescriptionExpanded((v) => !v)}
                className="mt-3 px-0"
              >
                {descriptionExpanded ? t("propertyDetailReadLess") : t("propertyDetailReadMore")}
              </Button>
            </Card>
          )}
        </div>

        <aside className="lg:col-span-1">
          <Card padding="none" className="p-6 lg:sticky lg:top-24">
            <h3 className="mb-4 text-lg font-medium text-brand-carbon">
              {t("propertyDetailAdditionalInfo")}
            </h3>
            <dl className="flex flex-col gap-3">
              {infoRows.map((row) => (
                <div key={row.label} className="flex justify-between gap-4">
                  <dt className="text-xs font-medium uppercase tracking-wide text-brand-gray">{row.label}</dt>
                  <dd className="text-right text-sm text-brand-carbon">{row.value}</dd>
                </div>
              ))}
            </dl>

            <Button className="mt-6 w-full">{t("propertyDetailContact")}</Button>
          </Card>
        </aside>
      </div>
    </div>
  );
};
