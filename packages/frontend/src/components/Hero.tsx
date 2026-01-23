"use client";

import { TypingAnimation } from "@/components/ui/typing-animation";
import { capitalizeEachWord } from "@/lib/utils/index";
import { PillLink } from "@/components/ui";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useT,
  useLocale,
} from "@properlia/shared/components/TranslationProvider";

type ListingType = "rent" | "buy";
type PropertyCategory = "all" | "commercial" | "residential" | "industrial";

export function Hero() {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ListingType>("buy");
  const [activeCategory, setActiveCategory] = useState<PropertyCategory>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.set("search", searchQuery.trim());
    }
    params.set("type", activeTab);
    if (activeCategory !== "all") {
      params.set("category", activeCategory);
    }
    router.push(`/${locale}/properties?${params.toString()}`);
  };

  return (
    <div className="relative py-50">
      <div className="absolute inset-0 bg-stone-900/20 z-10"></div>

      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source
          src="https://videos.pexels.com/video-files/15204933/15204933-hd_1920_1080_24fps.mp4"
          type="video/mp4"
        />
      </video>

      <div className="relative z-20 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
          <div className="max-w-3xl">
            <h5 className="text-2xl text-white bg-primary inline-block px-3 py-1">
              {t("helpU")}
            </h5>
            <h1 className="font-bold text-5xl md:text-7xl font-lexend text-white leading-tight tracking-wide">
              <TypingAnimation
                words={[
                  capitalizeEachWord(t("buy")),
                  capitalizeEachWord(t("sell")),
                  capitalizeEachWord(t("invest")),
                ]}
                loop
              />
            </h1>
            <h2 className="text-3xl text-white mb-6 inline-block leading-11">
              <span className="bg-slate-800/50 px-px">
                {t("residentialCommercialIndustrial")}
              </span>
            </h2>

            {/* Search Card */}
            <div className="bg-white/95 backdrop-blur-sm p-6 rounded-lg max-w-3xl">
              <div className="flex flex-col gap-5">
                {/* Property Type Filter */}
                <div className="flex gap-4">
                  <button
                    onClick={() => setActiveCategory("all")}
                    className={`text-sm cursor-pointer transition-colors ${
                      activeCategory === "all"
                        ? "text-stone-800 border-b-2 border-primary pb-0.5"
                        : "text-stone-400 hover:text-stone-600"
                    }`}
                  >
                    {capitalizeEachWord(t("all"))}
                  </button>
                  <button
                    onClick={() => setActiveCategory("residential")}
                    className={`text-sm cursor-pointer transition-colors ${
                      activeCategory === "residential"
                        ? "text-stone-800 border-b-2 border-primary pb-0.5"
                        : "text-stone-400 hover:text-stone-600"
                    }`}
                  >
                    {capitalizeEachWord(t("residential"))}
                  </button>
                  <button
                    onClick={() => setActiveCategory("commercial")}
                    className={`text-sm cursor-pointer transition-colors ${
                      activeCategory === "commercial"
                        ? "text-stone-800 border-b-2 border-primary pb-0.5"
                        : "text-stone-400 hover:text-stone-600"
                    }`}
                  >
                    {capitalizeEachWord(t("commercial"))}
                  </button>
                  <button
                    onClick={() => setActiveCategory("industrial")}
                    className={`text-sm cursor-pointer transition-colors ${
                      activeCategory === "industrial"
                        ? "text-stone-800 border-b-2 border-primary pb-0.5"
                        : "text-stone-400 hover:text-stone-600"
                    }`}
                  >
                    {capitalizeEachWord(t("industrial"))}
                  </button>
                </div>
                {/* Location Search Input */}
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Ciudad, colonia o zona"
                    className="w-full h-12 pl-10 pr-4 bg-stone-100 rounded-md text-stone-700 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                {/* Intent Selector (Comprar / Rentar) */}
                <div className="bg-stone-100 p-1 rounded-md inline-flex">
                  <button
                    onClick={() => setActiveTab("buy")}
                    className={`flex-1 px-5 py-2 text-sm font-medium rounded transition-colors cursor-pointer ${
                      activeTab === "buy"
                        ? "bg-primary text-white"
                        : "text-stone-500 hover:text-stone-700"
                    }`}
                  >
                    Comprar
                  </button>
                  <button
                    onClick={() => setActiveTab("rent")}
                    className={`flex-1 px-5 py-2 text-sm font-medium rounded transition-colors cursor-pointer ${
                      activeTab === "rent"
                        ? "bg-primary text-white"
                        : "text-stone-500 hover:text-stone-700"
                    }`}
                  >
                    Rentar
                  </button>
                </div>

                {/* Primary CTA */}
                <button
                  onClick={handleSearch}
                  className="w-full h-12 bg-primary text-white font-medium rounded-md hover:bg-primary/90 transition-colors cursor-pointer"
                >
                  Buscar propiedades
                </button>

                {/* Micro-trust copy */}
                <p className="text-xs text-stone-400 text-center">
                  Acompañamiento experto en cada paso
                </p>
              </div>
            </div>

            <PillLink
              href={""}
              children={t("letsGetYourPropertySold")}
              className="mt-6 bg-slate-100"
            />
            <PillLink
              href={""}
              children={t("readyToInvest")}
              className="mt-6 ml-4 bg-slate-300"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
