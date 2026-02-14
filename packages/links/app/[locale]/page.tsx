"use client";

import Image from "next/image";
import Link from "next/link";
import { useT } from "@properlia/shared/components/TranslationProvider";
import ProperliaLogo from "@/public/properlia.png";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: Record<string, unknown>[];
  }
}

const links = [
  {
    labelKey: "whatsapp",
    href: "https://wa.me/2215717269?text=Hola%20Properlia%2C%20quiero%20saber%20m%C3%A1s%20sobre%20sus%20servicios.",
    eventName: "click_whatsapp",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-5 h-5"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
  },
  {
    labelKey: "phone",
    href: "tel:2215717269",
    eventName: "click_phone",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-5 h-5"
      >
        <path
          fillRule="evenodd"
          d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    labelKey: "email",
    href: "mailto:lesliee.cabrera@properlia.com",
    eventName: "click_email",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-5 h-5"
      >
        <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
        <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
      </svg>
    ),
  },
  {
    labelKey: "propertyListing",
    href: "https://properlia.com/properties",
    eventName: "click_property_listing",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-5 h-5"
      >
        <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
        <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.432z" />
      </svg>
    ),
  },
  {
    labelKey: "lookingToBuy",
    href: "https://properlia.com/buyer-consultation",
    eventName: "click_looking_to_buy",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-5 h-5"
      >
        <path d="M10.5 18.75a.75.75 0 000 1.5h3a.75.75 0 000-1.5h-3z" />
        <path
          fillRule="evenodd"
          d="M8.625.75A3.375 3.375 0 005.25 4.125v15.75a3.375 3.375 0 003.375 3.375h6.75a3.375 3.375 0 003.375-3.375V4.125A3.375 3.375 0 0015.375.75h-6.75zM7.5 4.125C7.5 3.504 8.004 3 8.625 3h6.75C16.496 3 17 3.504 17 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-6.75A1.125 1.125 0 018 19.875V4.125z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    labelKey: "lookingToSell",
    href: "https://properlia.com/seller-consultation",
    eventName: "click_looking_to_sell",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-5 h-5"
      >
        <path d="M2.25 2.25a.75.75 0 000 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 00-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 000-1.5H5.378A2.25 2.25 0 017.5 14.25h11.218a.75.75 0 00.674-.421 60.358 60.358 0 002.96-7.228.75.75 0 00-.525-.965A60.864 60.864 0 005.68 4.509l-.232-.867A1.875 1.875 0 003.636 2.25H2.25zM3.75 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM16.5 20.25a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
      </svg>
    ),
  },
];

function trackEvent(eventName: string) {
  if (typeof window === "undefined") return;

  window.dataLayer?.push({
    event: eventName,
    event_category: "links",
    event_label: eventName,
  });

  window.gtag?.("event", eventName, {
    event_category: "links",
    event_label: eventName,
  });
}

export default function Home() {
  const t = useT();

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="w-full max-w-md mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <Image
            src={ProperliaLogo}
            alt="Properlia"
            width={230}
            height={230}
            className="mx-auto mb-4"
          />
          {/* <h1 className="text-2xl font-bold text-foreground font-[family-name:var(--font-poppins)]">
            {t("linksTitle")}
          </h1> */}
          <p className="mt-1 text-muted-foreground text-sm">
            {t("linksSubtitle")}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {links.map((link) => (
            <Link
              key={link.eventName}
              href={link.href}
              target={link.href.startsWith("http") ? "_blank" : undefined}
              rel={
                link.href.startsWith("http") ? "noopener noreferrer" : undefined
              }
              onClick={() => trackEvent(link.eventName)}
              className="flex items-center gap-3 w-full px-5 py-3.5 bg-card border border-border rounded-xl text-foreground font-medium hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <span className="text-primary">{link.icon}</span>
              <span className="flex-1 text-center pr-8">
                {t(link.labelKey)}
              </span>
            </Link>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground/70 mt-10">
          &copy; {new Date().getFullYear()} Properlia
        </p>
      </div>
    </main>
  );
}
