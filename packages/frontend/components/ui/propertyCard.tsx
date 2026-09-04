"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale } from "@properlia/shared/components/TranslationProvider";
import { BadgeItem } from "@properlia/shared/lib/getBadge";
import { buildPropertyUrl } from "@properlia/shared/lib/slugify";
import {
  ListingType,
  PropertyFeature,
  PropertyCategory,
} from "@properlia/shared";

// --- Tabler-style inline SVG icons (currentColor, 24×24 grid) ---
const IcoHouse = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M5 12l-2 0l9 -9l9 9l-2 0" />
    <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7" />
    <path d="M10 12h4v4h-4z" />
  </svg>
);

const IcoApartment = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M3 21l18 0" />
    <path d="M5 21v-14l8 -4v18" />
    <path d="M19 21v-10l-6 -4" />
    <path d="M9 9l0 .01" />
    <path d="M9 12l0 .01" />
    <path d="M9 15l0 .01" />
    <path d="M9 18l0 .01" />
  </svg>
);

const IcoLand = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M12 5m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
    <path d="M19 8m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
    <path d="M5 11m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
    <path d="M15 19m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
    <path d="M6.5 9.5l3.5 -3" />
    <path d="M14 5.5l3 1.5" />
    <path d="M18.5 10l-2.5 7" />
    <path d="M13.5 17.5l-7 -5" />
  </svg>
);

const IcoRetailSpace = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M3 21l18 0" />
    <path d="M3 7v1a3 3 0 0 0 6 0v-1m0 1a3 3 0 0 0 6 0v-1m0 1a3 3 0 0 0 6 0v-1h-18l2 -4h14l2 4" />
    <path d="M5 21l0 -10.15" />
    <path d="M19 21l0 -10.15" />
    <path d="M9 21v-4a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v4" />
  </svg>
);

const IcoWarehouse = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M3 21v-13l9 -4l9 4v13" />
    <path d="M13 13h4v8h-10v-6h6" />
    <path d="M13 21v-9a1 1 0 0 0 -1 -1h-2a1 1 0 0 0 -1 1v3" />
  </svg>
);

const IcoOffice = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M3 21l18 0" />
    <path d="M9 8l1 0" />
    <path d="M9 12l1 0" />
    <path d="M9 16l1 0" />
    <path d="M14 8l1 0" />
    <path d="M14 12l1 0" />
    <path d="M14 16l1 0" />
    <path d="M5 21v-16a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v16" />
  </svg>
);

