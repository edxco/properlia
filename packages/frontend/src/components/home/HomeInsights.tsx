import { IconChevronDown } from "@tabler/icons-react";
import { Card, CardTitle, Container, Section, SectionTitle } from "@properlia/shared/components/ui";
import { dictionaryFor } from "@/src/lib/metadata";
import { HOME_FAQ_ITEMS, HOME_INSIGHTS } from "./homeContent";
import { SectionHeader } from "./SectionHeader";

export function HomeInsights({ locale }: { locale: string }) {
  const dict = dictionaryFor(locale);

  return (
    <Section tone="white">
      <Container>
        <SectionHeader eyebrow={dict.homeInsightsEyebrow} title={dict.homeInsightsTitle} intro={dict.homeInsightsIntro} />

        <div className="grid grid-cols-1 gap-7 md:grid-cols-2">
          {HOME_INSIGHTS.map((insight) => (
            <Card key={insight} padding="sm">
              <CardTitle className="text-xl">{dict[`homeInsight${insight}Title`]}</CardTitle>
              <p className="mt-3 text-brand-carbon/80">{dict[`homeInsight${insight}Text`]}</p>
            </Card>
          ))}
        </div>

        <div className="mt-16 max-w-3xl">
          <SectionTitle className="text-2xl md:text-3xl">{dict.homeFaqTitle}</SectionTitle>
          <div className="mt-6 flex flex-col gap-3">
            {HOME_FAQ_ITEMS.map((item) => (
              <details key={item} className="group rounded-card border border-brand-border bg-white shadow-card">
                <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 rounded-card p-5 font-medium text-brand-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue [&::-webkit-details-marker]:hidden">
                  <h3>{dict[`homeFaq${item}Q`]}</h3>
                  <IconChevronDown
                    size={20}
                    stroke={1.5}
                    aria-hidden="true"
                    className="shrink-0 text-brand-blue transition-transform group-open:rotate-180 motion-reduce:transition-none"
                  />
                </summary>
                <p className="px-5 pb-5 text-brand-carbon/80">{dict[`homeFaq${item}A`]}</p>
              </details>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
