import { buildPropertyUrl } from "@properlia/shared/lib/slugify";
import { localizedTitle } from "@properlia/shared/lib/propertyText";
import type { Property } from "@properlia/shared/types";
import { absoluteUrl } from "./metadata";

export interface JsonLdCrumb {
  label: string;
  href: string;
}

export function breadcrumbJsonLd(items: JsonLdCrumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: absoluteUrl(item.href),
    })),
  };
}

/** Properties shown on a listing page; `offset` keeps positions continuous across pages. */
export function itemListJsonLd(name: string, properties: Property[], locale: string, offset = 0) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: properties.length,
    itemListElement: properties.map((property, index) => ({
      "@type": "ListItem",
      position: offset + index + 1,
      url: absoluteUrl(buildPropertyUrl(property, locale)),
      name: localizedTitle(property, locale),
    })),
  };
}

/** Visible question and answer texts, passed as-is so the markup always matches the page. */
export function faqJsonLd(items: { question: string; answer: string }[], locale: string) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: locale === "en" ? "en" : "es",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function JsonLdScripts({ data }: { data: object[] }) {
  return (
    <>
      {data.map((item, index) => (
        <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }} />
      ))}
    </>
  );
}
