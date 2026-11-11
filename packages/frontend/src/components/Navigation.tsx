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
import { Button, cardClasses } from "@properlia/shared/components/ui";
import { localizedPath, type RouteKey } from "@properlia/shared/lib/routes";

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

  const isActive = (key: RouteKey) => {
    const fullPath = localizedPath(locale, key);
    return pathname === fullPath || pathname.startsWith(`${fullPath}/`);
  };

  const linkClass = (key: RouteKey) =>
    `transition-colors text-sm tracking-wide font-medium ${
      isActive(key)
        ? "text-brand-blue border-b-2 border-brand-blue pb-0.5"
        : "text-brand-carbon hover:text-brand-blue"
    }`;

  const mobileLinkClass = (key: RouteKey) =>
    `block text-sm tracking-wide font-medium ${
      isActive(key)
        ? "text-brand-blue"
        : "text-brand-carbon hover:text-brand-blue"
    }`;

  const handleMouseEnter = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setIsPropertiesOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => setIsPropertiesOpen(false), 150);
  };

  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b border-brand-border">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href={localizedPath(locale, "home")} className="flex items-center space-x-2">
            <Image src={ProperliaLogo} alt="Properlia logo" width={200} />
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <div
              className="relative"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                className={`flex items-center gap-1 transition-colors text-sm tracking-wide font-medium focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-brand-blue focus-visible:rounded-sm ${
                  isActive("properties")
                    ? "text-brand-blue border-b-2 border-brand-blue pb-0.5"
                    : "text-brand-carbon hover:text-brand-blue"
                }`}
              >
                {t("properties")}
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${isPropertiesOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isPropertiesOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3">
                  <div className={cardClasses({ padding: "none", className: "min-w-[160px] py-1.5 shadow-overlay" })}>
                    {PROPERTY_CATEGORIES.map(({ key, param }) => (
                      <Link
                        key={key}
                        href={param ? localizedPath(locale, "properties", `?category=${param}`) : localizedPath(locale, "properties")}
                        className="block whitespace-nowrap px-4 py-2 text-sm text-brand-carbon hover:text-brand-blue hover:bg-brand-pale transition-colors"
                        onClick={() => setIsPropertiesOpen(false)}
                      >
                        {capitalizeEachWord(t(key))}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link href={localizedPath(locale, "buyerConsultation")} className={linkClass("buyerConsultation")}>
              {t("imABuyer")}
            </Link>
            <Link href={localizedPath(locale, "sellerConsultation")} className={linkClass("sellerConsultation")}>
              {t("imASeller")}
            </Link>
            <Link href={localizedPath(locale, "services")} className={linkClass("services")}>
              {t("services")}
            </Link>
            <Link href={localizedPath(locale, "contact")} className={linkClass("contact")}>
              {t("contact")}
            </Link>
            <LanguageSwitcher />
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-brand-carbon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </Button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-brand-border">
          <div className="px-6 py-6 space-y-4">
            <div>
              <button
                className={`flex items-center gap-1 w-full text-left text-sm tracking-wide font-medium ${
                  isActive("properties") ? "text-brand-blue" : "text-brand-carbon hover:text-brand-blue"
                }`}
                onClick={() => setIsMobilePropertiesOpen(!isMobilePropertiesOpen)}
              >
                {t("properties")}
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${isMobilePropertiesOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isMobilePropertiesOpen && (
                <div className="mt-2 ml-3 space-y-2 border-l border-brand-border pl-3">
                  {PROPERTY_CATEGORIES.map(({ key, param }) => (
                    <Link
                      key={key}
                      href={param ? localizedPath(locale, "properties", `?category=${param}`) : localizedPath(locale, "properties")}
                      className="block text-sm text-brand-carbon hover:text-brand-blue"
                      onClick={() => { setIsMenuOpen(false); setIsMobilePropertiesOpen(false); }}
                    >
                      {capitalizeEachWord(t(key))}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <Link
              href={localizedPath(locale, "buyerConsultation")}
              className={mobileLinkClass("buyerConsultation")}
              onClick={() => setIsMenuOpen(false)}
            >
              {t("imABuyer")}
            </Link>
            <Link
              href={localizedPath(locale, "sellerConsultation")}
              className={mobileLinkClass("sellerConsultation")}
              onClick={() => setIsMenuOpen(false)}
            >
              {t("imASeller")}
            </Link>
            <Link
              href={localizedPath(locale, "services")}
              className={mobileLinkClass("services")}
              onClick={() => setIsMenuOpen(false)}
            >
              {t("services")}
            </Link>
            <Link
              href={localizedPath(locale, "contact")}
              className={mobileLinkClass("contact")}
              onClick={() => setIsMenuOpen(false)}
            >
              {t("contact")}
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
