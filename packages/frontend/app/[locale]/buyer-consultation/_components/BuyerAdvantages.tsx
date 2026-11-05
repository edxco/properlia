"use client";

import { motion } from "motion/react";
import { IconArrowDown } from "@tabler/icons-react";
import { useT } from "@properlia/shared/components/TranslationProvider";
import { buttonClasses } from "@properlia/shared/components/ui";

const FORM_SECTION_ID = "buyer-consultation-form";

interface Advantage {
  number: string;
  title: string;
  description: string;
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const reveal = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: EASE },
  },
};

function AdvantageItem({ advantage }: { advantage: Advantage }) {
  return (
    <motion.article
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={reveal}
      className="relative"
    >
      <div className="flex items-center" aria-hidden="true">
        <span className="h-px w-12 bg-brand-gold" />
        <span className="h-px flex-1 bg-brand-border" />
      </div>
      <div className="mt-6 flex items-baseline gap-5">
        <span
          aria-hidden="true"
          className="font-display text-3xl font-medium italic leading-none text-brand-navy/40"
        >
          {advantage.number}
        </span>
        <div>
          <h3 className="font-display text-xl font-medium leading-snug text-brand-navy md:text-2xl">
            {advantage.title}
          </h3>
          <p className="mt-4 leading-relaxed text-brand-carbon/70">
            {advantage.description}
          </p>
        </div>
      </div>
    </motion.article>
  );
}

export function BuyerAdvantages() {
  const t = useT();

  const advantages: Advantage[] = [1, 2, 3, 4, 5].map((n) => ({
    number: `0${n}`,
    title: t(`buyerBenefit${n}Title`),
    description: t(`buyerBenefit${n}Description`),
  }));

  const [featured, ...rest] = advantages;

  const scrollToForm = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    document
      .getElementById(FORM_SECTION_ID)
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-8">
        {/* Editorial section header: left-aligned, indexed */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={reveal}
          className="flex items-end justify-between gap-8 border-b border-brand-border pb-8"
        >
          <h2 className="max-w-2xl font-display text-4xl font-medium tracking-[-0.01em] text-brand-navy md:text-5xl">
            {t("buyerAdvantagesTitle")}
          </h2>
          <span
            aria-hidden="true"
            className="hidden shrink-0 font-display text-2xl italic text-brand-gray/60 md:block"
          >
            01 — 05
          </span>
        </motion.div>

        {/* 01 — the hook: full-width secondary hero */}
        <motion.article
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={reveal}
          className="relative mt-14 overflow-hidden bg-brand-navy md:mt-16"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-10 right-4 select-none font-display text-[11rem] font-medium italic leading-none text-brand-gold/20 md:-bottom-16 md:right-10 md:text-[17rem]"
          >
            {featured.number}
          </span>
          <div className="relative max-w-3xl px-8 py-14 md:px-14 md:py-20">
            <p className=" text-xs font-medium uppercase tracking-[0.22em] text-brand-gold">
              {featured.number}
            </p>
            <h3 className="mt-5 font-display text-2xl font-medium leading-snug text-white md:text-[2.1rem] md:leading-tight">
              {featured.title}
            </h3>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/75 md:text-lg">
              {featured.description}
            </p>
          </div>
        </motion.article>

        {/* 02–05: staggered editorial columns (right column offset on desktop) */}
        <div className="mt-16 grid items-start gap-14 md:mt-20 md:grid-cols-2 md:gap-x-16 md:gap-y-20 lg:gap-x-24">
          {rest.map((a, index) => (
            <div key={a.number} className={index % 2 === 1 ? "md:pt-24" : ""}>
              <AdvantageItem advantage={a} />
            </div>
          ))}
        </div>

        {/* Closing CTA: same offer as the hero, restated after the case has been made */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={reveal}
          className="mt-16 flex justify-center border-t border-brand-border pt-14 md:mt-20"
        >
          <a
            href={`#${FORM_SECTION_ID}`}
            onClick={scrollToForm}
            className={buttonClasses({
              variant: "inverse",
              size: "lg",
              className: "h-14 gap-3 px-9 text-sm tracking-wide",
            })}
          >
            {t("buyerHeroCta")}
            <IconArrowDown size={18} stroke={2} aria-hidden="true" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
