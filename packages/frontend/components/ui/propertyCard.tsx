"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Phone,
  MapPin,
  LandPlot,
  Home,
} from "lucide-react";
import {
  useT,
  useLocale,
} from "@properlia/shared/components/TranslationProvider";
import { getBadge, BadgeItem } from "@properlia/shared/lib/getBadge";
import { buildPropertyUrl } from "@properlia/shared/lib/slugify";
import {
  ListingType,
  PropertyFeature,
  PropertyCategory,
} from "@properlia/shared";
import { PropertyLabelStats } from "./PropertyLabelStats";
import { useGeneralInfo } from "@/src/services/general-info/queries";
import { PropertyStatsGrid } from "./PropertyStatsGrid";

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
  city?: string | null;
  state?: string | null;
  autoplay?: boolean;
}

export const PropertyCard = ({
  id,
  title,
  property_type,
  images,
  landArea,
  status,
  listing_types,
  builtArea,
  price,
  rooms,
  bathrooms,
  half_bathrooms,
  compact = false,
  property_features = [],
  property_categories = [],
  neighborhood,
  city,
  state,
  autoplay = false,
}: PropertyCardProps) => {
  const t = useT();
  const locale = useLocale();
  const { data: generalInfo, isLoading, isError } = useGeneralInfo();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const propertyPath = `/${locale}${buildPropertyUrl({
    id,
    title,
    state,
    city,
  })}`;

  // Construct the full property URL for WhatsApp sharing
  const propertyUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${propertyPath}`
      : "";

  const whatsappMessage = `Hola! Me interesa esta propiedad:\n${title}\n${property_type.es_name} en ${listing_types.es_name}\n${propertyUrl}`;
  const whatsappLink = `https://wa.me/${
    generalInfo?.whatsapp
  }?text=${encodeURIComponent(whatsappMessage)}`;

  // Autoplay carousel
  useEffect(() => {
    if (!autoplay || images.length <= 1 || isHovered) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [autoplay, images.length, isHovered]);

  const goToPrevious = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getCategoryBg = () => {
    const ids = property_categories.map((cat) => cat.id);
    if (ids.length > 1) return "bg-linear-to-r from-cyan-400 to-blue-500"; // multiple categories
    if (ids.includes("6ba7b810-9dad-11d1-80b4-00c04fd430c8"))
      return "bg-orange-400/100";
    if (ids.includes("70928012-73a7-4790-9556-9a25b29b6e82"))
      return "bg-yellow-400/100";
    if (ids.includes("e49a8880-60b6-4550-9831-2746498c09d5"))
      return "bg-gray-400/100";

    return "bg-yellow-400";
  };

  return (
    <Link
      href={propertyPath}
      className="flex flex-col bg-white mb-4 rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 h-full"
    >
      <div
        className="relative h-42 bg-gray-200 group"
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

        {/* Badges overlay on top left */}
        <div className="absolute top-3 left-3 flex gap-2 flex-wrap z-10">
          {getBadge(listing_types, locale)}
          {getBadge(property_type, locale)}
        </div>

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

        {/* Area badges on bottom right */}
        <div className="absolute bottom-3 right-3 flex gap-1.5 z-10">
          {landArea > 0 && (
            <span className="flex items-center gap-1 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-medium px-2 py-1 rounded shadow-sm whitespace-nowrap">
              <LandPlot className="w-3.5 h-3.5" />
              {landArea.toLocaleString()} m²
            </span>
          )}
          {builtArea > 0 && (
            <span className="flex items-center gap-1 bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-medium px-2 py-1 rounded shadow-sm whitespace-nowrap">
              <Home className="w-3.5 h-3.5" />
              {builtArea.toLocaleString()} m²
            </span>
          )}
        </div>

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

      <div className="pt-0 flex flex-col flex-grow">
        {/* Top content - grows to push bottom elements down */}
        <div className="px-4 pt-5 pb-3 flex-grow">
          <div></div>
          <div className="text-xl font-light text-gray-900">
            <span>{formatPrice(price)}</span>
            <span className="text-xs text-gray-500 ml-1"> MXN</span>
          </div>
          {(neighborhood || city || state) && (
            <div className="flex items-start gap-1.5 text-gray-500 text-xs mt-2">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              {/* <span className="truncate">
                {[neighborhood, city, state].filter(Boolean).join(", ")}
              </span> */}
              <div>
                <p>{neighborhood}</p>
                <p className="text-gray-900">
                  {city}, {state}
                </p>
              </div>
            </div>
          )}

          {/* <div className="px-4">
            {compact ? (
              <PropertyStatsGrid
                rooms={rooms}
                bathrooms={bathrooms}
                half_bathrooms={half_bathrooms}
                property_type={property_type.id}
              />
            ) : (
              <PropertyLabelStats
                property_category={property_categories}
                property_type={property_type.id}
                rooms={rooms}
                bathrooms={bathrooms}
                half_bathrooms={half_bathrooms}
              />
            )}
          </div> */}
        </div>

        {/* Bottom content - always at bottom */}
        <div className="mt-auto">
          {property_categories.length > 0 && (
            <div
              className={`pt-1 pb-1 mb-0 border ${getCategoryBg()} text-center flex justify-center items-center content-center`}
            >
              <span className="text-xs text-white tracking-wider">
                {property_categories
                  .map((cat) => (locale === "es" ? cat.es_name : cat.name))
                  .join(", ")}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};
