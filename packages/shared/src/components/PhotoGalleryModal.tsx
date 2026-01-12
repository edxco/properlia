'use client';

import React from 'react';
import styles from './styles/PhotoGalleryModal.module.css';

export interface CarouselImage {
  url: string;
  filename: string;
}

interface PhotoGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: CarouselImage[];
  title: string;
}

export const PhotoGalleryModal: React.FC<PhotoGalleryModalProps> = ({
  isOpen,
  onClose,
  images,
  title,
}) => {
  const closeBtnRef = React.useRef<HTMLButtonElement | null>(null);
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  React.useEffect(() => {
    if (!isOpen) return;

    // Lock body scroll
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus close button
    const t = window.setTimeout(() => closeBtnRef.current?.focus(), 0);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'ArrowLeft') goToPrevious();
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose]);

  // Reset to first image when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentImage = images[currentIndex];

  return (
    <div
      className={styles.modalOverlay}
      role="dialog"
      aria-modal="true"
      aria-label={`${title} photo gallery`}
    >
      {/* Backdrop */}
      <div
        className={styles.backdrop}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className={styles.panel}>
        <div className={styles.modalContent}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerInfo}>
              <h2 className={styles.title}>
                {title}
              </h2>
              <p className={styles.photoCount}>
                {currentIndex + 1} / {images.length} photo
              </p>
            </div>

            <button
              ref={closeBtnRef}
              type="button"
              onClick={onClose}
              className={styles.closeButton}
            >
              Close
            </button>
          </div>

          {/* Carousel area */}
          <div className={styles.carouselArea}>
            {/* Previous button */}
            <button
              type="button"
              onClick={goToPrevious}
              className={styles.navButton}
              aria-label="Previous photo"
            >
              ‹
            </button>

            {/* Current image */}
            <div className={styles.imageContainer}>
              <div className={styles.imageWrapper}>
                <img
                  src={currentImage.url}
                  alt={currentImage.filename || title}
                  className={styles.image}
                  loading="lazy"
                />
              </div>
              {(currentImage.filename || '').trim().length > 0 && (
                <p className={styles.caption}>
                  {currentImage.filename}
                </p>
              )}
            </div>

            {/* Next button */}
            <button
              type="button"
              onClick={goToNext}
              className={styles.navButton}
              aria-label="Next photo"
            >
              ›
            </button>
          </div>

          <p className={styles.footer}>
            Press <span>Esc</span> to close • <span>←</span> <span>→</span> to navigate
          </p>
        </div>
      </div>
    </div>
  );
};
