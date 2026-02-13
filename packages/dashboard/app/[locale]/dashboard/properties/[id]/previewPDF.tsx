"use client";

import React from "react";
import ProperliaLogo from "@/public/properlia.png";
import Image from "next/image";
import { useGeneralInfo } from "@/src/services/general-info/queries";
import { useT } from "@properlia/shared/components/TranslationProvider";

type ListingTag = {
  label: string;
  kind: string;
};

export type PreviewPDFProps = {
  title: string;
  price: string;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  heroImage: {
    src: string;
    alt?: string;
  };
  tag: ListingTag;
  detailLines: string[];
  features: string[];
  className?: string;
  description: string;
  exclusive?: boolean;
};

function splitIntoTwoColumns(items: string[]) {
  const mid = Math.ceil(items.length / 2);
  return [items.slice(0, mid), items.slice(mid)];
}

const Footer = ({ whatsapp, email }: { whatsapp?: string; email?: string }) => {
  return (
    <div className="w-full bg-primary p-3 text-sm font-extrabold text-white flex justify-between">
      <div>Properlia 2026</div>
      <div>
        {whatsapp} | {email}
      </div>
    </div>
  );
};

export default function PreviewPDF({
  title,
  price,
  address,
  neighborhood,
  city,
  state,
  heroImage,
  tag,
  detailLines,
  features,
  className,
  description,
  exclusive,
}: PreviewPDFProps) {
  const t = useT();
  const { data: generalInfo } = useGeneralInfo();
  const [leftFeatures, rightFeatures] = splitIntoTwoColumns(features);
  const titleTruncated = title.substring(0, 48) + "...";
  const titleHeader =
    title.length > 92 ? title.substring(0, 93) + "..." : title;

  return (
    <section
      className={["w-full bg-white font-sans", className]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="relative w-full">
        {heroImage.src ? (
          <img
            src={heroImage.src}
            alt={heroImage.alt ?? "Property hero image"}
            className="h-[520px] w-full object-cover md:h-[560px]"
          />
        ) : (
          <div className="h-[520px] w-full bg-gray-200 md:h-[560px]" />
        )}

        {exclusive ? (
          <div className="absolute left-4 top-4 md:left-0 md:top-0">
            <div className="bg-white px-4 py-3 shadow-sm">
              <Image src={ProperliaLogo} alt="Properlia logo" width={160} />
            </div>
          </div>
        ) : null}

        <div className="absolute right-4 top-[58%] w-[360px] max-w-[85%] md:right-8 md:w-[420px]">
          <div className="overflow-hidden">
            <div className="flex items-center justify-end bg-[#49C1FF] px-5 py-3">
              <span className="text-sm font-semibold text-white">
                {tag.label}
              </span>
            </div>
            <div className="flex items-center justify-end bg-[#1E49A6] px-5 py-5">
              <span className="text-xl font-extrabold tracking-wide text-white">
                {tag.kind}
              </span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 w-full -translate-x-1/2 px-4">
          <h1 className="text-right text-3xl font-extrabold text-white drop-shadow-[0_3px_10px_rgba(0,0,0,0.35)] md:text-3xl">
            {titleTruncated}
          </h1>
        </div>
      </div>

      <div className="w-full bg-[#E8E8E8]">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-start">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wide text-[#1E49A6]">
                Detalles de la Propiedad
              </h2>

              <div className="mt-7 space-y-1">
                {detailLines.map((line) => (
                  <div
                    key={line}
                    className="text-base font-semibold text-[#1E49A6]"
                  >
                    {line}
                  </div>
                ))}
              </div>
            </div>

            <div className="text-right">
              <div className="text-3xl font-extrabold text-slate-700 md:text-4xl">
                {price}
              </div>

              <div className="mt-5 space-y-1 text-sm font-semibold text-[#1E49A6]">
                {exclusive ? address : null} {neighborhood} {city} {state}
              </div>
            </div>
          </div>

          <div className="mt-16">
            <h3 className="text-3xl font-extrabold text-[#1E49A6]">
              Características
            </h3>

            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              <ul className="space-y-4 text-slate-700">
                {leftFeatures.map((feature) => (
                  <li key={feature} className="flex gap-3">
                    <span className="mt-2 inline-block h-1.5 w-1.5 rounded-full bg-slate-700" />
                    <span className="text-base font-medium">{feature}</span>
                  </li>
                ))}
              </ul>

              <ul className="space-y-4 text-slate-700 md:pl-10">
                {rightFeatures.map((feature) => (
                  <li key={feature} className="flex gap-3">
                    <span className="mt-2 inline-block h-1.5 w-1.5 rounded-full bg-slate-700" />
                    <span className="text-base font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        {exclusive ? (
          <Footer
            whatsapp={generalInfo?.whatsapp}
            email={generalInfo?.email_contact ?? undefined}
          />
        ) : null}
      </div>

      <div className="w-full bg-[#E8E8E8] mt-4">
        <div className="border-b-3 border-primary p-3">
          <div className="w-full text-xs font-extrabold mb-1">
            {titleHeader}
          </div>
          <div className="text-right text-xs flex justify-between items-center gap-1 text-right">
            <div className="font-semibold w-3/4 text-left">
              {exclusive ? address : null} {neighborhood} {city} {state}
            </div>
            <div className="w-1/4 flex gap-1 justify-end self-end text-primary font-semibold">
              <div>{tag.kind}</div>
              <div> • </div>
              <div>{tag.label}</div>
            </div>
          </div>
        </div>
        <div className="p-8">
          <div className="text-primary font-black">{t("description")}</div>
          <div className="text-xs mt-3">{description}</div>
        </div>
      </div>
    </section>
  );
}
