import type { GeneralInfo } from "@properlia/shared/services/general-info/api";
import { BASE_URL, absoluteUrl, dictionaryFor } from "./metadata";
import { GOOGLE_REVIEWS_URL } from "@/src/components/home/homeContent";
import { localizedPath } from "@properlia/shared/lib/routes";

const ORGANIZATION_ID = `${BASE_URL}/#organization`;
const WEBSITE_ID = `${BASE_URL}/#website`;

// Office coordinates from the Google Business Profile.
const OFFICE_GEO = { "@type": "GeoCoordinates", latitude: 19.010278, longitude: -98.266111 };

const AREA_SERVED = [
  { "@type": "State", name: "Puebla" },
  { "@type": "City", name: "Puebla" },
  { "@type": "City", name: "San Andrés Cholula" },
  { "@type": "City", name: "San Pedro Cholula" },
  { "@type": "City", name: "Cuautlancingo" },
  { "@type": "Place", name: "Lomas de Angelópolis" },
  { "@type": "Place", name: "Tlaxcalancingo" },
];

const DESCRIPTIONS: Record<string, string> = {
  es: "Properlia es una inmobiliaria en Puebla especializada en comercialización y asesoría inmobiliaria para compradores, vendedores e inversionistas en Puebla, Cholula y Cuautlancingo.",
  en: "Properlia is a real estate agency in Puebla, Mexico, specialized in property marketing and advisory for buyers, sellers and investors in Puebla, Cholula and Cuautlancingo.",
};

/** Business and website entities, emitted on every page. Contact data comes from general_info. */
export function siteJsonLd(locale: string, info: GeneralInfo | null) {
  const socials = [info?.instagram, info?.facebook, info?.linkedin, info?.tiktok].filter((url): url is string => Boolean(url));

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "RealEstateAgent",
        "@id": ORGANIZATION_ID,
        name: "Properlia",
        alternateName: "Properlia Bienes Raíces",
        url: BASE_URL,
        logo: absoluteUrl("/properlia.png"),
        image: [absoluteUrl("/properlia.png"), absoluteUrl("/og-home.jpg")],
        description: DESCRIPTIONS[locale] ?? DESCRIPTIONS.es,
        ...(info?.phone && { telephone: info.phone }),
        ...(info?.email_contact && { email: info.email_contact }),
        address: {
          "@type": "PostalAddress",
          streetAddress: "Torre Ejecutiva JV II, Atlixcáyotl 5208, Piso 15",
          addressLocality: "San Bernardino Tlaxcalancingo",
          addressRegion: "Puebla",
          addressCountry: "MX",
        },
        geo: OFFICE_GEO,
        hasMap: GOOGLE_REVIEWS_URL,
        areaServed: AREA_SERVED,
        knowsLanguage: ["es", "en"],
        sameAs: [GOOGLE_REVIEWS_URL, ...socials],
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: BASE_URL,
        name: "Properlia",
        publisher: { "@id": ORGANIZATION_ID },
        inLanguage: ["es", "en"],
      },
    ],
  };
}

/** The home page itself, linked to the site and the business. */
export function homeWebPageJsonLd(locale: string) {
  const dict = dictionaryFor(locale);
  const url = absoluteUrl(localizedPath(locale, "home"));

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: dict.metaTitle,
    description: dict.metaDescription,
    inLanguage: locale === "en" ? "en" : "es",
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": ORGANIZATION_ID },
    primaryImageOfPage: absoluteUrl("/og-home.jpg"),
  };
}
