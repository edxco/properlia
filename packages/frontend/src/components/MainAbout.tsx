"use client";
import Link from "next/link";
import {
  useT,
  useLocale,
} from "@properlia/shared/components/TranslationProvider";
import { SectionTitle, buttonClasses } from "@properlia/shared/components/ui";

export function MainAbout() {
  const t = useT();
  const locale = useLocale();

  return (
    <section className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <div className="text-center">
          <SectionTitle className="mb-8 text-4xl md:text-5xl">
            {t("properliaBriefTitle")}
          </SectionTitle>

          <div className="space-y-6 text-brand-carbon text-lg leading-relaxed">
            <p>{t("properliaBriefDescription")}</p>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href={`/${locale}/buyer-consultation`}
              className={buttonClasses({ size: "lg", className: "text-sm tracking-wider" })}
            >
              {t("mainAboutCtaPrimary")}
            </Link>
            <Link
              href={`/${locale}/properties`}
              className={buttonClasses({
                variant: "secondary",
                size: "lg",
                className: "text-sm tracking-wider",
              })}
            >
              {t("mainAboutCtaSecondary")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
