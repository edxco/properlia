"use client";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ProperliaLogo from "@/public/properlia.png";
import LanguageSwitcher from "./LanguageSwitcher";
import { useT, useLocale } from "@properlia/shared/components/TranslationProvider";

export function Navigation() {
  const t = useT();
  const locale = useLocale();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b border-stone-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href={`/${locale}`} className="flex items-center space-x-2">
            <Image src={ProperliaLogo} alt="Properlia logo" width={200} />
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link href={`/${locale}/properties`} className={linkClass("/properties")}>
              {t("properties")}
            </Link>
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
            <Link
              href={`/${locale}/properties`}
              className={mobileLinkClass("/properties")}
              onClick={() => setIsMenuOpen(false)}
            >
              {t("properties")}
            </Link>
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
