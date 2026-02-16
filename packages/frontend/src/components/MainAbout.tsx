"use client";
import Link from "next/link";
import {
  useT,
  useLocale,
} from "@properlia/shared/components/TranslationProvider";

export function MainAbout() {
  const t = useT();
  const locale = useLocale();

  return (
    <section className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-serif text-stone-900 mb-8">
            {t("properliaBriefTitle")}
          </h2>

          <div className="space-y-6 text-stone-700 font-light text-lg leading-relaxed">
            <p>{t("properliaBriefDescription")}</p>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href={`/${locale}/buyer-consultation`}
              className="bg-stone-900 text-white px-8 py-3.5 hover:bg-stone-800 transition-colors text-sm tracking-wider"
            >
              {t("mainAboutCtaPrimary")}
            </Link>
            <Link
              href={`/${locale}/properties`}
              className="border border-stone-900 text-stone-900 px-8 py-3.5 hover:bg-stone-50 transition-colors text-sm tracking-wider"
            >
              {t("mainAboutCtaSecondary")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
