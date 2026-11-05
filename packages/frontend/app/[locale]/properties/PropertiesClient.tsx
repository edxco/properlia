"use client";

import { useState, useEffect, useRef, useTransition, Fragment, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { PropertyFiltersBar } from "@/components/filters/PropertyFiltersBar";
import { PropertyFiltersSidebar } from "@/components/filters/PropertyFiltersSidebar";
import { NoResultsAlert } from "@/components/alerts/NoResultsAlert";
import { useT } from "@properlia/shared/components/TranslationProvider";
import type { Property } from "@properlia/shared/types";
import { PropertyCard, BannerSlideshow } from "@/components/ui";
import { buttonClasses } from "@properlia/shared/components/ui";
import { toPropertyCardProps } from "@/src/lib/propertyCardProps";
import { buildListingQuery, type Filters } from "./listingFilters";

const DEBOUNCED_KEYS = new Set<keyof Filters>(["priceMin", "priceMax", "landAreaMin", "landAreaMax", "searchQuery"]);
const DEBOUNCE_MS = 500;

interface PropertiesClientProps {
  header: ReactNode;
  locale: string;
  filters: Filters;
  properties: Property[];
  page: number;
  totalPages: number;
  totalCount: number;
  hasNoResults: boolean;
  isError: boolean;
  cities: string[];
  states: string[];
}

export default function PropertiesClient({
  header,
  locale,
  filters: urlFilters,
  properties,
  page,
  totalPages,
  totalCount,
  hasNoResults,
  isError,
  cities,
  states,
}: PropertiesClientProps) {
  const t = useT();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [filters, setFilters] = useState<Filters>(urlFilters);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const urlFiltersKey = JSON.stringify(urlFilters);

  // Keep local state in sync when the URL changes (back/forward, links)
  useEffect(() => {
    if (!debounceRef.current) setFilters(JSON.parse(urlFiltersKey));
  }, [urlFiltersKey]);

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  const navigate = (next: Filters) => {
    startTransition(() => {
      router.push(`${pathname}${buildListingQuery(next)}`, { scroll: false });
    });
  };

  const handleFilterChange = (key: keyof Filters, value: any) => {
    const next = { ...filters, [key]: value || undefined };
    setFilters(next);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (DEBOUNCED_KEYS.has(key)) {
      debounceRef.current = setTimeout(() => {
        debounceRef.current = null;
        navigate(next);
      }, DEBOUNCE_MS);
    } else {
      debounceRef.current = null;
      navigate(next);
    }
  };

  const clearFilters = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = null;
    setFilters({});
    navigate({});
  };

  const activeFilterCount = Object.values(filters).filter((v) => v !== undefined).length;
  const advancedFilterCount = [
    filters.city,
    filters.state,
    filters.landAreaMin,
    filters.landAreaMax,
  ].filter((v) => v !== undefined).length;

  const sharedFilterProps = {
    filters,
    onFilterChange: handleFilterChange,
    onClearFilters: clearFilters,
    activeFilterCount,
    currentCount: properties.length,
    totalCount,
    cities,
    states,
  };

  const pageHref = (target: number) => `${pathname}${buildListingQuery(urlFilters, target)}`;

  const banners = [
    {
      title: t("bannerSearchTitle"),
      description: t("bannerSearchDescription"),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      title: t("bannerGuidanceTitle"),
      description: t("bannerGuidanceDescription"),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
        </svg>
      ),
    },
  ];

  const mobileBannerIndex = Math.ceil(properties.length / 2);

  return (
    <section className="py-12 bg-brand-bg min-h-screen">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
        {header}

        {/* Mobile filter bar */}
        <div className="lg:hidden">
          <PropertyFiltersBar
            {...sharedFilterProps}
            advancedFilterCount={advancedFilterCount}
          />
        </div>

        <div className="lg:flex lg:gap-8 lg:items-start">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0 sticky top-6 self-start">
            <PropertyFiltersSidebar {...sharedFilterProps} />
            <div className="mt-4">
              <BannerSlideshow banners={banners} />
            </div>
          </aside>

          {/* Main content */}
          <div
            className={`flex-1 min-w-0 transition-opacity ${isPending ? "opacity-60" : ""}`}
            aria-busy={isPending}
          >
            {hasNoResults && (
              <NoResultsAlert
                filters={urlFilters}
                onClearFilters={clearFilters}
                autoDismissSeconds={10}
              />
            )}

            {isError ? (
              <div className="text-center py-12">
                <div className="text-danger">{t("errorLoading")}</div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {properties.map((property, index) => (
                    <Fragment key={property.id}>
                      {index === mobileBannerIndex && (
                        <div className="col-span-full lg:hidden py-2">
                          <BannerSlideshow banners={banners} />
                        </div>
                      )}
                      <PropertyCard
                        {...toPropertyCardProps(property, locale)}
                        compact
                        priority={index < 3}
                      />
                    </Fragment>
                  ))}
                </div>

                {totalPages > 1 && (
                  <nav
                    aria-label={t("paginationLabel")}
                    className="flex flex-wrap justify-center items-center gap-2 mt-8"
                  >
                    {page > 1 && (
                      <Link
                        href={pageHref(page - 1)}
                        rel="prev"
                        scroll={false}
                        className={buttonClasses({ variant: "secondary", className: "h-10 bg-white px-4" })}
                      >
                        {t("previous")}
                      </Link>
                    )}

                    <div className="flex gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((target) => (
                        <Link
                          key={target}
                          href={pageHref(target)}
                          scroll={false}
                          aria-label={t("pageLabel").replace("{page}", String(target))}
                          aria-current={target === page ? "page" : undefined}
                          className={buttonClasses({
                            variant: target === page ? "primary" : "secondary",
                            size: "icon",
                            className: `tabular-nums ${target === page ? "" : "bg-white"}`,
                          })}
                        >
                          {target}
                        </Link>
                      ))}
                    </div>

                    {page < totalPages && (
                      <Link
                        href={pageHref(page + 1)}
                        rel="next"
                        scroll={false}
                        className={buttonClasses({ variant: "secondary", className: "h-10 bg-white px-4" })}
                      >
                        {t("next")}
                      </Link>
                    )}
                  </nav>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
