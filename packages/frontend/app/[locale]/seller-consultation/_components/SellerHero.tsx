"use client";

import { motion } from "motion/react";
import { IconArrowDown } from "@tabler/icons-react";
import { useT } from "@properlia/shared/components/TranslationProvider";
import { fadeUp } from "@/src/components/consultation/motion";

const FORM_SECTION_ID = "seller-consultation-form";

export function SellerHero() {
  const t = useT();

  const title = t("sellPageTitle");
  const commaIndex = title.indexOf(",");
  const titleLead = commaIndex > -1 ? title.slice(0, commaIndex + 1) : title;
  const titleTurn = commaIndex > -1 ? title.slice(commaIndex + 1).trim() : "";

  const scrollToForm = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    document
      .getElementById(FORM_SECTION_ID)
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative overflow-hidden bg-navy">
      {/* Depth vignette, stays inside the navy family */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_100%_at_15%_0%,rgba(33,76,155,0.28),transparent_55%),radial-gradient(90%_90%_at_100%_100%,rgba(10,26,44,0.55),transparent_60%)]"
      />

      <div className="relative mx-auto max-w-[1400px] px-6 py-20 md:py-28 lg:px-8 lg:py-32">
        <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-10">
          {/* Editorial headline block */}
          <div className="lg:col-span-7">
            <motion.p
              custom={0}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="flex items-center gap-3 font-[family-name:var(--font-editorial-body)] text-xs font-medium uppercase tracking-[0.22em] text-white/60"
            >
              <span aria-hidden="true" className="h-px w-8 bg-white/40" />
              {t("sellerHeroEyebrow")}
            </motion.p>

            <motion.h1
              custom={1}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="mt-8 font-[family-name:var(--font-editorial-display)] text-[2.6rem] font-medium leading-[1.06] tracking-[-0.015em] text-white md:text-6xl lg:text-[4.3rem]"
            >
              {titleLead}
              {titleTurn && <span className="block italic">{titleTurn}</span>}
            </motion.h1>

            <motion.p
              custom={2}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="mt-7 max-w-xl font-[family-name:var(--font-editorial-body)] text-lg leading-relaxed text-white/75 md:text-xl"
            >
              {t("sellPageSubtitle")}
            </motion.p>

            <motion.div
              custom={3}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              className="mt-10"
            >
              <a
                href={`#${FORM_SECTION_ID}`}
                onClick={scrollToForm}
                className="inline-flex h-14 items-center gap-3 bg-gold px-9 font-[family-name:var(--font-editorial-body)] text-sm font-medium tracking-wide text-navy transition-colors duration-200 hover:bg-[#B69544] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
              >
                {t("sellerHeroCta")}
                <IconArrowDown size={18} stroke={2} aria-hidden="true" />
              </a>
            </motion.div>
          </div>

          {/* The ledger: typographic-numeric proof composition */}
          <motion.div
            custom={4}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="lg:col-span-4 lg:col-start-9"
          >
            <dl className="grid grid-cols-2 gap-x-8 gap-y-10 border-t border-gold/40 pt-8 lg:grid-cols-1 lg:gap-y-0 lg:divide-y lg:divide-white/10 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
              <div className="col-span-2 flex flex-col lg:col-span-1 lg:pb-10">
                <dt className="order-2 mt-4 font-[family-name:var(--font-editorial-body)] text-xs font-medium uppercase tracking-[0.18em] text-white/60">
                  {t("proofStat1Label")}
                </dt>
                <dd className="order-1 font-[family-name:var(--font-editorial-display)] text-7xl font-medium leading-none text-white lg:text-8xl">
                  {t("proofStat1Value")}
                </dd>
              </div>
              <div className="flex flex-col lg:py-10">
                <dt className="order-2 mt-4 font-[family-name:var(--font-editorial-body)] text-xs font-medium uppercase tracking-[0.18em] text-white/60">
                  {t("sellerHeroStat2Label")}
                </dt>
                <dd className="order-1 font-[family-name:var(--font-editorial-display)] text-4xl font-medium italic leading-none text-white lg:text-5xl">
                  {t("sellerHeroStat2Value")}
                </dd>
              </div>
              <div className="flex flex-col lg:pt-10">
                <dt className="order-2 mt-4 font-[family-name:var(--font-editorial-body)] text-xs font-medium uppercase tracking-[0.18em] text-white/60">
                  {t("proofStat2Label")}
                </dt>
                <dd className="order-1 font-[family-name:var(--font-editorial-display)] text-4xl font-medium italic leading-none text-white lg:text-5xl">
                  {t("proofStat2Value")}
                </dd>
              </div>
            </dl>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
