import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/src/lib/metadata";
import { enMessages as en, esMessages as es } from "@properlia/shared";

type Dict = Record<string, string>;
const dictionaries: Record<string, Dict> = { en, es };

const SERVICES = [
  {
    number: "01",
    titleKey: "servicesService1Title",
    leadKey: "servicesService1Lead",
    subLeadKey: null as string | null,
    items: [] as string[],
    taglineKey: "servicesService1Tagline",
  },
  {
    number: "02",
    titleKey: "servicesService2Title",
    leadKey: "servicesService2Lead",
    subLeadKey: null as string | null,
    items: [
      "servicesService2Item1",
      "servicesService2Item2",
      "servicesService2Item3",
      "servicesService2Item4",
    ],
    taglineKey: "servicesService2Tagline",
  },
  {
    number: "03",
    titleKey: "servicesService3Title",
    leadKey: "servicesService3Lead",
    subLeadKey: "servicesService3SubLead" as string | null,
    items: [
      "servicesService3Item1",
      "servicesService3Item2",
      "servicesService3Item3",
    ],
    taglineKey: "servicesService3Tagline",
  },
  {
    number: "04",
    titleKey: "servicesService4Title",
    leadKey: "servicesService4Lead",
    subLeadKey: null as string | null,
    items: [
      "servicesService4Item1",
      "servicesService4Item2",
      "servicesService4Item3",
    ],
    taglineKey: "servicesService4Tagline",
  },
  {
    number: "05",
    titleKey: "servicesService5Title",
    leadKey: "servicesService5Lead",
    subLeadKey: "servicesService5SubLead" as string | null,
    items: [
      "servicesService5Item1",
      "servicesService5Item2",
      "servicesService5Item3",
    ],
    taglineKey: "servicesService5Tagline",
  },
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata(locale, "/services", "servicesMetaTitle", "servicesMetaDescription");
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = dictionaries[locale] ?? dictionaries["es"];

  return (
    <>
      {/* Hero */}
      <section className="border-b border-stone-100 px-6 py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-display text-3xl md:text-4xl font-medium text-stone-900 mb-2">
            {dict["servicesPageTitle"]}
          </h1>
          <p className="text-stone-500 text-lg">
            {dict["servicesPageSubtitle"]}
          </p>
        </div>
      </section>

      {/* Services list */}
      <section className="bg-white">
        {SERVICES.map((service, index) => (
          <div
            key={service.number}
            className={`border-b border-stone-100 ${index % 2 === 1 ? "bg-stone-50" : "bg-white"}`}
          >
            <div className="max-w-4xl mx-auto px-6 py-16 md:py-20 relative overflow-hidden">
              {/* Watermark number */}
              <span className="absolute right-4 top-6 text-[8rem] md:text-[10rem] font-black text-stone-100 select-none leading-none pointer-events-none">
                {service.number}
              </span>

              <div className="relative">
                <span className="text-blue-600 text-xs font-bold tracking-widest uppercase">
                  {service.number}
                </span>

                <h2 className="font-display mt-3 text-2xl md:text-3xl lg:text-4xl font-medium text-stone-900 leading-tight max-w-2xl">
                  {dict[service.titleKey]}
                </h2>

                <p className="mt-5 text-stone-600 text-lg leading-relaxed max-w-2xl">
                  {dict[service.leadKey]}
                </p>

                {service.subLeadKey && (
                  <p className="mt-4 text-stone-700 font-medium">
                    {dict[service.subLeadKey]}
                  </p>
                )}

                {service.items.length > 0 && (
                  <ul className="mt-4 space-y-3">
                    {service.items.map((itemKey) => (
                      <li key={itemKey} className="flex items-start gap-3">
                        <svg
                          className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="text-stone-700 text-base leading-snug">
                          {dict[itemKey]}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                <p className="mt-8 text-stone-900 font-semibold text-lg italic border-l-4 border-blue-600 pl-4">
                  {dict[service.taglineKey]}
                </p>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="bg-stone-900 px-6 py-20 md:py-24 text-center">
        <h2 className="font-display text-3xl md:text-4xl font-medium text-white">
          {dict["servicesCta"]}
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Link
            href={`/${locale}/buyer-consultation`}
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-stone-900 font-semibold rounded-lg hover:bg-stone-100 transition-colors"
          >
            {dict["imABuyer"]}
          </Link>
          <Link
            href={`/${locale}/seller-consultation`}
            className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
          >
            {dict["imASeller"]}
          </Link>
        </div>
      </section>
    </>
  );
}
