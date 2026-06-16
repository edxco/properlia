"use client";

import { useState, useEffect } from "react";
import type { ReactNode } from "react";

type BannerItem = {
  title: string;
  description: string;
  icon?: ReactNode;
};

type BannerSlideshowProps = {
  banners: BannerItem[];
  intervalMs?: number;
};

export function BannerSlideshow({ banners, intervalMs = 6700 }: BannerSlideshowProps) {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (banners.length <= 1) return;
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrent((i) => (i + 1) % banners.length);
        setVisible(true);
      }, 300);
    }, intervalMs);
    return () => clearInterval(id);
  }, [banners.length, intervalMs]);

  return (
    <div className="bg-white border border-stone-200 rounded-lg p-5">
      {/* All banners share the same grid cell so the container sizes to the tallest */}
      <div className="grid">
        {banners.map((banner, i) => (
          <div
            key={i}
            className="col-start-1 row-start-1 flex items-start gap-3 transition-opacity duration-300"
            style={{ opacity: i === current && visible ? 1 : 0, pointerEvents: i === current ? "auto" : "none" }}
          >
            {banner.icon && (
              <div className="flex-shrink-0 text-stone-500 mt-0.5">{banner.icon}</div>
            )}
            <div>
              <h3 className="text-sm font-semibold text-stone-800 mb-1">{banner.title}</h3>
              <p className="text-sm text-stone-500 leading-relaxed">{banner.description}</p>
            </div>
          </div>
        ))}
      </div>
      {banners.length > 1 && (
        <div className="flex gap-1 mt-4">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => { setCurrent(i); setVisible(true); }}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === current ? "bg-stone-700 w-6" : "bg-stone-200 w-3"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
