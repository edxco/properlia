import Link from "next/link";
import { IconExternalLink } from "@tabler/icons-react";
import { Container, Section, buttonClasses } from "@properlia/shared/components/ui";
import { dictionaryFor } from "@/src/lib/metadata";
import { GOOGLE_REVIEWS_URL, HOME_REVIEWS } from "./homeContent";
import { SectionHeader } from "./SectionHeader";

type Review = (typeof HOME_REVIEWS)[number];

function ReviewAuthor({ review, dict }: { review: Review; dict: Record<string, string> }) {
  return (
    <figcaption className="mt-5">
      <p className="font-medium text-brand-navy">{review.author}</p>
      <p className="text-sm text-brand-carbon/70">
        {dict.homeReviewSource} · {dict.homeReviewAge}
      </p>
    </figcaption>
  );
}

export function HomeReviews({ locale }: { locale: string }) {
  const dict = dictionaryFor(locale);
  const [featured, ...others] = [HOME_REVIEWS[2], HOME_REVIEWS[1], HOME_REVIEWS[0]];

  return (
    <Section tone="base">
      <Container>
        <SectionHeader eyebrow={dict.homeReviewsEyebrow} title={dict.homeReviewsTitle} intro={dict.homeReviewsNote} className="mb-12" />

        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <figure className="lg:col-span-7">
            <span aria-hidden="true" className="block font-display text-7xl leading-none text-brand-blue">
              &ldquo;
            </span>
            <blockquote lang="es" className="-mt-2 text-xl leading-relaxed text-brand-navy md:text-2xl md:leading-relaxed">
              <p>{featured.text}</p>
            </blockquote>
            <ReviewAuthor review={featured} dict={dict} />
          </figure>

          <div className="flex flex-col gap-10 border-t border-brand-navy/15 pt-10 lg:col-span-5 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
            {others.map((review) => (
              <figure key={review.author}>
                <blockquote lang="es" className="text-brand-carbon">
                  <p>{review.text}</p>
                </blockquote>
                <ReviewAuthor review={review} dict={dict} />
              </figure>
            ))}
          </div>
        </div>

        <div className="mt-14 flex justify-center">
          <Link
            href={GOOGLE_REVIEWS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClasses({ variant: "secondary", size: "lg" })}
          >
            {dict.homeReviewsCta}
            <IconExternalLink size={20} stroke={1.5} aria-hidden="true" />
          </Link>
        </div>
      </Container>
    </Section>
  );
}
