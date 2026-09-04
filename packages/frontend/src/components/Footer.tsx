"use client";

import Link from "next/link";
import Image from "next/image";
import ProperliaLogo from "@/public/properlia.png";
import { Mail, Smartphone, MessageCircle } from "lucide-react";
import {
  useT,
  useLocale,
} from "@properlia/shared/components/TranslationProvider";
import { useGeneralInfo } from "@/src/services/general-info/queries";

const LinkedinIcon = () => (
  <svg
    className="w-5 h-5"
    fill="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const InstagramIcon = () => (
  <svg
    className="w-5 h-5"
    fill="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
  </svg>
);

const FacebookIcon = () => (
  <svg
    className="w-5 h-5"
    fill="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const TiktokIcon = () => (
  <svg
    className="w-5 h-5"
    fill="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>
);

const formatPhone = (number: string) => {
  return number.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3");
};

export function Footer() {
  const t = useT();
  const locale = useLocale();
  const currentYear = new Date().getFullYear();
  const { data: generalInfo } = useGeneralInfo();

  return (
    <footer className="text-white flex flex-col">
      <div className="bg-navy m-0 p-0">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-12 m-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Logo and Company Info */}
            <div className="space-y-4 lg:col-span-2">
              <Link href={`/${locale}`} aria-label="Properlia Home">
                <Image
                  src={ProperliaLogo}
                  alt="Properlia - Real Estate"
                  width={160}
                  className="brightness-0 invert"
                />
              </Link>
              <p className="text-white/80 text-sm leading-relaxed mt-2">
                {t("properliaBriefTitle")}
              </p>
              <div className="flex gap-4 pt-2">
                {generalInfo?.linkedin && (
                  <a
                    href={generalInfo.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                    className="text-white/50 hover:text-white transition-colors"
                  >
                    <LinkedinIcon />
                  </a>
                )}
                {generalInfo?.instagram && (
                  <a
                    href={generalInfo.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="text-white/50 hover:text-white transition-colors"
                  >
                    <InstagramIcon />
                  </a>
                )}
                {generalInfo?.facebook && (
                  <a
                    href={generalInfo.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="text-white/50 hover:text-white transition-colors"
                  >
                    <FacebookIcon />
                  </a>
                )}
                {generalInfo?.tiktok && (
                  <a
                    href={generalInfo.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="TikTok"
                    className="text-white/50 hover:text-white transition-colors"
                  >
                    <TiktokIcon />
                  </a>
                )}
              </div>
            </div>

            {/* Properties by Type */}
            <nav aria-label="Properties by type" className="hidden md:block text-right">
              <h3 className="font-display font-medium text-lg mb-4">{t("properties")}</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href={`/${locale}/properties?category=residential`}
                    className="text-white/80 hover:text-white transition-colors text-sm"
                  >
                    {t("residential")}
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/${locale}/properties?category=commercial`}
                    className="text-white/80 hover:text-white transition-colors text-sm"
                  >
                    {t("commercial")}
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/${locale}/properties?category=industrial`}
                    className="text-white/80 hover:text-white transition-colors text-sm"
                  >
                    {t("industrial")}
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Services */}
            <nav aria-label="Services" className="hidden md:block text-right">
              <h3 className="font-display font-medium text-lg mb-4">{t("services")}</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href={`/${locale}/buyer-consultation`}
                    className="text-white/80 hover:text-white transition-colors text-sm"
                  >
                    {t("lookingToBuy")}
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/${locale}/seller-consultation`}
                    className="text-white/80 hover:text-white transition-colors text-sm"
                  >
                    {t("lookingToSell")}
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/${locale}/properties`}
                    className="text-white/80 hover:text-white transition-colors text-sm"
                  >
                    {t("lookingToInvest")}
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Contact */}
            <div className="text-center md:text-right">
              <h3 className="font-display font-medium text-lg mb-4">{t("contact")}</h3>
              <address className="not-italic space-y-2 text-sm text-white/80">
                {generalInfo?.whatsapp && (
                  <p>
                    <a
                      href={`mailto:${generalInfo.whatsapp}`}
                      className="flex justify-center md:justify-end content-center items-center hover:text-white transition-colors"
                    >
                      {formatPhone(generalInfo.whatsapp)}
                      <MessageCircle className="h-4 w-4 ml-2" />
                    </a>
                  </p>
                )}
                {generalInfo?.phone && (
                  <p>
                    <a
                      href={`tel:${generalInfo.phone}`}
                      className="flex justify-center md:justify-end content-center items-center hover:text-white transition-colors"
                    >
                      {formatPhone(generalInfo.phone)}
                      <Smartphone className="h-4 w-4 ml-2" />
                    </a>
                  </p>
                )}
                {generalInfo?.email_contact && (
                  <p>
                    <a
                      href={`mailto:${generalInfo.email_contact}`}
                      className="flex justify-center md:justify-end content-center items-center text-xs hover:text-white transition-colors"
                    >
                      {generalInfo.email_contact}
                      <Mail className="h-4 w-4 ml-2" />
                    </a>
                  </p>
                )}
              </address>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-navy border-t border-white/10 m-0 p-0">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 justify-between items-end gap-4">
            <div>
              <p className="text-white/70 text-sm">
                © {currentYear} Properlia. {t("allRightsReserved")}
              </p>
              <a
                href="https://thecodetaco.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/80 font-normal hover:text-white transition-colors text-sm"
              >
                {t("builtWithLove")}
              </a>
            </div>
            <nav aria-label="Legal">
              <div className="text-xs text-right font-normal text-white/70 mb-2">
                Torre Ejecutiva JV II, Atlixcáyotl 5208-piso 15. San Bernardino
                Tlaxcalancingo, Pue.
              </div>
              <div className="flex justify-end gap-4 text-right text-xs">
                <Link
                  href={`/${locale}/terms`}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  {t("termsAndConditions")}
                </Link>
                <Link
                  href={`/${locale}/privacy`}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  {t("privacyNotice")}
                </Link>
                <Link
                  href={`/${locale}/sitemap`}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  {t("sitemap")}
                </Link>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
