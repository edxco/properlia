"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
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
  slug?: string;
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
  slug,
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
  const pathname = usePathname();
  const { data: generalInfo, isLoading, isError } = useGeneralInfo();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Construct the full property URL for WhatsApp sharing
  const propertyUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}${pathname}/properties/${slug || id}`
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
      href={`/properties/${slug || id}`}
      className="flex flex-col bg-white mb-4 mx-4 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 h-full"
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
        <div className="flex-grow">
          {(neighborhood || city || state) && (
            <div className="px-3 flex items-center gap-1.5 text-gray-500 text-xs my-4">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">
                {[neighborhood, city, state].filter(Boolean).join(", ")}
              </span>
            </div>
          )}
          <div className="px-4 text-md h-13 text-left font-semibold text-gray-800 line-clamp-2 mb-1">
            {title}
          </div>

          <div className="px-4">
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
          </div>

          {/* <div className="h-10 px-4">
            {property_features.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {property_features.slice(0, 3).map((feature) => (
                  <span
                    key={feature.id}
                    className="inline-block rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600"
                  >
                    {locale === "es" ? feature.es_name : feature.name}
                  </span>
                ))}
                {property_features.length > 3 && (
                  <span className="inline-block rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600">
                    +{property_features.length - 3}
                  </span>
                )}
              </div>
            )}
          </div> */}
        </div>

        {/* Bottom content - always at bottom */}
        <div className="mt-auto">
          <div className="px-4 flex items-center gap-2 mb-4 pt-3 border-t border-gray-100">
            <span className="text-2xl font-bold text-gray-900">
              <span>{formatPrice(price)}</span><span className="text-sm text-gray-500 ml-1"> MXN</span>
            </span>
          </div>

          <div className="px-4 pb-4 flex gap-3">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = `tel:${generalInfo?.phone || ""}`;
              }}
              className="flex items-center justify-center p-2 bg-properlia-gray hover:bg-properlia-gray/70 text-white rounded-sm transition-colors duration-200"
            >
              <Phone className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.open(whatsappLink, "_blank");
              }}
              className="flex items-center justify-center p-2 bg-green-500 hover:bg-green-600 text-white rounded-sm transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.open(whatsappLink, "_blank");
              }}
              className="flex-1 text-center py-2 px-4 bg-primary hover:bg-gray-800 text-white font-normal text-sm rounded-sm transition-colors duration-200"
            >
              {t("sendProperty")}
            </button>
          </div>

          {property_categories.length > 0 && (
            <div
              className={`pt-1 pb-1 mb-0 border ${getCategoryBg()} text-center flex justify-center items-center content-center`}
            >
              <span className="text-xs text-white font-light tracking-wider">
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
