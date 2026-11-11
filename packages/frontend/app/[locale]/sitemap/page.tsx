import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/src/lib/metadata";
import { enMessages as en, esMessages as es } from "@properlia/shared";
import { PageTitle } from "@properlia/shared/components/ui";
import { localizedPath } from "@properlia/shared/lib/routes";

const dictionaries: Record<string, Record<string, string>> = { en, es };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata(locale, "sitemap", "sitemapMetaTitle", "sitemapMetaDescription");
}

export default async function SitemapPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = dictionaries[locale] ?? dictionaries["es"];

  const sections = [
    {
      title: dict["sitemapSectionProperties"],
      links: [
        { label: dict["sitemapHome"], href: localizedPath(locale, "home") },
        { label: dict["sitemapAllProperties"], href: localizedPath(locale, "properties") },
        { label: dict["residential"], href: localizedPath(locale, "properties", "?category=residential") },
        { label: dict["commercial"], href: localizedPath(locale, "properties", "?category=commercial") },
        { label: dict["industrial"], href: localizedPath(locale, "properties", "?category=industrial") },
      ],
    },
    {
      title: dict["sitemapSectionServices"],
      links: [
        { label: dict["sitemapServices"], href: localizedPath(locale, "services") },
        { label: dict["sitemapBuyerConsultation"], href: localizedPath(locale, "buyerConsultation") },
        { label: dict["sitemapSellerConsultation"], href: localizedPath(locale, "sellerConsultation") },
      ],
    },
    {
      title: dict["sitemapSectionContact"],
      links: [{ label: dict["contact"], href: localizedPath(locale, "contact") }],
    },
    {
      title: dict["sitemapSectionLegal"],
      links: [
        { label: dict["termsAndConditions"], href: localizedPath(locale, "terms") },
        { label: dict["privacyNotice"], href: localizedPath(locale, "privacy") },
      ],
    },
  ];

  return (
    <section className="max-w-3xl mx-auto px-6 py-16">
      <PageTitle className="mb-2 text-3xl md:text-3xl">{dict["sitemapTitle"]}</PageTitle>
      <p className="text-sm text-brand-gray mb-10">{dict["sitemapSubtitle"]}</p>

      <div className="space-y-10">
        {sections.map((section) => (
          <div key={section.title}>
            <h2 className="font-display text-lg font-medium mb-4 border-b pb-2">{section.title}</h2>
            <ul className="space-y-2">
              {section.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-primary hover:underline text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
