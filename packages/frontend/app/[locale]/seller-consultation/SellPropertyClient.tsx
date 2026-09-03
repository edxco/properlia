"use client";

import { useState } from "react";
import { MotionConfig } from "motion/react";
import { useT, useLocale } from "@properlia/shared/components/TranslationProvider";
import { PriceInput } from "@properlia/shared/components";
import { parsePriceInput } from "@properlia/shared";
import { usePropertyTypes } from "@/src/services/property-types/queries";
import { useStates } from "@/src/services/states/queries";
import { useCities } from "@/src/services/cities/queries";
import { useCreatePublicLead } from "@/src/services/leads/mutations";
import { CreatePublicLeadDto } from "@properlia/shared/services/leads/api";
import { IconCheck } from "@tabler/icons-react";
import { ProofStrip } from "@/src/components/consultation/ProofStrip";
import { SellerHero } from "./_components/SellerHero";
import { SellerMethod } from "./_components/SellerMethod";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

const labelClass =
  "block font-[family-name:var(--font-editorial-body)] text-sm font-medium text-[#1A3A5C] mb-1.5";
const errorTextClass =
  "mt-1.5 font-[family-name:var(--font-editorial-body)] text-sm text-red-600";
const requiredMarkClass = "text-red-500";

function fieldClass(hasError?: boolean) {
  return `w-full h-12 px-4 border rounded-sm bg-white font-[family-name:var(--font-editorial-body)] text-sm text-[#1A3A5C] placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-[#214C9B] focus:border-[#214C9B] ${
    hasError ? "border-red-400" : "border-slate-300"
  }`;
}

function textareaClass(hasError?: boolean) {
  return `w-full px-4 py-3 border rounded-sm bg-white font-[family-name:var(--font-editorial-body)] text-sm text-[#1A3A5C] placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-[#214C9B] focus:border-[#214C9B] resize-none ${
    hasError ? "border-red-400" : "border-slate-300"
  }`;
}

interface FormData {
  full_name: string;
  email: string;
  phone: string;
  property_type_id: string;
  desired_date: string;
  max_budget: string;
  neighborhood: string;
  city_id: string;
  state_id: string;
  notes: string;
  consent_marketing: boolean;
}

const initialFormData: FormData = {
  full_name: "",
  email: "",
  phone: "",
  property_type_id: "",
  desired_date: "",
  max_budget: "",
  neighborhood: "",
  city_id: "",
  state_id: "",
  notes: "",
  consent_marketing: false,
};

