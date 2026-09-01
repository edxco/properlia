"use client";

import { TypingAnimation } from "@/components/ui/typing-animation";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  useT,
  useLocale,
} from "@properlia/shared/components/TranslationProvider";
import ProperliaBg from "@/public/properlia-bg.webp";
import { capitalizeEachWord } from "@/lib/utils/capitalizeEachWord";

const CATEGORIES = [
  { key: "all", value: undefined },
  { key: "residential", value: "residential" },
  { key: "commercial", value: "commercial" },
  { key: "industrial", value: "industrial" },
  { key: "land", value: "land" },
] as const;

export function Hero() {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();

  const handleCategoryClick = (category?: string) => {
    const query = category ? `?category=${category}` : "";
    router.push(`/${locale}/properties${query}`);
  };

  return (
    <div id="hero-section" className="relative h-[calc(100vh-5rem)]">
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-stone-900/50 to-primary/30 z-10"></div>

      <Image
        src={ProperliaBg}
        alt=""
        priority
        sizes="100vw"
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div className="relative z-20 h-full flex items-center">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 w-full">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-2xl text-white font-semibold tracking-wider bg-primary inline-block px-3 py-1">
              {t("heroBadge")}
            </h1>
            <p aria-hidden="true" className="font-bold text-2xl md:text-5xl lg:text-6xl font-lexend text-white leading-tight tracking-wide">
              <TypingAnimation
                words={[
                  t("heroLine1"),
                  t("heroLine2"),
                  t("heroLine3"),
                  t("heroLine4"),
                ]}
                loop
              />
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {CATEGORIES.map((category) => (
                <button
                  key={category.key}
                  onClick={() => handleCategoryClick(category.value)}
                  className="px-5 py-2 text-sm font-medium rounded-full border border-white bg-white/10 backdrop-blur-sm text-white shadow-sm hover:bg-white hover:text-stone-900 transition-colors cursor-pointer"
                >
                  {capitalizeEachWord(t(category.key))}
                </button>
              ))}
            </div>

            <h2 className="mt-6 text-white font-medium text-base md:text-lg drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">
              {t("heroDescription")}
            </h2>
          </div>
        </div>
      </div>

      {/* Scroll Down Icon */}
      <button
        onClick={() => {
          const heroElement = document.getElementById("hero-section");
          if (heroElement) {
            const nextSection = heroElement.nextElementSibling;
            if (nextSection) {
              nextSection.scrollIntoView({ behavior: "smooth" });
            }
          }
        }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 cursor-pointer group"
        aria-label="Scroll down"
      >
        <svg
          className="w-8 h-14 text-white animate-bounce"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 40"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Mouse outline */}
          <rect
            x="5"
            y="2"
            width="14"
            height="22"
            rx="7"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Mouse scroll wheel/button */}
          <line
            x1="12"
            y1="7"
            x2="12"
            y2="11"
            strokeWidth={1.5}
            strokeLinecap="round"
          />
          {/* First chevron */}
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 28l4 3 4-3"
          />
          {/* Second chevron */}
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8 33l4 3 4-3"
          />
        </svg>
      </button>
    </div>
  );
}
