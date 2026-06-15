'use client';

import React from 'react';
import styles from './styles/PhotoGalleryModal.module.css';
import { useT } from './TranslationProvider';

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
  const t = useT();
  const closeBtnRef = React.useRef<HTMLButtonElement | null>(null);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const touchStartX = React.useRef<number | null>(null);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 50) {
      delta > 0 ? goToNext() : goToPrevious();
    }
    touchStartX.current = null;
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
      aria-label={`${title} ${t('galleryAriaLabel')}`}
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
                {currentIndex + 1} / {images.length} {t('galleryPhoto')}
              </p>
            </div>

            <button
              ref={closeBtnRef}
              type="button"
              onClick={onClose}
              className={styles.closeButton}
            >
              {t('galleryClose')}
            </button>
          </div>

          {/* Carousel area */}
          <div
            className={styles.carouselArea}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Previous button */}
            <button
              type="button"
              onClick={goToPrevious}
              className={styles.navButton}
              aria-label={t('galleryPrevious')}
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
            </div>

            {/* Next button */}
            <button
              type="button"
              onClick={goToNext}
              className={styles.navButton}
              aria-label={t('galleryNext')}
            >
              ›
            </button>
          </div>

          <p className={styles.footer}>
            {(() => {
              const [p0, p1, p2, p3] = t('galleryFooter').split(/\{esc\}|\{left\}|\{right\}/);
              return <>{p0}<span>Esc</span>{p1}<span>←</span>{p2}<span>→</span>{p3}</>;
            })()}
          </p>
        </div>
      </div>
    </div>
  );
};
