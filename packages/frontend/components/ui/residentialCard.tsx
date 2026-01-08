"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Home,
  Ruler,
  Bed,
  Bath,
  Car,
} from "lucide-react";
import { useT } from "@properlia/shared/components/TranslationProvider";
import { capitalizeEachWord } from "@/lib/utils/capitalizeEachWord";

interface ResidentialCardProps {
  id: string;
  title: string;
  property_type: string;
  images: string[];
  landArea: number;
  builtArea: number;
  price: number;
  status: string;
  rooms: number;
  bathrooms: number;
  slug?: string;
}

export const ResidentialCard = ({
  id,
  title,
  property_type,
  images,
  landArea,
  status,
  builtArea,
  price,
  rooms,
  bathrooms,
  slug,
}: ResidentialCardProps) => {
  const t = useT();

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
        className="relative h-64 bg-gray-200 group"
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

      <div className="p-5">
        <div className="flex justify-between items-center mb-4">
          <div className="text-xl text-left font-semibold text-gray-800 line-clamp-2">
            {title}
          </div>
          <div className="flex justify-between items-center mb-4">
            <div className="bg-primary border font-bold rounded-md px-3 font-sans py-1 text-[10px] uppercase m-0 flex justify-center items-center text-white">
              {status}
            </div>
            <div className="bg-primary border font-bold rounded-md px-3 font-sans py-1 text-[10px] uppercase m-0 flex justify-center items-center text-white">
              {property_type}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Home className="w-4 h-4 flex-shrink-0" />
            <div className="text-sm">
              <span className="font-medium text-gray-900">
                {landArea.toLocaleString()}
              </span>
              <span className="text-xs ml-1">m² {t("land")}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <Ruler className="w-4 h-4 flex-shrink-0" />
            <div className="text-sm">
              <span className="font-medium text-gray-900">
                {builtArea.toLocaleString()}
              </span>
              <span className="text-xs ml-1">m² {t("built")}</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Bed className="w-4 h-4 flex-shrink-0" />
            <div className="text-sm">
              <span className="font-medium text-gray-900">{rooms}</span>
              <span className="text-xs ml-1">{t("rooms")}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <Bath className="w-4 h-4 flex-shrink-0" />
            <div className="text-sm">
              <span className="font-medium text-gray-900">{bathrooms}</span>
              <span className="text-xs ml-1">{t("baths")}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Car className="w-4 h-4 flex-shrink-0" />
            <div className="text-sm">
              <span className="font-medium text-gray-900">{rooms}</span>
              <span className="text-xs ml-1">{t("car")}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4 pt-3 border-t border-gray-100">
          <span className="text-2xl font-bold text-gray-900">
            {formatPrice(price)}
          </span>
        </div>

        <div className="flex gap-x-5 flex-col md:flex-row">
          <Link
            href={`/properties/${slug || id}`}
            className="block w-full text-center py-2.5 px-4 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-md transition-colors duration-200"
          >
            {capitalizeEachWord(t("contactMe"))}
          </Link>
          <Link
            href={`/properties/${slug || id}`}
            className="block w-full text-center py-2.5 px-4 bg-green-500 hover:bg-green-800 text-white font-medium rounded-md transition-colors duration-200"
          >
            Whatsapp
          </Link>
        </div>
      </div>
    </div>
  );
};
