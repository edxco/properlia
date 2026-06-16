"use client";
import { Menu, X, ChevronDown } from "lucide-react";
import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ProperliaLogo from "@/public/properlia.png";
import LanguageSwitcher from "./LanguageSwitcher";
import { useT, useLocale } from "@properlia/shared/components/TranslationProvider";
import { capitalizeEachWord } from "@/lib/utils/capitalizeEachWord";

const PROPERTY_CATEGORIES = [
  { key: "allProperties", param: "" },
  { key: "residential", param: "residential" },
  { key: "commercial", param: "commercial" },
  { key: "land", param: "land" },
  { key: "industrial", param: "industrial" },
] as const;

export function Navigation() {
  const t = useT();
  const locale = useLocale();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobilePropertiesOpen, setIsMobilePropertiesOpen] = useState(false);
  const [isPropertiesOpen, setIsPropertiesOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isActive = (path: string) => {
    const fullPath = `/${locale}${path}`;
    return pathname === fullPath || pathname.startsWith(`${fullPath}/`);
  };

  const linkClass = (path: string) =>
    `transition-colors text-sm tracking-wide font-medium ${
      isActive(path)
        ? "text-primary font-semibold border-b-2 border-stone-900 pb-0.5"
        : "text-stone-600 hover:text-stone-900"
    }`;

  const mobileLinkClass = (path: string) =>
    `block text-sm tracking-wide font-medium ${
      isActive(path)
        ? "text-stone-900"
        : "text-stone-700 hover:text-stone-900"
    }`;

  const handleMouseEnter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setIsPropertiesOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => setIsPropertiesOpen(false), 150);
  };

  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b border-stone-100">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href={`/${locale}`} className="flex items-center space-x-2">
            <Image src={ProperliaLogo} alt="Properlia logo" width={200} />
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <div
              className="relative"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                className={`flex items-center gap-1 transition-colors text-sm tracking-wide font-medium ${
                  isActive("/properties")
                    ? "text-primary font-semibold border-b-2 border-stone-900 pb-0.5"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                {t("properties")}
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${isPropertiesOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isPropertiesOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3">
                  <div className="bg-white border border-stone-100 rounded-lg shadow-lg py-1.5 min-w-[160px]">
                    {PROPERTY_CATEGORIES.map(({ key, param }) => (
                      <Link
                        key={key}
                        href={param ? `/${locale}/properties?category=${param}` : `/${locale}/properties`}
                        className="block px-4 py-2 text-sm text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors"
                        onClick={() => setIsPropertiesOpen(false)}
                      >
                        {capitalizeEachWord(t(key))}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link href={`/${locale}/buyer-consultation`} className={linkClass("/buyer-consultation")}>
              {t("imABuyer")}
            </Link>
            <Link href={`/${locale}/seller-consultation`} className={linkClass("/seller-consultation")}>
              {t("imASeller")}
            </Link>
            <Link href={`/${locale}/services`} className={linkClass("/services")}>
              {t("services")}
            </Link>
            <LanguageSwitcher />
          </div>

          <button
            className="md:hidden text-stone-900"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-stone-100">
          <div className="px-6 py-6 space-y-4">
            <div>
              <button
                className={`flex items-center gap-1 w-full text-left text-sm tracking-wide font-medium ${
                  isActive("/properties") ? "text-stone-900" : "text-stone-700 hover:text-stone-900"
                }`}
                onClick={() => setIsMobilePropertiesOpen(!isMobilePropertiesOpen)}
              >
                {t("properties")}
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${isMobilePropertiesOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isMobilePropertiesOpen && (
                <div className="mt-2 ml-3 space-y-2 border-l border-stone-200 pl-3">
                  {PROPERTY_CATEGORIES.map(({ key, param }) => (
                    <Link
                      key={key}
                      href={param ? `/${locale}/properties?category=${param}` : `/${locale}/properties`}
                      className="block text-sm text-stone-600 hover:text-stone-900"
                      onClick={() => { setIsMenuOpen(false); setIsMobilePropertiesOpen(false); }}
                    >
                      {capitalizeEachWord(t(key))}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <Link
              href={`/${locale}/buyer-consultation`}
              className={mobileLinkClass("/buyer-consultation")}
              onClick={() => setIsMenuOpen(false)}
            >
              {t("imABuyer")}
            </Link>
            <Link
              href={`/${locale}/seller-consultation`}
              className={mobileLinkClass("/seller-consultation")}
              onClick={() => setIsMenuOpen(false)}
            >
              {t("imASeller")}
            </Link>
            <Link
              href={`/${locale}/services`}
              className={mobileLinkClass("/services")}
              onClick={() => setIsMenuOpen(false)}
            >
              {t("services")}
            </Link>
            <div className="pt-2">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
