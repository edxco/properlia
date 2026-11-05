"use client";

import { useState } from "react";
import { MotionConfig } from "motion/react";
import { useT, useLocale } from "@properlia/shared/components/TranslationProvider";
import { PriceInput } from "@properlia/shared/components";
import { Alert, Button, controlClasses, Label } from "@properlia/shared/components/ui";
import { parsePriceInput } from "@properlia/shared";
import { usePropertyTypes } from "@/src/services/property-types/queries";
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

const errorTextClass =
  "mt-1.5 text-sm text-danger";
const requiredMarkClass = "text-danger";



interface FormData {
  full_name: string;
  email: string;
  phone: string;
  property_type_id: string;
  desired_date: string;
  max_budget: string;
  neighborhood: string;
  city: string;
  state: string;
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
  city: "",
  state: "",
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
    if (formData.city.trim()) leadData.city = formData.city;
    if (formData.state.trim()) leadData.state = formData.state;
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
      <section className="flex min-h-[60vh] items-center bg-brand-pale py-24">
        <div className="mx-auto w-full max-w-xl px-6 lg:px-8">
          <div className="border-t-2 border-brand-gold bg-white px-8 py-12 text-center shadow-overlay md:px-12 md:py-14">
            <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-brand-navy">
              <IconCheck size={30} stroke={2} className="text-brand-gold" />
            </div>
            <h2 className="font-display text-2xl font-medium leading-snug text-brand-navy md:text-3xl">
              {t("formSuccess")}
            </h2>
            <Button size="lg" onClick={() => setIsSuccess(false)} className="mt-10 text-sm">
              {t("submitForm")}
            </Button>
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

      <section id="seller-consultation-form" className="bg-brand-pale py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          {/* Editorial section header, aligned with the card */}
          <div className="max-w-2xl">
            <h2 className="font-display text-4xl font-medium tracking-[-0.01em] text-brand-navy md:text-5xl">
              {t("sellFormTitle")}
            </h2>
          </div>

          {/* The consultation card: advisor rail + client side */}
          <div className="mt-12 grid overflow-hidden border-t-2 border-brand-gold shadow-overlay lg:grid-cols-[320px_1fr]">
            {/* Advisor rail: method recap + trust microcopy (desktop only) */}
            <aside className="hidden flex-col bg-brand-navy px-10 py-12 lg:flex">
              <p className=" text-xs font-medium uppercase tracking-[0.22em] text-white/50">
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
                      className="w-9 font-display text-2xl font-medium italic leading-none text-white/40"
                    >
                      0{n}
                    </span>
                    <span className=" text-sm text-white/80">
                      {t(`sellerMethod${n}Title`)}
                    </span>
                  </li>
                ))}
              </ol>

              <div className="mt-auto space-y-3 border-t border-white/10 pt-8">
                <p className="flex items-start gap-3 text-sm leading-relaxed text-white/70">
                  <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand-gold" />
                  {t("buyerTrustStripPart2")}
                </p>
                <p className="flex items-start gap-3 text-sm leading-relaxed text-white/70">
                  <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand-gold" />
                  {t("buyerTrustStripPart1")}
                </p>
              </div>
            </aside>

            <div className="bg-white px-6 py-10 md:px-10 lg:px-14 lg:py-12">
              {errors.general && (
                <Alert tone="danger" className="mb-8">
                  {errors.general}
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Full Name */}
                <div>
                  <Label htmlFor="full_name">
                    {t("fullName")} <span className={requiredMarkClass}>*</span>
                  </Label>
                  <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder={t("enterFullName")}
                    className={controlClasses({ invalid: !!errors.full_name })}
                  />
                  {errors.full_name && (
                    <p className={errorTextClass}>{errors.full_name}</p>
                  )}
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="email">
                      {t("email")}
                    </Label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder={t("enterEmail")}
                      className={controlClasses({ invalid: !!errors.email })}
                    />
                    {errors.email && (
                      <p className={errorTextClass}>{errors.email}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="phone">
                      {t("phone")}
                    </Label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder={t("enterPhone")}
                      className={controlClasses({ invalid: !!errors.phone })}
                    />
                    {errors.phone && (
                      <p className={errorTextClass}>{errors.phone}</p>
                    )}
                  </div>
                </div>

                {/* Property Type & Desired Date */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="property_type_id">
                      {t("propertyType")}
                    </Label>
                    <select
                      id="property_type_id"
                      name="property_type_id"
                      value={formData.property_type_id}
                      onChange={handleChange}
                      className={controlClasses()}
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
                    <Label htmlFor="desired_date">
                      {t("desiredDate")}
                    </Label>
                    <input
                      type="date"
                      id="desired_date"
                      name="desired_date"
                      value={formData.desired_date}
                      onChange={handleChange}
                      className={controlClasses()}
                    />
                  </div>
                </div>

                {/* Max Budget */}
                <div>
                  <Label htmlFor="max_budget">
                    {t("maxBudget")}
                  </Label>
                  <PriceInput
                    id="max_budget"
                    name="max_budget"
                    value={formData.max_budget}
                    onChange={(formatted) =>
                      setFormData((prev) => ({ ...prev, max_budget: formatted }))
                    }
                    placeholder={t("enterMaxBudget")}
                    className="pl-8 pr-4"
                    symbolClassName="text-brand-gray"
                  />
                </div>

                {/* Location */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <Label htmlFor="neighborhood">
                      {t("neighborhood")}
                    </Label>
                    <input
                      type="text"
                      id="neighborhood"
                      name="neighborhood"
                      value={formData.neighborhood}
                      onChange={handleChange}
                      placeholder={t("enterNeighborhood")}
                      className={controlClasses()}
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">
                      {t("city")}
                    </Label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder={t("enterCity")}
                      className={controlClasses()}
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">
                      {t("state")}
                    </Label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder={t("enterState")}
                      className={controlClasses()}
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="notes">
                    {t("propertyDescription")}
                  </Label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={4}
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder={t("enterDescription")}
                    className={controlClasses({ multiline: true, className: "resize-none" })}
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
                    className="mt-1 h-4 w-4 rounded border-input accent-brand-blue"
                  />
                  <label
                    htmlFor="consent_marketing"
                    className="ml-3 text-sm text-brand-carbon/70"
                  >
                    {t("consentMarketing")}
                  </label>
                </div>

                {/* Submit Button */}
                <div className="border-t border-brand-border pt-6">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={createLead.isPending}
                    className="flex w-full px-7 text-sm md:ml-auto md:w-auto"
                  >
                    {createLead.isPending ? t("submitting") : t("submitForm")}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}
