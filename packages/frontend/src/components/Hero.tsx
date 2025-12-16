"use client";

import { Search } from "lucide-react";
import { useT } from "./TranslationProvider";
import { TypingAnimation } from "@/components/ui/typing-animation";
import { capitalizeEachWord } from "@/lib/utils/index";
import { PillLink } from "@/components/ui";
import sellIcon from "@/public/sell.svg";
import { useState } from "react";

export function Hero() {
  const t = useT();
  const [activeTab, setActiveTab] = useState<"rent" | "buy">("rent");

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
            <h2 className="text-3xl text-white mb-6">
              {t("residentialCommercialIndustrial")}
            </h2>

            <div>
              <div className="block bg-white/95 gap-50 px-5 pb-0 pt-4 rounded-t-sm md:inline-block border-b border-transparent">
                <div className="flex justify-around gap-x-10 mb-4 border-stone-200">
                  <button
                    onClick={() => setActiveTab("rent")}
                    className={`pb-1 text-base font-semibold transition-colors cursor-pointer ${
                      activeTab === "rent"
                        ? "text-primary border-b-3 border-primary"
                        : "text-stone-500 hover:text-stone-800"
                    }`}
                  >
                    {capitalizeEachWord(t("rent"))}
                  </button>
                  <button
                    onClick={() => setActiveTab("buy")}
                    className={`pb-1 text-base font-semibold transition-colors cursor-pointer ${
                      activeTab === "buy"
                        ? "text-primary border-b-3 border-primary"
                        : "text-stone-500 hover:text-stone-800"
                    }`}
                  >
                    {capitalizeEachWord(t("buy"))}
                  </button>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-3 bg-white/95 p-4 backdrop-blur-sm border-b rounded-b-sm ">
                <input
                  type="text"
                  placeholder={t("searchByCityOrLocation")}
                  className="flex-[2] px-4 py-3 border border-stone-200 text-sm focus:outline-none focus:border-stone-400 rounded-sm"
                />

                <button className="bg-primary text-white px-8 py-3 hover:bg-primary transition-colors flex items-center justify-center gap-2 rounded-sm cursor-pointer">
                  <Search className="w-5 h-5" />
                  <span className="text-sm tracking-wide font-medium">
                    {capitalizeEachWord(t("search"))}
                  </span>
                </button>
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
