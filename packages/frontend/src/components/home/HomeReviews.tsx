import Link from "next/link";
import { IconExternalLink } from "@tabler/icons-react";
import { Card, Container, Section, buttonClasses } from "@properlia/shared/components/ui";
import { dictionaryFor } from "@/src/lib/metadata";
import { GOOGLE_REVIEWS_URL, HOME_REVIEWS } from "./homeContent";
import { SectionHeader } from "./SectionHeader";

export function HomeReviews({ locale }: { locale: string }) {
  const dict = dictionaryFor(locale);

  return (
    <Section tone="base">
      <Container>
        <SectionHeader eyebrow={dict.homeReviewsEyebrow} title={dict.homeReviewsTitle} intro={dict.homeReviewsNote} />

        <ul className="grid grid-cols-1 gap-7 lg:grid-cols-3">
          {HOME_REVIEWS.map((review) => (
            <li key={review.author}>
              <Card className="flex h-full flex-col">
                <figure className="flex h-full flex-col">
                  <blockquote lang="es" className="text-brand-carbon">
                    <p>&ldquo;{review.text}&rdquo;</p>
                  </blockquote>
                  <figcaption className="mt-auto pt-6">
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

        <div className="mt-10 flex justify-center">
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