const IcoMapPin = ({ size = 17 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
    <path d="M17.657 16.657l-4.243 4.243a2 2 0 0 1 -2.827 0l-4.244 -4.243a8 8 0 1 1 11.314 0z" />
  </svg>
);

// property-type ID → icon component
const PROPERTY_TYPE_ICON: Record<string, React.FC<{ size?: number }>> = {
  "6431658b-1ebc-4805-ac61-97bf39699353": IcoHouse,
  "0221da24-d7df-4052-a63d-2d16501ec360": IcoApartment,
  "23d3905f-a5c1-4372-995e-362b2c10f77f": IcoLand,
  "044af3c1-7cea-4ec5-86e7-07b10afdb147": IcoRetailSpace,
  "37beb05a-ff6a-4138-8959-c2c9be60e6f5": IcoWarehouse,
};

// category ID → brand color + banner icon
const CATEGORY_CONFIG: Record<
  string,
  { color: string; Icon: React.FC<{ size?: number }> }
> = {
  "6ba7b810-9dad-11d1-80b4-00c04fd430c8": { color: "var(--blue)", Icon: IcoHouse },
  "70928012-73a7-4790-9556-9a25b29b6e82": { color: "var(--navy)", Icon: IcoOffice },
  "e49a8880-60b6-4550-9831-2746498c09d5": { color: "var(--carbon)", Icon: IcoWarehouse },
};

// listing-type ID → operation pill colors (per brand guidelines)
const OPERATION_CONFIG: Record<string, { background: string; color: string }> = {
  "b8e9f3d2-4c5a-6b7e-0f9e-8d2c3b4e5f6a": { background: "var(--blue)", color: "#fff" }, // venta
  "c9f0e4d3-5c6b-7a8e-1f0e-9d3c4b5e6f7b": { background: "var(--blue)", color: "#fff" }, // renta
  "a7f8e2d1-3c4b-5a6e-9f8d-7c1b2a3e4f5d": { background: "var(--navy)", color: "var(--gold)" }, // preventa
};

const formatPrice = (value: number) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

interface PropertyCardProps {
  id: string;
  title: string;
  property_type: BadgeItem;
  images: string[];
  landArea: number;
  builtArea: number;
  price: number;
  status: BadgeItem;
  listing_types: ListingType;
  rooms: number;
  bathrooms: number;
  half_bathrooms: number;
  compact?: boolean;
  property_features?: PropertyFeature[];
  property_categories?: PropertyCategory[];
  neighborhood?: string | null;
  city?: { name: string; es_name: string } | null;
  state?: { name: string; es_name: string } | null;
  autoplay?: boolean;
}

export const PropertyCard = ({
  id,
  title,
  property_type,
  images,
  landArea,
  builtArea,
  price,
  listing_types,
  compact = false,
  property_features = [],
  property_categories = [],
  neighborhood,
  city,
  state,
  autoplay = false,
}: PropertyCardProps) => {
  const locale = useLocale();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const propertyPath = `/${locale}${buildPropertyUrl({ id, title, state, city })}`;

  useEffect(() => {
    if (!autoplay || images.length <= 1 || isHovered) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((i) => (i === images.length - 1 ? 0 : i + 1));
    }, 3000);
    return () => clearInterval(interval);
  }, [autoplay, images.length, isHovered]);

  const goToPrevious = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  };

  const goToNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  };

  // --- Pills ---
  const operationLabel =
    locale === "es" ? listing_types.es_name : listing_types.name;
  const operationColors =
    OPERATION_CONFIG[listing_types.id] ?? { background: "var(--blue-light)", color: "var(--blue)" };

  const typeLabel =
    locale === "es" ? property_type.es_name : property_type.name;
  const TypeIcon = PROPERTY_TYPE_ICON[property_type.id] ?? IcoHouse;

  // --- Category banner ---
  const getCategoryBg = () => {
    const colors = property_categories
      .map((cat) => CATEGORY_CONFIG[cat.id]?.color)
      .filter(Boolean) as string[];

    return { background: colors[0] ?? "var(--blue)" };
  };

  const firstCategoryConfig =
    property_categories.length > 0
      ? CATEGORY_CONFIG[property_categories[0].id]
      : null;
  const BannerIcon = firstCategoryConfig?.Icon ?? IcoHouse;

  const categoryLabel = property_categories
    .map((cat) => (locale === "es" ? cat.es_name : cat.name))
    .join(" · ");

  return (
    <Link
      href={propertyPath}
      className="flex flex-col bg-white rounded-2xl overflow-hidden h-full"
      style={{
        border: "1px solid var(--border)",
        boxShadow:
          "0 1px 2px rgba(20,30,50,.06), 0 14px 30px -22px rgba(20,30,50,.38)",
      }}
    >
      {/* Photo region */}
      <div
        className="relative shrink-0 group"
        style={{ height: 200, background: "var(--blue-light)" }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {autoplay
          ? images.map((image, index) => (
              <Image
                key={index}
                src={image}
                alt={`${title} - Image ${index + 1}`}
                fill
                className={`object-cover transition-opacity duration-700 ease-in-out ${
                  index === currentImageIndex ? "opacity-100" : "opacity-0"
                }`}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={index === 0}
                unoptimized={
                  image.includes("localhost") ||
                  image.includes("rails/active_storage")
                }
              />
            ))
          : images[0] && (
              <Image
                src={images[0]}
                alt={title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority
                unoptimized={
                  images[0].includes("localhost") ||
                  images[0].includes("rails/active_storage")
                }
              />
            )}

        {/* Top-left: operation + type pills */}
        <div className="absolute top-[14px] left-[14px] flex gap-2 z-10">
          <span
            className="inline-flex items-center font-medium rounded-full uppercase"
            style={{
              background: operationColors.background,
              color: operationColors.color,
              fontSize: 11,
              padding: "5px 11px",
              boxShadow: "0 1px 2px rgba(20,30,50,.14)",
            }}
          >
            {operationLabel}
          </span>
          <span
            className="inline-flex items-center gap-[5px] font-medium rounded-full uppercase"
            style={{
              background: "var(--navy)",
              color: "#fff",
              fontSize: 11,
              padding: "5px 11px",
              boxShadow: "0 1px 2px rgba(20,30,50,.22)",
            }}
          >
            <TypeIcon size={14} />
            {typeLabel}
          </span>
        </div>

        {/* Carousel controls */}
        {autoplay && images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5 text-gray-800" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5 text-gray-800" />
            </button>
          </>
        )}

        {/* Bottom-right: area badges */}
        <div
          className="absolute bottom-[14px] right-[14px] flex gap-2 z-10"
        >
          {landArea > 0 && (
            <span
              className="inline-flex items-center gap-[5px] font-medium rounded-full tabular-nums"
              style={{
                background: "rgba(255,255,255,.95)",
                color: "var(--carbon)",
                fontSize: 12,
                padding: "6px 10px",
                boxShadow: "0 1px 3px rgba(20,30,50,.18)",
              }}
            >
              <IcoLand size={15} />
              {landArea.toLocaleString()} m²
            </span>
          )}
          {builtArea > 0 && (
            <span
              className="inline-flex items-center gap-[5px] font-medium rounded-full tabular-nums"
              style={{
                background: "rgba(255,255,255,.95)",
                color: "var(--carbon)",
                fontSize: 12,
                padding: "6px 10px",
                boxShadow: "0 1px 3px rgba(20,30,50,.18)",
              }}
            >
              <IcoHouse size={15} />
              {builtArea.toLocaleString()} m²
            </span>
          )}
        </div>

        {/* Carousel dots */}
        {autoplay && images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrentImageIndex(index);
                }}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentImageIndex
                    ? "bg-white w-6"
                    : "bg-white/60 hover:bg-white/80"
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1" style={{ padding: "18px 18px 16px" }}>
        {/* Price */}
        <div className="flex items-baseline">
          <span
            className="font-medium tabular-nums"
            style={{
              color: "var(--gold)",
              fontSize: 23,
              letterSpacing: "-0.2px",
            }}
          >
            {formatPrice(price)}
          </span>
          <span
            className="font-normal ml-[6px]"
            style={{ color: "var(--text-secondary)", fontSize: 13 }}
          >
            MXN
          </span>
        </div>

        {/* Location */}
        {(neighborhood || city || state) && (
          <div
            className="flex items-start gap-2 mt-3"
            style={{ color: "var(--text-secondary)" }}
          >
            <IcoMapPin size={17} />
            <div>
              {neighborhood && (
                <p className="font-normal" style={{ color: "var(--carbon)", fontSize: 14 }}>
                  {neighborhood}
                </p>
              )}
              {(city || state) && (
                <p className="font-normal" style={{ color: "var(--text-secondary)", fontSize: 13 }}>
                  {[
                    locale === "es" ? city?.es_name : city?.name,
                    locale === "es" ? state?.es_name : state?.name,
                  ].filter(Boolean).join(", ")}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Category banner */}
      {property_categories.length > 0 && (
        <div
          className="flex items-center justify-center gap-[7px] shrink-0 py-1.5"
          style={{
            height: 'auto',
            color: "#fff",
            fontSize: 12,
            letterSpacing: "0.3px",
            ...getCategoryBg(),
          }}
        >
          <BannerIcon size={16} />
          <span>{categoryLabel}</span>
        </div>
      )}
    </Link>
  );
};
