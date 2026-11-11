import { IconChevronDown } from "@tabler/icons-react";
import { Container, Eyebrow, Section, SectionTitle } from "@properlia/shared/components/ui";
import { dictionaryFor } from "@/src/lib/metadata";
import { HOME_FAQ_ITEMS, HOME_INSIGHTS } from "./homeContent";
import { SplitLayout } from "./SectionHeader";

export function HomeInsights({ locale }: { locale: string }) {
  const dict = dictionaryFor(locale);

  return (
    <>
      <Section tone="white">
        <Container>
          <Eyebrow>{dict.homeInsightsEyebrow}</Eyebrow>
          <SectionTitle className="mt-3 max-w-2xl">{dict.homeInsightsTitle}</SectionTitle>

          <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {HOME_INSIGHTS.map((insight) => (
              <article key={insight} className="border-t-2 border-brand-blue pt-5">
                <h3 className="font-display text-xl font-medium text-brand-navy md:text-2xl">{dict[`homeInsight${insight}Title`]}</h3>
                <p className="mt-3 text-sm text-brand-carbon/80 md:text-base">{dict[`homeInsight${insight}Text`]}</p>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="pale">
        <Container>
          <SplitLayout aside={<SectionTitle className="text-2xl md:text-3xl">{dict.homeFaqTitle}</SectionTitle>}>
            <div className="border-t border-brand-navy/20">
              {HOME_FAQ_ITEMS.map((item) => (
                <details key={item} className="group border-b border-brand-navy/20">
                  <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 font-medium text-brand-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue [&::-webkit-details-marker]:hidden">
                    <h3>{dict[`homeFaq${item}Q`]}</h3>
                    <IconChevronDown
                      size={20}
                      stroke={1.5}
                      aria-hidden="true"
                      className="shrink-0 text-brand-blue transition-transform group-open:rotate-180 motion-reduce:transition-none"
                    />
                  </summary>
                  <p className="max-w-2xl pb-6 text-brand-carbon/80">{dict[`homeFaq${item}A`]}</p>
                </details>
              ))}
            </div>
          </SplitLayout>
        </Container>
      </Section>
    </>
  );
}
