"use client";

import { Search } from "lucide-react";
import { TypingAnimation } from "@/components/ui/typing-animation";
import { capitalizeEachWord } from "@/lib/utils/index";
import { PillLink } from "@/components/ui";
import sellIcon from "@/public/sell.svg";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useT, useLocale } from "@properlia/shared/components/TranslationProvider";
import { useProperties } from "@/src/services/properties/queries";
import { Property } from "@properlia/shared/types";

export function Hero() {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"rent" | "buy">("rent");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch properties to get location data
  const { data: propertiesData } = useProperties({ items: 100 });

  // Get unique cities and states for autocomplete
  const locations = useMemo(() => {
    if (!propertiesData?.data) return [];

    const locationsSet = new Set<string>();

    propertiesData.data.forEach((prop: Property) => {
      if (prop.city) locationsSet.add(prop.city);
      if (prop.state) locationsSet.add(prop.state);
      // Also add combined "City, State" format
      if (prop.city && prop.state) {
        locationsSet.add(`${prop.city}, ${prop.state}`);
      }
    });

    return Array.from(locationsSet).sort();
  }, [propertiesData]);

  // Filter suggestions based on search query
  const suggestions = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];

    const query = searchQuery.toLowerCase();
    return locations
      .filter((location) => location.toLowerCase().includes(query))
      .slice(0, 5); // Limit to 5 suggestions
  }, [searchQuery, locations]);

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

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setShowSuggestions(false);
                  router.push(`/${locale}/properties?search=${encodeURIComponent(searchQuery)}&type=${activeTab}`);
                }}
                className="flex flex-col md:flex-row gap-3 bg-white/95 p-4 backdrop-blur-sm border-b rounded-b-sm "
              >
                <div className="flex-[2] relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => {
                      // Delay to allow clicking on suggestions
                      setTimeout(() => setShowSuggestions(false), 200);
                    }}
                    placeholder={t("searchByCityOrLocation")}
                    className="w-full px-4 py-3 border border-stone-200 text-sm focus:outline-none focus:border-stone-400 rounded-sm"
                  />

                  {/* Autocomplete Suggestions */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-stone-200 rounded-sm shadow-lg z-50 max-h-60 overflow-y-auto">
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            setSearchQuery(suggestion);
                            setShowSuggestions(false);
                          }}
                          className="w-full px-4 py-2.5 text-left text-sm hover:bg-stone-50 transition-colors border-b border-stone-100 last:border-b-0"
                        >
                          <div className="flex items-center gap-2">
                            <Search className="w-4 h-4 text-stone-400" />
                            <span className="text-stone-700">{suggestion}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="bg-primary text-white px-8 py-3 hover:bg-primary transition-colors flex items-center justify-center gap-2 rounded-sm cursor-pointer"
                >
                  <Search className="w-5 h-5" />
                  <span className="text-sm tracking-wide font-medium">
                    {capitalizeEachWord(t("search"))}
                  </span>
                </button>
              </form>
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
