import type { Metadata } from "next";
import { buildMetadata } from "@/src/lib/metadata";
import { enMessages as en, esMessages as es } from "@properlia/shared";

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
  return buildMetadata(locale, "/terms", "termsMetaTitle", "termsMetaDescription");
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
      <h1 className="text-3xl font-bold mb-2">{dict["termsTitle"]}</h1>
      <p className="text-sm text-gray-500 mb-10">{dict["termsLastUpdated"]}</p>

      <div className="space-y-8">
        {SECTIONS.map(([titleKey, bodyKey]) => (
          <div key={titleKey}>
            <h2 className="text-lg font-semibold mb-2">{dict[titleKey]}</h2>
            <p className="text-gray-700 leading-relaxed">{dict[bodyKey]}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 border-t pt-8">
        <h2 className="text-lg font-semibold mb-2">{dict["termsContactTitle"]}</h2>
        <p className="text-gray-700">
          {dict["termsContactBody"]}{" "}
          <a href="mailto:contacto@properlia.com" className="text-blue-600 hover:underline">
            contacto@properlia.com
          </a>
        </p>
      </div>
    </section>
  );
}
