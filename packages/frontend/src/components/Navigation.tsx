"use client";
import { Home, Menu, X } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import ProperliaLogo from "@/public/properlia.png";
import { useT } from "./TranslationProvider";
import LanguageSwitcher from "./LanguageSwitcher";

export function Navigation() {
  const t = useT();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b border-stone-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-2">
            <Image src={ProperliaLogo} alt="Properlia logo" width={200} />
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#properties"
              className="text-stone-700 uppercase hover:text-stone-900 transition-colors text-sm tracking-wide"
            >
              {t("imABuyer")}
            </a>
            <a
              href="#services"
              className="text-stone-700 uppercase hover:text-stone-900 transition-colors text-sm tracking-wide"
            >
              {t("imASeller")}
            </a>
            <a
              href="#about"
              className="text-stone-700 uppercase hover:text-stone-900 transition-colors text-sm tracking-wide"
            >
              {t("services")}
            </a>
            <a
              href="#contact"
              className="text-stone-700 uppercase hover:text-stone-900 transition-colors text-sm tracking-wide"
            >
              {t("contact")}
            </a>
            <button className="bg-stone-900 text-white px-6 py-2.5 text-sm tracking-wide hover:bg-stone-800 transition-colors">
              WHATSAPP
            </button>
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
            <a
              href="#properties"
              className="block text-stone-700 hover:text-stone-900 text-sm tracking-wide"
            >
              Properties
            </a>
            <a
              href="#services"
              className="block text-stone-700 hover:text-stone-900 text-sm tracking-wide"
            >
              Services
            </a>
            <a
              href="#about"
              className="block text-stone-700 hover:text-stone-900 text-sm tracking-wide"
            >
              About
            </a>
            <a
              href="#contact"
              className="block text-stone-700 hover:text-stone-900 text-sm tracking-wide"
            >
              Contact
            </a>
            <button className="w-full bg-stone-900 text-white px-6 py-2.5 text-sm tracking-wide hover:bg-stone-800 transition-colors">
              Get Started
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
