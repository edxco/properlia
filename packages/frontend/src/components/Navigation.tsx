"use client";
import { Menu, X, ChevronDown } from "lucide-react";
import { useState } from "react";
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
      isActive(key) ? "text-brand-blue" : "text-brand-carbon hover:text-brand-blue"
    }`;

  const categoryHref = (param: string) =>
    localizedPath(locale, "properties", param ? `?category=${param}` : "");
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav aria-label={t("navMain")} className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b border-brand-border">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href={localizedPath(locale, "home")} className="flex items-center space-x-2">
            <Image src={ProperliaLogo} alt="Properlia" width={200} priority />
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {/* Dropdown links stay in the HTML (crawlable); CSS shows them on hover or keyboard focus. */}
            <div className="group relative">
              <Link
                href={localizedPath(locale, "properties")}
                className={`flex items-center gap-1 transition-colors text-sm tracking-wide font-medium focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-brand-blue focus-visible:rounded-sm ${
                  isActive("properties")
                    ? "text-brand-blue border-b-2 border-brand-blue pb-0.5"
                    : "text-brand-carbon hover:text-brand-blue"
                }`}
              >
                {t("properties")}
                <ChevronDown
                  aria-hidden="true"
                  className="w-3.5 h-3.5 transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180 motion-reduce:transition-none"
                />
              </Link>

              <div className="invisible absolute left-1/2 top-full -translate-x-1/2 pt-3 opacity-0 transition-opacity group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 motion-reduce:transition-none">
                <div className={cardClasses({ padding: "none", className: "min-w-[160px] py-1.5 shadow-overlay" })}>
                  {PROPERTY_CATEGORIES.map(({ key, param }) => (
                    <Link
                      key={key}
                      href={categoryHref(param)}
                      className="block whitespace-nowrap px-4 py-2 text-sm text-brand-carbon hover:text-brand-blue hover:bg-brand-pale focus-visible:outline-none focus-visible:bg-brand-pale focus-visible:text-brand-blue transition-colors"
                    >
                      {capitalizeEachWord(t(key))}
                    </Link>
                  ))}
                </div>
              </div>
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
            aria-label={isMenuOpen ? t("navCloseMenu") : t("navOpenMenu")}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X aria-hidden="true" className="w-6 h-6" /> : <Menu aria-hidden="true" className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      {/* Always rendered so the links are in the HTML; hidden until the toggle opens it. */}
      <div id="mobile-menu" className={`${isMenuOpen ? "md:hidden" : "hidden"} bg-white border-t border-brand-border`}>
        <div className="px-6 py-6 space-y-4">
          <div>
            <Link href={localizedPath(locale, "properties")} className={mobileLinkClass("properties")} onClick={closeMenu}>
              {t("properties")}
            </Link>
            <ul className="mt-2 ml-3 space-y-2 border-l border-brand-border pl-3">
              {PROPERTY_CATEGORIES.filter(({ param }) => param).map(({ key, param }) => (
                <li key={key}>
                  <Link href={categoryHref(param)} className="block text-sm text-brand-carbon hover:text-brand-blue" onClick={closeMenu}>
                    {capitalizeEachWord(t(key))}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <Link href={localizedPath(locale, "buyerConsultation")} className={mobileLinkClass("buyerConsultation")} onClick={closeMenu}>
            {t("imABuyer")}
          </Link>
          <Link href={localizedPath(locale, "sellerConsultation")} className={mobileLinkClass("sellerConsultation")} onClick={closeMenu}>
            {t("imASeller")}
          </Link>
          <Link href={localizedPath(locale, "services")} className={mobileLinkClass("services")} onClick={closeMenu}>
            {t("services")}
          </Link>
          <Link href={localizedPath(locale, "contact")} className={mobileLinkClass("contact")} onClick={closeMenu}>
            {t("contact")}
          </Link>
          <div className="pt-2">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </nav>
  );
}
