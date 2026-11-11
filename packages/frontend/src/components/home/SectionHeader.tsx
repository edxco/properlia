import { Eyebrow, SectionTitle } from "@properlia/shared/components/ui";
import { cn } from "@properlia/shared/lib/utils";

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  intro?: string;
  className?: string;
}

export function SectionHeader({ eyebrow, title, intro, className }: SectionHeaderProps) {
  return (
    <header className={cn("mb-10 max-w-3xl", className)}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <SectionTitle className="mt-3">{title}</SectionTitle>
      {intro && <p className="mt-4 text-base text-brand-carbon/80 md:text-lg">{intro}</p>}
    </header>
  );
}
