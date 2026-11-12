import Link from "next/link";
import { IconExternalLink, IconStarFilled } from "@tabler/icons-react";
import { Card, Container, Section, buttonClasses } from "@properlia/shared/components/ui";
import { dictionaryFor } from "@/src/lib/metadata";
import { GOOGLE_REVIEWS_URL, HOME_REVIEWS } from "./homeContent";
import { SectionHeader } from "./SectionHeader";

export function HomeReviews({ locale }: { locale: string }) {
  const dict = dictionaryFor(locale);

  return (
    <Section tone="base">
      <Container>
        <SectionHeader eyebrow={dict.homeReviewsEyebrow} title={dict.homeReviewsTitle} intro={dict.homeReviewsNote} className="mb-12" />

        <ul className="grid grid-cols-1 gap-7 lg:grid-cols-3">
          {HOME_REVIEWS.map((review) => (
            <li key={review.author}>
              <Card className="h-full border-0">
                <figure className="flex h-full flex-col">
                  <div role="img" aria-label={`${review.rating} ${dict.homeReviewStars}`} className="mb-5 flex gap-1 text-brand-blue">
                    {Array.from({ length: review.rating }, (_, index) => (
                      <IconStarFilled key={index} size={18} aria-hidden="true" />
                    ))}
                  </div>
                  <blockquote lang="es" className="pb-6 text-brand-carbon">
                    <p>
                      <span aria-hidden="true" className="mr-1 align-[-0.3em] font-display text-5xl leading-[0] text-brand-blue">
                        &ldquo;
                      </span>
                      {review.text}
                    </p>
                  </blockquote>
                  <figcaption className="mt-auto border-t border-brand-border pt-5">
                    <p className="font-medium text-brand-navy">{review.author}</p>
                    <p className="text-sm text-brand-carbon/70">
                      {dict.homeReviewSource} · {dict.homeReviewAge}
                    </p>
                  </figcaption>
                </figure>
              </Card>
            </li>
          ))}
        </ul>

        <div className="mt-12 flex justify-center">
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
