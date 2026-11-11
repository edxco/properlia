import type { Metadata } from "next";
import { buildMetadata } from "@/src/lib/metadata";
import { enMessages as en, esMessages as es } from "@properlia/shared";
import { PageTitle } from "@properlia/shared/components/ui";

const dictionaries: Record<string, Record<string, string>> = { en, es };

const SECTIONS = [
  ["termsSection1Title", "termsSection1Body"],
  ["termsSection2Title", "termsSection2Body"],
  ["termsSection3Title", "termsSection3Body"],
  ["termsSection4Title", "termsSection4Body"],
  ["termsSection5Title", "termsSection5Body"],
  ["termsSection6Title", "termsSection6Body"],
  ["termsSection7Title", "termsSection7Body"],
  ["termsSection8Title", "termsSection8Body"],
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata(locale, "terms", "termsMetaTitle", "termsMetaDescription");
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = dictionaries[locale] ?? dictionaries["es"];

  return (
    <section className="max-w-3xl mx-auto px-6 py-16">
      <PageTitle className="mb-2 text-3xl md:text-3xl">{dict["termsTitle"]}</PageTitle>
      <p className="text-sm text-brand-gray mb-10">{dict["termsLastUpdated"]}</p>

      <div className="space-y-8">
        {SECTIONS.map(([titleKey, bodyKey]) => (
          <div key={titleKey}>
            <h2 className="font-display text-lg font-medium mb-2">{dict[titleKey]}</h2>
            <p className="text-brand-carbon leading-relaxed">{dict[bodyKey]}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 border-t pt-8">
        <h2 className="font-display text-lg font-medium mb-2">{dict["termsContactTitle"]}</h2>
        <p className="text-brand-carbon">
          {dict["termsContactBody"]}{" "}
          <a href="mailto:contacto@properlia.com" className="text-brand-blue hover:underline">
            contacto@properlia.com
          </a>
        </p>
      </div>
    </section>
  );
}
