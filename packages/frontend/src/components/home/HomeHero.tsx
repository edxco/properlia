import Image from "next/image";
import Link from "next/link";
import { Container, Eyebrow, PageTitle, buttonClasses } from "@properlia/shared/components/ui";
import { localizedPath } from "@properlia/shared/lib/routes";
import ProperliaBg from "@/public/properlia-bg.webp";
import { dictionaryFor } from "@/src/lib/metadata";

const CATEGORIES = [
  { key: "residential", value: "residential" },
  { key: "commercial", value: "commercial" },
  { key: "industrial", value: "industrial" },
  { key: "land", value: "land" },
] as const;

export function HomeHero({ locale }: { locale: string }) {
  const dict = dictionaryFor(locale);

  return (
    <section className="relative isolate flex min-h-[min(820px,max(600px,calc(100svh-5rem)))] items-center overflow-hidden bg-brand-navy">
      <Image
        src={ProperliaBg}
        alt={dict.heroImageAlt}
        preload
        loading="eager"
        fetchPriority="high"
        sizes="100vw"
        className="absolute inset-0 -z-20 h-full w-full object-cover"
      />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-t from-brand-navy/90 via-brand-navy/70 to-brand-navy/60" />

      <Container className="py-16">
        <div className="max-w-3xl">
          <Eyebrow className="text-white/90">{dict.heroEyebrow}</Eyebrow>
          <PageTitle className="mt-4 text-4xl leading-tight text-white md:text-5xl lg:text-6xl">{dict.heroTitle}</PageTitle>
          <p className="mt-6 max-w-2xl text-base text-white/90 md:text-lg">{dict.heroDescription}</p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href={localizedPath(locale, "properties")} className={buttonClasses({ variant: "inverse", size: "lg" })}>
              {dict.heroCtaBuy}
            </Link>
            <Link href={localizedPath(locale, "sellerConsultation")} className={buttonClasses({ variant: "outlineInverse", size: "lg" })}>
              {dict.heroCtaSell}
            </Link>
          </div>

          <nav aria-label={dict.heroCategoriesLabel} className="mt-8">
            <ul className="flex flex-wrap gap-3">
              {CATEGORIES.map((category) => (
                <li key={category.key}>
                  <Link
                    href={localizedPath(locale, "properties", `?category=${category.value}`)}
                    className="inline-flex min-h-11 items-center rounded-full border border-white/70 bg-white/10 px-5 text-sm font-medium capitalize text-white shadow-pill transition-colors hover:bg-white hover:text-brand-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy"
                  >
                    {dict[category.key]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </Container>
    </section>
  );
}
