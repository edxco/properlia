"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  useT,
  useLocale,
} from "@properlia/shared/components/TranslationProvider";
import { capitalizeEachWord } from "@/lib/utils/capitalizeEachWord";
import { getBadge, BadgeItem } from "@properlia/shared/lib/getBadge";
import { ListingType } from "@properlia/shared";
import { PropertyStatsGrid } from "./PropertyStatsGrid";

interface PropertyCardCompactProps {
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
  slug?: string;
}

export const PropertyCardCompact = ({
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
  slug,
}: PropertyCardCompactProps) => {
  const t = useT();
  const locale = useLocale();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

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

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
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

      <div className="p-4">
        <div className="text-md text-left font-semibold text-gray-800 line-clamp-1 mb-3">
          {title}
        </div>

        <PropertyStatsGrid
          landArea={landArea}
          builtArea={builtArea}
          rooms={rooms}
          bathrooms={bathrooms}
        />

        <div className="flex items-center gap-2 mb-4 pt-3 border-t border-gray-100">
          <span className="text-xl font-bold text-gray-900">
            {formatPrice(price)}
          </span>
        </div>

        <Link
          href={`/${locale}/properties/${slug || id}`}
          className="block w-full text-center py-2.5 px-4 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-md transition-colors duration-200"
        >
          {capitalizeEachWord(t("viewDetails") || "View Details")}
        </Link>
      </div>
    </div>
  );
};
