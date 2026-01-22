"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  useT,
  useLocale,
} from "@properlia/shared/components/TranslationProvider";
import { capitalizeEachWord } from "@/lib/utils/capitalizeEachWord";
import { getBadge, BadgeItem } from "@properlia/shared/lib/getBadge";
import { ListingType, PropertyFeature, PropertyCategory } from "@properlia/shared";
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
    if (images.length <= 1 || isHovered) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [images.length, isHovered]);

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
    if (ids.includes('6ba7b810-9dad-11d1-80b4-00c04fd430c8')) return "bg-orange-400/100";
    if (ids.includes('70928012-73a7-4790-9556-9a25b29b6e82'))  return "bg-yellow-400/100";
    if (ids.includes('e49a8880-60b6-4550-9831-2746498c09d5'))  return "bg-gray-400/100";

    return "bg-yellow-400";
  };

  return (
    <div className="bg-white mb-4 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      <div
        className="relative h-48 bg-gray-200 group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {images.map((image, index) => (
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
        ))}

        {/* Badges overlay on top left */}
        <div className="absolute top-3 left-3 flex gap-2 flex-wrap z-10">
          {getBadge(listing_types, locale)}
          {getBadge(property_type, locale)}
        </div>

        {images.length > 1 && (
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

        {images.length > 1 && (
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

      <div className="pt-4">
        <div className="px-4 text-md text-left font-semibold text-gray-800 line-clamp-1 mb-4">
          {title}
        </div>

        <div className="px-4">
        {compact ? (
          <PropertyStatsGrid
            landArea={landArea}
            builtArea={builtArea}
            rooms={rooms}
            bathrooms={bathrooms}
            half_bathrooms={half_bathrooms}
          />
        ) : (
          <PropertyLabelStats
            landArea={landArea}
            builtArea={builtArea}
            rooms={rooms}
            bathrooms={bathrooms}
            half_bathrooms={half_bathrooms}
          />
        )}
        </div>

        <div className="h-10 px-4">
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
        </div>

        <div className="px-4 flex items-center gap-2 mb-4 pt-3 border-t border-gray-100">
          <span className="text-2xl font-bold text-gray-900">
            {formatPrice(price)} MXN
          </span>
        </div>

        <div className="px-4 flex gap-x-5 flex-col md:flex-row">
          <Link
            href={`/properties/${slug || id}`}
            className="block w-full text-center py-1 px-4 bg-primary hover:bg-gray-800 text-white font-light text-sm rounded-sm transition-colors duration-200"
          >
            {capitalizeEachWord(t("viewDetails"))}
          </Link>
          <Link
            href={whatsappLink}
            className="block w-full text-center py-1 px-4 bg-green-500 hover:bg-green-800 text-white font-light text-sm rounded-sm transition-colors duration-200"
          >
            Whatsapp
          </Link>
        </div>

        {property_categories.length > 0 && (
          <div className={`mt-5 pt-1 pb-1 mb-0 border ${getCategoryBg()} text-center flex justify-center items-center content-center`}>
            <span className="text-xs text-white font-light tracking-wider">
              {property_categories
                .map((cat) => (locale === "es" ? cat.es_name : cat.name))
                .join(", ")}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
