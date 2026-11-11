"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useT } from "@properlia/shared/components/TranslationProvider";
import { buttonClasses } from "@properlia/shared/components/ui";

interface PropertyGalleryProps {
  images: string[];
  title: string;
}

export const PropertyGallery = ({ images, title }: PropertyGalleryProps) => {
  const t = useT();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const isUnoptimized = (src: string) =>
    src.includes("localhost") || src.includes("rails/active_storage");

  useEffect(() => {
    if (lightboxIndex === null) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowLeft")
        setLightboxIndex((i) => (i === null ? i : (i - 1 + images.length) % images.length));
      if (e.key === "ArrowRight")
        setLightboxIndex((i) => (i === null ? i : (i + 1) % images.length));
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxIndex, images.length]);

  if (images.length === 0) {
    return (
      <div
        className="flex h-[420px] w-full items-center justify-center rounded-card bg-brand-pale text-sm text-brand-gray"
      >
        {t("propertyDetailNoImages")}
      </div>
    );
  }

  const preview = images.slice(0, 5);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-2 rounded-card overflow-hidden md:h-[440px]">
        <button
          onClick={() => setLightboxIndex(0)}
          className="relative md:col-span-2 md:row-span-2 h-64 sm:h-80 md:h-full"
        >
          <Image
            src={preview[0]}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
            unoptimized={isUnoptimized(preview[0])}
          />
        </button>

        {preview.slice(1).map((src, i) => (
          <button
            key={i}
            onClick={() => setLightboxIndex(i + 1)}
            className="relative hidden md:block h-full"
          >
            <Image
              src={src}
              alt={`${title} - ${i + 2}`}
              fill
              className="object-cover"
              sizes="25vw"
              unoptimized={isUnoptimized(src)}
            />
            {i === 3 && images.length > 5 && (
              <div
                className="absolute inset-0 flex items-center justify-center bg-brand-navy/60 text-lg font-medium tabular-nums text-white"
              >
                +{images.length - 5}
              </div>
            )}
          </button>
        ))}
      </div>

      {images.length > 1 && (
        <div className="mt-2 grid grid-cols-3 gap-2 md:hidden">
          {images.slice(1, 4).map((src, i) => (
            <button
              key={i}
              onClick={() => setLightboxIndex(i + 1)}
              className="relative h-24 overflow-hidden rounded-xl sm:h-32"
            >
              <Image
                src={src}
                alt={`${title} - ${i + 2}`}
                fill
                className="object-cover"
                sizes="33vw"
                unoptimized={isUnoptimized(src)}
              />
              {i === 2 && images.length > 4 && (
                <div className="absolute inset-0 flex items-center justify-center bg-brand-navy/60 text-base font-medium tabular-nums text-white">
                  +{images.length - 4}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {images.length > 1 && (
        <button
          onClick={() => setLightboxIndex(0)}
          className={buttonClasses({ variant: "secondary", size: "sm", className: "mt-3 w-full md:hidden" })}
        >
          {t("propertyDetailSeeAllPhotos").replace("{count}", String(images.length))}
        </button>
      )}

      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-brand-navy/95 flex items-center justify-center"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-5 right-5 z-10 text-white/80 hover:text-white"
            aria-label={t("propertyDetailCloseGallery")}
          >
            <X size={28} strokeWidth={1.75} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((i) => (i === null ? i : (i - 1 + images.length) % images.length));
            }}
            className="absolute left-2 md:left-8 z-10 rounded-full bg-brand-navy/50 p-1 text-white/80 hover:text-white md:bg-transparent md:p-0"
            aria-label={t("propertyDetailPreviousImage")}
          >
            <ChevronLeft size={36} strokeWidth={1.75} />
          </button>

          <div
            className="relative w-[90vw] h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[lightboxIndex]}
              alt={`${title} - ${lightboxIndex + 1}`}
              fill
              className="object-contain"
              sizes="90vw"
              unoptimized={isUnoptimized(images[lightboxIndex])}
            />
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((i) => (i === null ? i : (i + 1) % images.length));
            }}
            className="absolute right-2 md:right-8 z-10 rounded-full bg-brand-navy/50 p-1 text-white/80 hover:text-white md:bg-transparent md:p-0"
            aria-label={t("propertyDetailNextImage")}
          >
            <ChevronRight size={36} strokeWidth={1.75} />
          </button>

          <div
            className="absolute bottom-5 left-1/2 -translate-x-1/2 text-sm tabular-nums text-white/80"
          >
            {lightboxIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
};
