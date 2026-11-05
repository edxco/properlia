"use client";

import Link from "next/link";
import {
  useT,
  useLocale,
} from "@properlia/shared/components/TranslationProvider";
import { buttonClasses } from "@properlia/shared/components/ui";

interface ServiceTile {
  titleKey: string;
  subtitleKey: string;
  buttonKey: string;
  href: string;
  gradient: string;
}

const tiles: ServiceTile[] = [
  {
    titleKey: "serviceTileBuyTitle",
    subtitleKey: "serviceTileBuySubtitle",
    buttonKey: "serviceTileBuyButton",
    href: "/buyer-consultation",
    gradient: "bg-gradient-to-br from-brand-navy via-brand-navy to-primary",
  },
  {
    titleKey: "serviceTileSellTitle",
    subtitleKey: "serviceTileSellSubtitle",
    buttonKey: "serviceTileSellButton",
    href: "/seller-consultation",
    gradient: "bg-gradient-to-br from-brand-navy via-brand-navy to-primary",
  },
  {
    titleKey: "serviceTileInvestTitle",
    subtitleKey: "serviceTileInvestSubtitle",
    buttonKey: "serviceTileInvestButton",
    href: "/properties?category=investment",
    gradient: "bg-gradient-to-br from-brand-navy via-brand-navy to-primary",
  },
];

export function ServiceTiles() {
  const t = useT();
  const locale = useLocale();

  return (
    <section className="py-16 md:py-24 bg-brand-bg px-4">
      <div className="max-w-7xl mx-auto px-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {tiles.map((tile, index) => (
            <Link
              key={index}
              href={`/${locale}${tile.href}`}
              className={`
                ${tile.gradient}
                relative overflow-hidden
                rounded-card
                p-6 md:p-8 lg:p-10
                min-h-[240px] md:min-h-[280px]
                flex flex-col justify-between
                shadow-overlay hover:shadow-overlay
                transform hover:-translate-y-1
                transition-all duration-300 ease-out
                group
                cursor-pointer
              `}
            >
              {/* Subtle overlay for depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Content */}
              <div className="relative z-10">
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-medium text-white uppercase tracking-wider leading-tight">
                  {t(tile.titleKey)}
                </h3>
                <p className="mt-4 text-white/80 text-base md:text-lg leading-relaxed">
                  {t(tile.subtitleKey)}
                </p>
              </div>

              {/* Button visual */}
              <div className="relative z-10 mt-6">
                <span
                  className={buttonClasses({
                    variant: "outlineInverse",
                    className: "group-hover:border-white group-hover:bg-white/10",
                  })}
                >
                  {t(tile.buttonKey)}
                  <svg
                    className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300 ease-out"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
