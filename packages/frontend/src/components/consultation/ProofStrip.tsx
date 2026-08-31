"use client";

import { motion } from "motion/react";
import { useT } from "@properlia/shared/components/TranslationProvider";
import { reveal } from "./motion";

export function ProofStrip() {
  const t = useT();

  return (
    <section className="border-y border-[#C4A44A]/30 bg-[#1A3A5C]">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={reveal}
        className="mx-auto flex max-w-[1400px] flex-col items-center justify-center gap-10 px-6 py-14 md:flex-row md:gap-0 md:py-16 lg:px-8"
      >
        <div className="flex items-baseline gap-5">
          <span className="font-[family-name:var(--font-editorial-display)] text-6xl font-medium leading-none text-white md:text-7xl">
            {t("proofStat1Value")}
          </span>
          <span className="max-w-[11rem] font-[family-name:var(--font-editorial-body)] text-xs font-medium uppercase leading-relaxed tracking-[0.18em] text-white/70">
            {t("proofStat1Label")}
          </span>
        </div>

        <span
          aria-hidden="true"
          className="h-px w-24 bg-[#C4A44A]/40 md:mx-16 md:h-16 md:w-px lg:mx-24"
        />

        <div className="flex items-baseline gap-5">
          <span className="font-[family-name:var(--font-editorial-display)] text-4xl font-medium italic leading-none text-white md:text-5xl">
            {t("proofStat2Value")}
          </span>
          <span className="max-w-[9rem] font-[family-name:var(--font-editorial-body)] text-xs font-medium uppercase leading-relaxed tracking-[0.18em] text-white/70">
            {t("proofStat2Label")}
          </span>
        </div>
      </motion.div>
    </section>
  );
}
