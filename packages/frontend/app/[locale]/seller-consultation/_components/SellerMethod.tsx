"use client";

import { motion } from "motion/react";
import { useT } from "@properlia/shared/components/TranslationProvider";
import { NumberedItem } from "@/src/components/consultation/NumberedItem";
import { reveal } from "@/src/components/consultation/motion";

export function SellerMethod() {
  const t = useT();

  const steps = [1, 2, 3, 4].map((n) => ({
    number: `0${n}`,
    title: t(`sellerMethod${n}Title`),
    description: t(`sellerMethod${n}Description`),
  }));

  return (
    <section className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-8">
        {/* Editorial section header: left-aligned, indexed */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={reveal}
          className="flex items-end justify-between gap-8 border-b border-slate-200 pb-8"
        >
          <h2 className="max-w-2xl font-[family-name:var(--font-editorial-display)] text-4xl font-medium tracking-[-0.01em] text-navy md:text-5xl">
            {t("sellerMethodTitle")}
          </h2>
          <span
            aria-hidden="true"
            className="hidden shrink-0 font-[family-name:var(--font-editorial-display)] text-2xl italic text-slate-300 md:block"
          >
            01 — 04
          </span>
        </motion.div>

        {/* The method: an ordered sequence, staggered on desktop */}
        <div className="mt-16 grid items-start gap-14 md:mt-20 md:grid-cols-2 md:gap-x-16 md:gap-y-20 lg:gap-x-24">
          {steps.map((step, index) => (
            <div key={step.number} className={index % 2 === 1 ? "md:pt-24" : ""}>
              <NumberedItem
                number={step.number}
                title={step.title}
                description={step.description}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