export default function SellPropertyClient() {
  const t = useT();
  const locale = useLocale();
  const { data: propertyTypesData } = usePropertyTypes();
  const createLead = useCreatePublicLead();

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData | "general", string>>>({});
  const [isSuccess, setIsSuccess] = useState(false);

  const propertyTypes = propertyTypesData?.data || [];
  const { data: statesData } = useStates();
  const states = statesData?.data || [];
  const { data: citiesData } = useCities(formData.state_id);
  const cities = citiesData?.data || [];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStateId = e.target.value;
    // Reset city when state changes, since the city list is scoped to the state.
    setFormData((prev) => ({ ...prev, state_id: newStateId, city_id: "" }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData | "general", string>> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = t("requiredField");
    }

    if (!formData.email.trim() && !formData.phone.trim()) {
      newErrors.email = t("emailOrPhoneRequired");
      newErrors.phone = t("emailOrPhoneRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    const leadData: CreatePublicLeadDto = {
      full_name: formData.full_name,
      source: "seller_form",
      interest_operation: "sell",
      consent_marketing: formData.consent_marketing,
    };

    if (formData.email.trim()) leadData.email = formData.email;
    if (formData.phone.trim()) leadData.phone = formData.phone;
    if (formData.property_type_id) leadData.property_type_id = formData.property_type_id;
    if (formData.desired_date) leadData.desired_date = formData.desired_date;
    if (formData.max_budget) {
      const parsedBudget = parsePriceInput(formData.max_budget);
      if (!isNaN(parsedBudget)) leadData.max_budget = parsedBudget;
    }
    if (formData.neighborhood.trim()) leadData.neighborhood = formData.neighborhood;
    if (formData.city_id) leadData.city_id = formData.city_id;
    if (formData.state_id) leadData.state_id = formData.state_id;
    if (formData.notes.trim()) leadData.notes = formData.notes;

    try {
      await createLead.mutateAsync(leadData);
      setIsSuccess(true);
      window.dataLayer?.push({
        event: "seller_consultation_submit",
        event_category: "lead_generation",
        event_label: "seller_consultation",
        form_name: "seller_consultation",
      });
      setFormData(initialFormData);
    } catch (error: any) {
      const message =
        error?.errors?.join(", ") ||
        error?.message ||
        t("formError");
      setErrors({ general: message });
    }
  };

  if (isSuccess) {
    return (
      <section className="flex min-h-[60vh] items-center bg-[#EEF1F5] py-24 font-[family-name:var(--font-editorial-body)]">
        <div className="mx-auto w-full max-w-xl px-6 lg:px-8">
          <div className="border-t-2 border-[#C4A44A] bg-white px-8 py-12 text-center shadow-[0_24px_64px_-32px_rgba(26,58,92,0.35)] md:px-12 md:py-14">
            <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-[#1A3A5C]">
              <IconCheck size={30} stroke={2} className="text-[#C4A44A]" />
            </div>
            <h2 className="font-[family-name:var(--font-editorial-display)] text-2xl font-semibold leading-snug text-[#1A3A5C] md:text-3xl">
              {t("formSuccess")}
            </h2>
            <button
              onClick={() => setIsSuccess(false)}
              className="mt-10 inline-flex h-12 items-center bg-[#1A3A5C] px-8 font-[family-name:var(--font-editorial-body)] text-sm font-medium text-white transition-colors hover:bg-[#214C9B] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#214C9B] focus-visible:ring-offset-2"
            >
              {t("submitForm")}
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
      <SellerHero />
      <SellerMethod />
      <ProofStrip />

      <section id="seller-consultation-form" className="bg-[#EEF1F5] py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          {/* Editorial section header, aligned with the card */}
          <div className="max-w-2xl">
            <h2 className="font-[family-name:var(--font-editorial-display)] text-4xl font-semibold tracking-[-0.01em] text-[#1A3A5C] md:text-5xl">
              {t("sellFormTitle")}
            </h2>
          </div>

          {/* The consultation card: advisor rail + client side */}
          <div className="mt-12 grid overflow-hidden border-t-2 border-[#C4A44A] shadow-[0_32px_80px_-40px_rgba(26,58,92,0.4)] lg:grid-cols-[320px_1fr]">
            {/* Advisor rail: method recap + trust microcopy (desktop only) */}
            <aside className="hidden flex-col bg-[#1A3A5C] px-10 py-12 lg:flex">
              <p className="font-[family-name:var(--font-editorial-body)] text-xs font-medium uppercase tracking-[0.22em] text-white/50">
                {t("sellerRailTitle")}
              </p>

              <ol className="mt-10 space-y-2">
                {[1, 2, 3, 4].map((n) => (
                  <li
                    key={n}
                    className="flex items-center gap-5 border-l-2 border-white/10 py-4 pl-6"
                  >
                    <span
                      aria-hidden="true"
                      className="w-9 font-[family-name:var(--font-editorial-display)] text-2xl font-medium italic leading-none text-white/40"
                    >
                      0{n}
                    </span>
                    <span className="font-[family-name:var(--font-editorial-body)] text-sm text-white/80">
                      {t(`sellerMethod${n}Title`)}
                    </span>
                  </li>
                ))}
              </ol>

              <div className="mt-auto space-y-3 border-t border-white/10 pt-8">
                <p className="flex items-start gap-3 font-[family-name:var(--font-editorial-body)] text-sm leading-relaxed text-white/70">
                  <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#C4A44A]" />
                  {t("buyerTrustStripPart2")}
                </p>
                <p className="flex items-start gap-3 font-[family-name:var(--font-editorial-body)] text-sm leading-relaxed text-white/70">
                  <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#C4A44A]" />
                  {t("buyerTrustStripPart1")}
                </p>
              </div>
            </aside>

            <div className="bg-white px-6 py-10 md:px-10 lg:px-14 lg:py-12">
              {errors.general && (
                <div
                  role="alert"
                  className="mb-8 border-l-2 border-red-500 bg-red-50 p-4 font-[family-name:var(--font-editorial-body)] text-sm text-red-700"
                >
                  {errors.general}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Full Name */}
                <div>
                  <label htmlFor="full_name" className={labelClass}>
                    {t("fullName")} <span className={requiredMarkClass}>*</span>
                  </label>
                  <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder={t("enterFullName")}
                    className={fieldClass(!!errors.full_name)}
                  />
                  {errors.full_name && (
                    <p className={errorTextClass}>{errors.full_name}</p>
                  )}
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor="email" className={labelClass}>
                      {t("email")}
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder={t("enterEmail")}
                      className={fieldClass(!!errors.email)}
                    />
                    {errors.email && (
                      <p className={errorTextClass}>{errors.email}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="phone" className={labelClass}>
                      {t("phone")}
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder={t("enterPhone")}
                      className={fieldClass(!!errors.phone)}
                    />
                    {errors.phone && (
                      <p className={errorTextClass}>{errors.phone}</p>
                    )}
                  </div>
                </div>

                {/* Property Type & Desired Date */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor="property_type_id" className={labelClass}>
                      {t("propertyType")}
                    </label>
                    <select
                      id="property_type_id"
                      name="property_type_id"
                      value={formData.property_type_id}
                      onChange={handleChange}
                      className={fieldClass()}
                    >
                      <option value="">{t("selectPropertyType")}</option>
                      {propertyTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {locale === "es" ? type.es_name : type.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="desired_date" className={labelClass}>
                      {t("desiredDate")}
                    </label>
                    <input
                      type="date"
                      id="desired_date"
                      name="desired_date"
                      value={formData.desired_date}
                      onChange={handleChange}
                      className={fieldClass()}
                    />
                  </div>
                </div>

                {/* Max Budget */}
                <div>
                  <label htmlFor="max_budget" className={labelClass}>
                    {t("maxBudget")}
                  </label>
                  <PriceInput
                    id="max_budget"
                    name="max_budget"
                    value={formData.max_budget}
                    onChange={(formatted) =>
                      setFormData((prev) => ({ ...prev, max_budget: formatted }))
                    }
                    placeholder={t("enterMaxBudget")}
                    className={`${fieldClass()} pl-8 pr-4`}
                    symbolClassName="text-slate-500"
                  />
                </div>

                {/* Location */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <label htmlFor="neighborhood" className={labelClass}>
                      {t("neighborhood")}
                    </label>
                    <input
                      type="text"
                      id="neighborhood"
                      name="neighborhood"
                      value={formData.neighborhood}
                      onChange={handleChange}
                      placeholder={t("enterNeighborhood")}
                      className={fieldClass()}
                    />
                  </div>
                  <div>
                    <label htmlFor="state_id" className={labelClass}>
                      {t("state")}
                    </label>
                    <select
                      id="state_id"
                      name="state_id"
                      value={formData.state_id}
                      onChange={handleStateChange}
                      className={fieldClass()}
                    >
                      <option value="">{t("select")}</option>
                      {states.map((state) => (
                        <option key={state.id} value={state.id}>
                          {locale === "es" ? state.es_name : state.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="city_id" className={labelClass}>
                      {t("city")}
                    </label>
                    <select
                      id="city_id"
                      name="city_id"
                      value={formData.city_id}
                      onChange={handleChange}
                      disabled={!formData.state_id}
                      className={fieldClass()}
                    >
                      <option value="">{t("select")}</option>
                      {cities.map((city) => (
                        <option key={city.id} value={city.id}>
                          {locale === "es" ? city.es_name : city.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="notes" className={labelClass}>
                    {t("propertyDescription")}
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={4}
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder={t("enterDescription")}
                    className={textareaClass()}
                  />
                </div>

                {/* Consent Marketing */}
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="consent_marketing"
                    name="consent_marketing"
                    checked={formData.consent_marketing}
                    onChange={handleChange}
                    className="mt-1 h-4 w-4 rounded border-slate-300 accent-[#214C9B]"
                  />
                  <label
                    htmlFor="consent_marketing"
                    className="ml-3 font-[family-name:var(--font-editorial-body)] text-sm text-slate-600"
                  >
                    {t("consentMarketing")}
                  </label>
                </div>

                {/* Submit Button */}
                <div className="border-t border-slate-200 pt-6">
                  <button
                    type="submit"
                    disabled={createLead.isPending}
                    className="flex h-12 w-full items-center justify-center gap-2 bg-[#C4A44A] px-7 font-[family-name:var(--font-editorial-body)] text-sm font-semibold text-[#1A3A5C] transition-colors hover:bg-[#B69544] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#214C9B] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 md:ml-auto md:w-auto"
                  >
                    {createLead.isPending ? t("submitting") : t("submitForm")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}
