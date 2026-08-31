import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/src/lib/metadata";
import { enMessages as en, esMessages as es } from "@properlia/shared";

const dictionaries: Record<string, Record<string, string>> = { en, es };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata(locale, "/sitemap", "sitemapMetaTitle", "sitemapMetaDescription");
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
        { label: dict["sitemapHome"], href: `/${locale}` },
        { label: dict["sitemapAllProperties"], href: `/${locale}/properties` },
        { label: dict["residential"], href: `/${locale}/properties?category=residential` },
        { label: dict["commercial"], href: `/${locale}/properties?category=commercial` },
        { label: dict["industrial"], href: `/${locale}/properties?category=industrial` },
      ],
    },
    {
      title: dict["sitemapSectionServices"],
      links: [
        { label: dict["sitemapServices"], href: `/${locale}/services` },
        { label: dict["sitemapBuyerConsultation"], href: `/${locale}/buyer-consultation` },
        { label: dict["sitemapSellerConsultation"], href: `/${locale}/seller-consultation` },
      ],
    },
    {
      title: dict["sitemapSectionLegal"],
      links: [
        { label: dict["termsAndConditions"], href: `/${locale}/terms` },
        { label: dict["privacyNotice"], href: `/${locale}/privacy` },
      ],
    },
  ];

  return (
    <section className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-2">{dict["sitemapTitle"]}</h1>
      <p className="text-sm text-gray-500 mb-10">{dict["sitemapSubtitle"]}</p>

      <div className="space-y-10">
        {sections.map((section) => (
          <div key={section.title}>
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">{section.title}</h2>
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
