"use client";

import { motion } from "motion/react";
import { reveal } from "./motion";

interface NumberedItemProps {
  number: string;
  title: string;
  description: string;
}

export function NumberedItem({ number, title, description }: NumberedItemProps) {
  return (
    <motion.article
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={reveal}
      className="relative"
    >
      <div className="flex items-center" aria-hidden="true">
        <span className="h-px w-12 bg-gold" />
        <span className="h-px flex-1 bg-slate-200" />
      </div>
      <div className="mt-6 flex items-baseline gap-5">
        <span
          aria-hidden="true"
          className="font-[family-name:var(--font-editorial-display)] text-3xl font-medium italic leading-none text-navy/40"
        >
          {number}
        </span>
        <div>
          <h3 className="font-[family-name:var(--font-editorial-display)] text-xl font-medium leading-snug text-navy md:text-2xl">
            {title}
          </h3>
          <p className="mt-4 font-[family-name:var(--font-editorial-body)] leading-relaxed text-slate-600">
            {description}
          </p>
        </div>
      </div>
    </motion.article>
  );
}
