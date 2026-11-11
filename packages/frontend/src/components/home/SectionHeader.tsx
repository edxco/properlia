import type { ReactNode } from "react";
import { Eyebrow, SectionTitle } from "@properlia/shared/components/ui";
import { cn } from "@properlia/shared/lib/utils";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  intro?: string;
  className?: string;
}

export function SectionHeader({ eyebrow, title, intro, className }: SectionHeaderProps) {
  return (
    <header className={cn("max-w-3xl", className)}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <SectionTitle className={eyebrow ? "mt-3" : undefined}>{title}</SectionTitle>
      {intro && <p className="mt-4 text-base text-brand-carbon/80 md:text-lg">{intro}</p>}
    </header>
  );
}

/** Heading column on the left (sticky on desktop) and the content on the right. */
export function SplitLayout({ aside, children }: { aside: ReactNode; children: ReactNode }) {
  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
      <div className="lg:sticky lg:top-28 lg:col-span-4 lg:self-start">{aside}</div>
      <div className="lg:col-span-8">{children}</div>
    </div>
  );
}
