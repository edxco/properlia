"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { textStyles } from "./typography";

interface PropertyGalleryProps {
  images: string[];
  title: string;
}

export const PropertyGallery = ({ images, title }: PropertyGalleryProps) => {
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
        className="w-full rounded-2xl flex items-center justify-center"
        style={{ height: 420, background: "#E8F0F8", ...textStyles.meta }}
      >
        No images
      </div>
    );
  }

  const preview = images.slice(0, 5);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-2 rounded-2xl overflow-hidden" style={{ height: 440 }}>
        <button
          onClick={() => setLightboxIndex(0)}
          className="relative md:col-span-2 md:row-span-2 h-56 md:h-full"
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
                className="absolute inset-0 flex items-center justify-center bg-black/50 text-white"
                style={{ ...textStyles.h3, color: "#fff" }}
              >
                +{images.length - 5}
              </div>
            )}
          </button>
        ))}
      </div>

      {images.length > 1 && (
        <button
          onClick={() => setLightboxIndex(0)}
          className="mt-3 md:hidden rounded-lg border w-full py-2"
          style={{ ...textStyles.button, color: "#1A3A5C", borderColor: "#EAEAE3" }}
        >
          See all {images.length} photos
        </button>
      )}

      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-5 right-5 text-white/80 hover:text-white"
            aria-label="Close"
          >
            <X size={28} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((i) => (i === null ? i : (i - 1 + images.length) % images.length));
            }}
            className="absolute left-4 md:left-8 text-white/80 hover:text-white"
            aria-label="Previous image"
          >
            <ChevronLeft size={36} />
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
            className="absolute right-4 md:right-8 text-white/80 hover:text-white"
            aria-label="Next image"
          >
            <ChevronRight size={36} />
          </button>

          <div
            className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/80"
            style={textStyles.meta}
          >
            {lightboxIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
};
