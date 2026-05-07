"use client";

import React, { useState } from "react";
import Image from "next/image";
import styles from "./styles/ImageCarousel.module.css";
import { PhotoGalleryModal, CarouselImage } from "./PhotoGalleryModal";

export type { CarouselImage };

interface ImageCarouselProps {
  images: CarouselImage[];
  title: string;
  className?: string;
}

export const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  title,
  className = "",
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const preview = React.useMemo(() => images.slice(0, 5), [images]);
  const main = preview[0];
  const grid = preview.slice(1, 5);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  return (
    <>
      <div className={styles.wrapper}>
        <div className={styles.layout}>
          <section className={styles.left}>
            {main ? (
              <img src={main.url} alt={title} loading="lazy" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-zinc-500">
                No image
              </div>
            )}

            {/* See all photos button */}
            <button
              onClick={open}
              className={styles.seeAllButton}
              aria-label={`See all ${images.length} photos`}
            >
              See all {images.length} photos →
            </button>
          </section>
          <section className={styles.right}>
            {preview[1] && (
              <div className={`${styles.card} ${styles.green}`}>
                <img src={preview[1].url} alt={title} loading="lazy" />
              </div>
            )}
            {preview[2] && (
              <div className={`${styles.card} ${styles.yellow}`}>
                <img src={preview[2].url} alt={title} loading="lazy" />
              </div>
            )}
            {preview[3] && (
              <div className={`${styles.card} ${styles.red}`}>
                <img src={preview[3].url} alt={title} loading="lazy" />
              </div>
            )}
            {preview[4] && (
              <div className={`${styles.card} ${styles.purple}`}>
                <img src={preview[4].url} alt={title} loading="lazy" />
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Photo Gallery Modal */}
      <PhotoGalleryModal
        isOpen={isOpen}
        onClose={close}
        images={images}
        title={title}
      />
    </>
  );
};
