"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { useT, useLocale } from "@properlia/shared/components/TranslationProvider";
import { PriceInput } from "@properlia/shared/components";
import { parsePriceInput } from "@properlia/shared";
import { useCreatePublicLead } from "@/src/services/leads/mutations";
import { useGeneralInfo } from "@/src/services/general-info/queries";
import { CreatePublicLeadDto } from "@properlia/shared/services/leads/api";
import {
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconBrandWhatsapp,
} from "@tabler/icons-react";
import { BuyerHero } from "./_components/BuyerHero";
import { BuyerAdvantages } from "./_components/BuyerAdvantages";
import { ProofStrip } from "@/src/components/consultation/ProofStrip";
import { BuyerStepper } from "./_components/BuyerStepper";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

// Step configuration
const TOTAL_STEPS = 4;

const labelClass =
  "block font-[family-name:var(--font-editorial-body)] text-sm font-medium text-[#1A3A5C] mb-1.5";
const helperTextClass =
  "font-[family-name:var(--font-editorial-body)] text-xs text-slate-400 mb-2";
const errorTextClass =
  "mt-1.5 font-[family-name:var(--font-editorial-body)] text-sm text-red-600";
const requiredMarkClass = "text-red-500";
const radioOptionClass = "flex items-center gap-3 cursor-pointer";
const radioInputClass = "h-4 w-4 accent-[#214C9B] border-slate-300";
const radioLabelClass = "font-[family-name:var(--font-editorial-body)] text-sm text-slate-700";
const checkboxInputClass = "h-4 w-4 accent-[#214C9B] border-slate-300 rounded";

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
  // Step 1: Contact & starting point
  full_name: string;
  email: string;
  phone: string;
  phone_has_whatsapp: boolean;
  how_did_you_hear: string;
  how_did_you_hear_other: string;

  // Step 2: Buyer profile
  buyer_profile: string;
  buyer_profile_other: string;
  buying_as: string;

  // Step 3: Property, location & budget
  property_types: string[];
  process_stage: string;
  priority_zones: string;
  open_to_other_zones: string;
  max_budget: string;
  payment_method: string;
  credit_pre_approval: string;

  // Step 4: Criteria, goals & commitment
  essential_criteria: string;
  deal_breakers: string;
  primary_goal: string;
  primary_goal_other: string;
  decision_timeframe: string;
  prior_experience: string;
  prior_experience_frustration: string;
  consultation_expectations: string;
  commitment_level: string;

  // Common
  consent_marketing: boolean;
}

const initialFormData: FormData = {
  // Step 1
  full_name: "",
  email: "",
  phone: "",
  phone_has_whatsapp: false,
  how_did_you_hear: "",
  how_did_you_hear_other: "",

  // Step 2
  buyer_profile: "",
  buyer_profile_other: "",
  buying_as: "",

  // Step 3
  property_types: [],
  process_stage: "",
  priority_zones: "",
  open_to_other_zones: "",
  max_budget: "",
  payment_method: "",
  credit_pre_approval: "",

  // Step 4
  essential_criteria: "",
  deal_breakers: "",
  primary_goal: "",
  primary_goal_other: "",
  decision_timeframe: "",
  prior_experience: "",
  prior_experience_frustration: "",
  consultation_expectations: "",
  commitment_level: "",

  consent_marketing: false,
};

// Helper function to calculate desired_date based on timeframe selection
const getDesiredDate = (timeframe: string): string => {
  const today = new Date();
  let monthsToAdd = 0;

  switch (timeframe) {
    case "0-3":
      monthsToAdd = 3;
      break;
    case "3-6":
      monthsToAdd = 6;
      break;
    case "6-12":
      monthsToAdd = 12;
      break;
    default:
      monthsToAdd = 3;
  }

  const futureDate = new Date(today.setMonth(today.getMonth() + monthsToAdd));
  return futureDate.toISOString().split("T")[0];
};

export default function BuyerConsultationClient() {
  const t = useT();
  const locale = useLocale();
  const createLead = useCreatePublicLead();
  const { data: generalInfo } = useGeneralInfo();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormData | "general", string>>
  >({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedName, setSubmittedName] = useState("");

  // Move focus to the step heading when the step changes (keyboard/AT users)
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const prevStepRef = useRef(currentStep);
  useEffect(() => {
    if (prevStepRef.current !== currentStep) {
      stepHeadingRef.current?.focus();
      prevStepRef.current = currentStep;
    }
  }, [currentStep]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleCheckboxGroupChange = (name: string, value: string) => {
    setFormData((prev) => {
      const currentValues = prev[name as keyof FormData] as string[];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];
      return { ...prev, [name]: newValues };
    });

    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<Record<keyof FormData | "general", string>> = {};

    switch (step) {
      case 1:
        if (!formData.full_name.trim()) {
          newErrors.full_name = t("requiredField");
        }
        if (!formData.email.trim()) {
          newErrors.email = t("requiredField");
        }
        if (!formData.phone.trim()) {
          newErrors.phone = t("requiredField");
        }
        if (formData.how_did_you_hear === "other" && !formData.how_did_you_hear_other.trim()) {
          newErrors.how_did_you_hear_other = t("requiredField");
        }
        break;

      case 2:
        if (!formData.buyer_profile) {
          newErrors.buyer_profile = t("requiredField");
        }
        if (formData.buyer_profile === "other" && !formData.buyer_profile_other.trim()) {
          newErrors.buyer_profile_other = t("requiredField");
        }
        if (!formData.buying_as) {
          newErrors.buying_as = t("requiredField");
        }
        break;

      case 3:
        if (formData.property_types.length === 0) {
          newErrors.property_types = t("requiredField");
        }
        if (!formData.process_stage) {
          newErrors.process_stage = t("requiredField");
        }
        if (!formData.max_budget.trim()) {
          newErrors.max_budget = t("requiredField");
        }
        if (!formData.payment_method) {
          newErrors.payment_method = t("requiredField");
        }
        if (
          (formData.payment_method === "mortgage" ||
            formData.payment_method === "mixed") &&
          !formData.credit_pre_approval
        ) {
          newErrors.credit_pre_approval = t("requiredField");
        }
        break;

      case 4:
        if (!formData.essential_criteria.trim()) {
          newErrors.essential_criteria = t("requiredField");
        }
        if (!formData.primary_goal) {
          newErrors.primary_goal = t("requiredField");
        }
        if (formData.primary_goal === "other" && !formData.primary_goal_other.trim()) {
          newErrors.primary_goal_other = t("requiredField");
        }
        if (!formData.decision_timeframe) {
          newErrors.decision_timeframe = t("requiredField");
        }
        if (formData.prior_experience === "yes" && !formData.prior_experience_frustration.trim()) {
          newErrors.prior_experience_frustration = t("requiredField");
        }
        if (!formData.commitment_level) {
          newErrors.commitment_level = t("requiredField");
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(currentStep)) return;

    // Parse max_budget using shared utility
    const parsedBudget = parsePriceInput(formData.max_budget);

    // Build property type string
    const propertyTypeStr = formData.property_types.join(", ");

    // Build primary goal string
    const primaryGoal =
      formData.primary_goal === "other"
        ? formData.primary_goal_other
        : formData.primary_goal;

    // Build how did you hear string
    const howDidYouHear =
      formData.how_did_you_hear === "other"
        ? formData.how_did_you_hear_other
        : formData.how_did_you_hear;

    // Build buyer profile string
    const buyerProfile =
      formData.buyer_profile === "other"
        ? formData.buyer_profile_other
        : formData.buyer_profile;

    const leadData: CreatePublicLeadDto = {
      full_name: formData.full_name,
      email: formData.email,
      phone: formData.phone,
      source: "buyer_form",
      interest_operation: "buy",
      consent_marketing: formData.consent_marketing,
      max_budget: isNaN(parsedBudget) ? undefined : parsedBudget,
      desired_date: getDesiredDate(formData.decision_timeframe),
      neighborhood: formData.priority_zones.trim() || undefined,
      interest_property_type: propertyTypeStr,
      source_detail: {
        // Step 1 details
        phone_has_whatsapp: formData.phone_has_whatsapp,
        how_did_you_hear: howDidYouHear,
        // Step 2 details
        buyer_profile: buyerProfile,
        buying_as: formData.buying_as,
        // Step 3 details
        property_types: formData.property_types,
        process_stage: formData.process_stage,
        priority_zones: formData.priority_zones,
        open_to_other_zones: formData.open_to_other_zones,
        payment_method: formData.payment_method,
        credit_pre_approval: formData.credit_pre_approval,
        // Step 4 details
        essential_criteria: formData.essential_criteria,
        deal_breakers: formData.deal_breakers,
        primary_goal: primaryGoal,
        decision_timeframe: formData.decision_timeframe,
        prior_experience: formData.prior_experience,
        prior_experience_frustration: formData.prior_experience_frustration,
        consultation_expectations: formData.consultation_expectations,
        commitment_level: formData.commitment_level,
      },
      notes: `Buyer Profile: ${buyerProfile}
Buying As: ${formData.buying_as}
Property Types: ${propertyTypeStr}
Process Stage: ${formData.process_stage}
Priority Zones: ${formData.priority_zones}
Open to Other Zones: ${formData.open_to_other_zones}
Payment Method: ${formData.payment_method}
Credit Pre-Approval: ${formData.credit_pre_approval}
Primary Goal: ${primaryGoal}
Essential Criteria: ${formData.essential_criteria}
Deal Breakers: ${formData.deal_breakers}
Decision Timeframe: ${formData.decision_timeframe}
Prior Experience: ${formData.prior_experience}
Frustration: ${formData.prior_experience_frustration}
Consultation Expectations: ${formData.consultation_expectations}
Commitment Level: ${formData.commitment_level}
How Did You Hear: ${howDidYouHear}
Phone Has WhatsApp: ${formData.phone_has_whatsapp}`,
    };

    try {
      await createLead.mutateAsync(leadData);
      setIsSuccess(true);
      setSubmittedName(formData.full_name.trim());
      window.dataLayer?.push({
        event: "buyer_consultation_submit",
        event_category: "lead_generation",
        event_label: "buyer_consultation",
        form_name: "buyer_consultation",
      });
      setFormData(initialFormData);
      setCurrentStep(1);
    } catch (error: any) {
      setErrors({
        general: error?.errors?.join(", ") || t("formError"),
      });
    }
  };

  const stepperLabels = [
    t("buyerStepperLabel1"),
    t("buyerStepperLabel2"),
    t("buyerStepperLabel3"),
    t("buyerStepperLabel4"),
  ];

  const stepTitles = [
    { title: t("buyerStep1Title"), description: t("buyerStep1Description") },
    { title: t("buyerStep2Title"), description: t("buyerStep2Description") },
    { title: t("buyerStep3Title"), description: t("buyerStep3Description") },
    { title: t("buyerStep4Title"), description: t("buyerStep4Description") },
  ];

  if (isSuccess) {
    return (
      <section className="flex min-h-[60vh] items-center bg-[#EEF1F5] py-24 font-[family-name:var(--font-editorial-body)]">
        <div className="mx-auto w-full max-w-xl px-6 lg:px-8">
          <div className="border-t-2 border-[#C4A44A] bg-white px-8 py-12 text-center shadow-[0_24px_64px_-32px_rgba(26,58,92,0.35)] md:px-12 md:py-14">
            <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-[#1A3A5C]">
              <IconCheck size={30} stroke={2} className="text-[#C4A44A]" />
            </div>
            <h2 className="font-[family-name:var(--font-editorial-display)] text-2xl font-semibold leading-snug text-[#1A3A5C] md:text-3xl">
              {t("buyerFormSuccess")
                .replace("{{buyer_name}}", submittedName)
                .split("\n")
                .map((line: string, index: number) => (
                  <Fragment key={index}>
                    {index > 0 && <br />}
                    {line}
                  </Fragment>
                ))}
            </h2>
            <button
              onClick={() => setIsSuccess(false)}
              className="mt-10 inline-flex h-12 items-center bg-[#1A3A5C] px-8 font-[family-name:var(--font-editorial-body)] text-sm font-medium text-white transition-colors hover:bg-[#214C9B] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#214C9B] focus-visible:ring-offset-2"
            >
              {t("buyerSubmitButton")}
            </button>

            <div className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href={`/${locale}/properties`}
                className="inline-flex h-12 items-center border border-[#1A3A5C]/25 px-8 font-[family-name:var(--font-editorial-body)] text-sm font-medium text-[#1A3A5C] transition-colors hover:border-[#1A3A5C] hover:bg-[#1A3A5C]/[0.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#214C9B] focus-visible:ring-offset-2"
              >
                {t("buyerSuccessBrowseCta")}
              </Link>
              {generalInfo?.whatsapp && (
                <a
                  href={`https://wa.me/${generalInfo.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
                    t("buyerWhatsAppMessage")
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center gap-2 bg-[#C4A44A] px-8 font-[family-name:var(--font-editorial-body)] text-sm font-semibold text-[#1A3A5C] transition-colors hover:bg-[#B69544] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#214C9B] focus-visible:ring-offset-2"
                >
                  <IconBrandWhatsapp size={18} stroke={1.75} aria-hidden="true" />
                  {t("buyerSuccessWhatsAppCta")}
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Render step content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Full Name */}
            <div>
              <label htmlFor="full_name" className={labelClass}>
                {t("buyerFullName")} <span className={requiredMarkClass}>*</span>
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
              {errors.full_name && <p className={errorTextClass}>{errors.full_name}</p>}
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="email" className={labelClass}>
                  {t("buyerEmail")} <span className={requiredMarkClass}>*</span>
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
                {errors.email && <p className={errorTextClass}>{errors.email}</p>}
              </div>
              <div>
                <label htmlFor="phone" className={labelClass}>
                  {t("phone")} <span className={requiredMarkClass}>*</span>
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
                {errors.phone && <p className={errorTextClass}>{errors.phone}</p>}
              </div>
            </div>

            {/* WhatsApp Switch */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                role="switch"
                aria-checked={formData.phone_has_whatsapp}
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    phone_has_whatsapp: !prev.phone_has_whatsapp,
                  }))
                }
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#214C9B] focus:ring-offset-2 ${
                  formData.phone_has_whatsapp ? "bg-[#1A3A5C]" : "bg-slate-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    formData.phone_has_whatsapp ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
              <label className="flex items-center gap-1.5 font-[family-name:var(--font-editorial-body)] text-sm text-slate-700">
                <IconBrandWhatsapp size={18} stroke={1.75} className="text-[#1A3A5C]" />
                {t("buyerWhatsAppSwitch")}
              </label>
            </div>

            {/* How did you hear about us */}
            <div>
              <label htmlFor="how_did_you_hear" className={labelClass}>
                {t("buyerHowDidYouHear")}
              </label>
              <select
                id="how_did_you_hear"
                name="how_did_you_hear"
                value={formData.how_did_you_hear}
                onChange={handleChange}
                className={fieldClass()}
              >
                <option value="">{t("select")}</option>
                <option value="referral">{t("buyerHearReferral")}</option>
                <option value="google">{t("buyerHearGoogle")}</option>
                <option value="social_media">{t("buyerHearSocialMedia")}</option>
                <option value="ad">{t("buyerHearAd")}</option>
                <option value="other">{t("buyerHearOther")}</option>
              </select>
            </div>

            {/* Conditional Other input */}
            {formData.how_did_you_hear === "other" && (
              <div>
                <label htmlFor="how_did_you_hear_other" className={labelClass}>
                  {t("buyerSpecifyOther")} <span className={requiredMarkClass}>*</span>
                </label>
                <input
                  type="text"
                  id="how_did_you_hear_other"
                  name="how_did_you_hear_other"
                  value={formData.how_did_you_hear_other}
                  onChange={handleChange}
                  placeholder={t("buyerSpecifyOtherPlaceholder")}
                  className={fieldClass(!!errors.how_did_you_hear_other)}
                />
                {errors.how_did_you_hear_other && (
                  <p className={errorTextClass}>{errors.how_did_you_hear_other}</p>
                )}
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            {/* Buyer Profile */}
            <div>
              <label className={`${labelClass} mb-3`}>
                {t("buyerProfileQuestion")} <span className={requiredMarkClass}>*</span>
              </label>
              <div className="space-y-2">
                {[
                  { value: "single", label: t("buyerProfileSingle") },
                  { value: "family", label: t("buyerProfileFamily") },
                  { value: "investor", label: t("buyerProfileInvestor") },
                  { value: "company", label: t("buyerProfileCompany") },
                  { value: "other", label: t("buyerProfileOther") },
                ].map((option) => (
                  <label key={option.value} className={radioOptionClass}>
                    <input
                      type="radio"
                      name="buyer_profile"
                      value={option.value}
                      checked={formData.buyer_profile === option.value}
                      onChange={handleChange}
                      className={radioInputClass}
                    />
                    <span className={radioLabelClass}>{option.label}</span>
                  </label>
                ))}
              </div>
              {errors.buyer_profile && <p className={errorTextClass}>{errors.buyer_profile}</p>}
            </div>

            {/* Conditional Other input */}
            {formData.buyer_profile === "other" && (
              <div>
                <label htmlFor="buyer_profile_other" className={labelClass}>
                  {t("buyerSpecifyOther")} <span className={requiredMarkClass}>*</span>
                </label>
                <input
                  type="text"
                  id="buyer_profile_other"
                  name="buyer_profile_other"
                  value={formData.buyer_profile_other}
                  onChange={handleChange}
                  placeholder={t("buyerSpecifyOtherPlaceholder")}
                  className={fieldClass(!!errors.buyer_profile_other)}
                />
                {errors.buyer_profile_other && (
                  <p className={errorTextClass}>{errors.buyer_profile_other}</p>
                )}
              </div>
            )}

            {/* Buying As */}
            <div>
              <label className={`${labelClass} mb-3`}>
                {t("buyerBuyingAsQuestion")} <span className={requiredMarkClass}>*</span>
              </label>
              <div className="space-y-2">
                {[
                  { value: "individual", label: t("buyerBuyingAsIndividual") },
                  { value: "company", label: t("buyerBuyingAsCompany") },
                ].map((option) => (
                  <label key={option.value} className={radioOptionClass}>
                    <input
                      type="radio"
                      name="buying_as"
                      value={option.value}
                      checked={formData.buying_as === option.value}
                      onChange={handleChange}
                      className={radioInputClass}
                    />
                    <span className={radioLabelClass}>{option.label}</span>
                  </label>
                ))}
              </div>
              {errors.buying_as && <p className={errorTextClass}>{errors.buying_as}</p>}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {/* Property Types (Checkbox Group) */}
            <div>
              <label className={`${labelClass} mb-3`}>
                {t("buyerPropertyType")} <span className={requiredMarkClass}>*</span>
              </label>
              <div className="space-y-2">
                {[
                  { value: "residential", label: t("buyerPropertyTypeResidential") },
                  { value: "commercial", label: t("buyerPropertyTypeCommercial") },
                  { value: "industrial", label: t("buyerPropertyTypeIndustrial") },
                  { value: "mixed", label: t("buyerPropertyTypeMixed") },
                ].map((option) => (
                  <label key={option.value} className={radioOptionClass}>
                    <input
                      type="checkbox"
                      checked={formData.property_types.includes(option.value)}
                      onChange={() =>
                        handleCheckboxGroupChange("property_types", option.value)
                      }
                      className={checkboxInputClass}
                    />
                    <span className={radioLabelClass}>{option.label}</span>
                  </label>
                ))}
              </div>
              {errors.property_types && (
                <p className={errorTextClass}>{errors.property_types}</p>
              )}
            </div>

            {/* Process Stage */}
            <div>
              <label className={`${labelClass} mb-3`}>
                {t("buyerProcessStage")} <span className={requiredMarkClass}>*</span>
              </label>
              <div className="space-y-2">
                {[
                  { value: "exploring", label: t("buyerStageExploring") },
                  { value: "clear_idea", label: t("buyerStageClearIdea") },
                  { value: "visited", label: t("buyerStageVisited") },
                  { value: "decide_soon", label: t("buyerStageDecideSoon") },
                ].map((option) => (
                  <label key={option.value} className={radioOptionClass}>
                    <input
                      type="radio"
                      name="process_stage"
                      value={option.value}
                      checked={formData.process_stage === option.value}
                      onChange={handleChange}
                      className={radioInputClass}
                    />
                    <span className={radioLabelClass}>{option.label}</span>
                  </label>
                ))}
              </div>
              {errors.process_stage && <p className={errorTextClass}>{errors.process_stage}</p>}
            </div>

            {/* Priority Zones */}
            <div>
              <label htmlFor="priority_zones" className={labelClass}>
                {t("buyerPriorityZones")}
              </label>
              <p className={helperTextClass}>{t("buyerPriorityZonesHelper")}</p>
              <textarea
                id="priority_zones"
                name="priority_zones"
                rows={2}
                value={formData.priority_zones}
                onChange={handleChange}
                placeholder={t("buyerPriorityZonesPlaceholder")}
                className={textareaClass()}
              />
            </div>

            {/* Open to Other Zones */}
            <div>
              <label className={`${labelClass} mb-3`}>{t("buyerOpenToOtherZones")}</label>
              <div className="flex gap-6">
                {[
                  { value: "yes", label: t("yes") },
                  { value: "no", label: t("no") },
                ].map((option) => (
                  <label key={option.value} className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="open_to_other_zones"
                      value={option.value}
                      checked={formData.open_to_other_zones === option.value}
                      onChange={handleChange}
                      className={radioInputClass}
                    />
                    <span className={radioLabelClass}>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Budget & Payment Method */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="max_budget" className={labelClass}>
                  {t("buyerMaxBudget")} <span className={requiredMarkClass}>*</span>
                </label>
                <PriceInput
                  id="max_budget"
                  name="max_budget"
                  value={formData.max_budget}
                  onChange={(formatted) => {
                    setFormData((prev) => ({ ...prev, max_budget: formatted }));
                    if (errors.max_budget) {
                      setErrors((prev) => ({ ...prev, max_budget: undefined }));
                    }
                  }}
                  placeholder={t("buyerMaxBudgetPlaceholder")}
                  className={`${fieldClass(!!errors.max_budget)} pl-8 pr-4`}
                  symbolClassName="text-slate-500"
                  hasError={!!errors.max_budget}
                />
                {errors.max_budget && <p className={errorTextClass}>{errors.max_budget}</p>}
              </div>
              <div>
                <label className={labelClass}>
                  {t("buyerPaymentMethod")} <span className={requiredMarkClass}>*</span>
                </label>
                <select
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={handleChange}
                  className={fieldClass(!!errors.payment_method)}
                >
                  <option value="">{t("select")}</option>
                  <option value="cash">{t("buyerPaymentCash")}</option>
                  <option value="mortgage">{t("buyerPaymentMortgage")}</option>
                  <option value="mixed">{t("buyerPaymentMixed")}</option>
                  <option value="not_defined">{t("buyerPaymentNotDefined")}</option>
                </select>
                {errors.payment_method && (
                  <p className={errorTextClass}>{errors.payment_method}</p>
                )}
              </div>
            </div>

            {/* Credit Pre-Approval (conditional) */}
            {(formData.payment_method === "mortgage" ||
              formData.payment_method === "mixed") && (
              <div>
                <label className={`${labelClass} mb-3`}>
                  {t("buyerCreditPreApproval")} <span className={requiredMarkClass}>*</span>
                </label>
                <div className="flex gap-6">
                  {[
                    { value: "yes", label: t("yes") },
                    { value: "no", label: t("no") },
                  ].map((option) => (
                    <label key={option.value} className="flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name="credit_pre_approval"
                        value={option.value}
                        checked={formData.credit_pre_approval === option.value}
                        onChange={handleChange}
                        className={radioInputClass}
                      />
                      <span className={radioLabelClass}>{option.label}</span>
                    </label>
                  ))}
                </div>
                {errors.credit_pre_approval && (
                  <p className={errorTextClass}>{errors.credit_pre_approval}</p>
                )}
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            {/* Essential Criteria */}
            <div>
              <label htmlFor="essential_criteria" className={labelClass}>
                {t("buyerEssentialCriteria")} <span className={requiredMarkClass}>*</span>
              </label>
              <p className={helperTextClass}>{t("buyerEssentialCriteriaHelper")}</p>
              <textarea
                id="essential_criteria"
                name="essential_criteria"
                rows={3}
                value={formData.essential_criteria}
                onChange={handleChange}
                placeholder={t("buyerEssentialCriteriaPlaceholder")}
                className={textareaClass(!!errors.essential_criteria)}
              />
              {errors.essential_criteria && (
                <p className={errorTextClass}>{errors.essential_criteria}</p>
              )}
            </div>

            {/* Deal Breakers */}
            <div>
              <label htmlFor="deal_breakers" className={labelClass}>
                {t("buyerDealBreakers")}
              </label>
              <textarea
                id="deal_breakers"
                name="deal_breakers"
                rows={2}
                value={formData.deal_breakers}
                onChange={handleChange}
                placeholder={t("buyerDealBreakersPlaceholder")}
                className={textareaClass()}
              />
            </div>

            {/* Primary Goal */}
            <div>
              <label className={`${labelClass} mb-3`}>
                {t("buyerPrimaryGoal")} <span className={requiredMarkClass}>*</span>
              </label>
              <div className="space-y-2">
                {[
                  { value: "home", label: t("buyerGoalHome") },
                  { value: "investment", label: t("buyerGoalInvestment") },
                  { value: "cash_flow", label: t("buyerGoalCashFlow") },
                  { value: "business", label: t("buyerGoalBusiness") },
                  { value: "other", label: t("buyerGoalOther") },
                ].map((option) => (
                  <label key={option.value} className={radioOptionClass}>
                    <input
                      type="radio"
                      name="primary_goal"
                      value={option.value}
                      checked={formData.primary_goal === option.value}
                      onChange={handleChange}
                      className={radioInputClass}
                    />
                    <span className={radioLabelClass}>{option.label}</span>
                  </label>
                ))}
              </div>
              {errors.primary_goal && <p className={errorTextClass}>{errors.primary_goal}</p>}
            </div>

            {/* Conditional Other input */}
            {formData.primary_goal === "other" && (
              <div>
                <label htmlFor="primary_goal_other" className={labelClass}>
                  {t("buyerSpecifyOther")} <span className={requiredMarkClass}>*</span>
                </label>
                <input
                  type="text"
                  id="primary_goal_other"
                  name="primary_goal_other"
                  value={formData.primary_goal_other}
                  onChange={handleChange}
                  placeholder={t("buyerSpecifyOtherPlaceholder")}
                  className={fieldClass(!!errors.primary_goal_other)}
                />
                {errors.primary_goal_other && (
                  <p className={errorTextClass}>{errors.primary_goal_other}</p>
                )}
              </div>
            )}

            {/* Timeframe */}
            <div>
              <label className={`${labelClass} mb-3`}>
                {t("buyerDecisionTimeframe")} <span className={requiredMarkClass}>*</span>
              </label>
              <div className="space-y-2">
                {[
                  { value: "0-3", label: t("buyerTimeframe0to3") },
                  { value: "3-6", label: t("buyerTimeframe3to6") },
                  { value: "6-12", label: t("buyerTimeframe6to12") },
                ].map((option) => (
                  <label key={option.value} className={radioOptionClass}>
                    <input
                      type="radio"
                      name="decision_timeframe"
                      value={option.value}
                      checked={formData.decision_timeframe === option.value}
                      onChange={handleChange}
                      className={radioInputClass}
                    />
                    <span className={radioLabelClass}>{option.label}</span>
                  </label>
                ))}
              </div>
              {errors.decision_timeframe && (
                <p className={errorTextClass}>{errors.decision_timeframe}</p>
              )}
            </div>

            {/* Prior Experience */}
            <div>
              <label className={`${labelClass} mb-3`}>{t("buyerPriorExperience")}</label>
              <div className="flex gap-6">
                {[
                  { value: "yes", label: t("yes") },
                  { value: "no", label: t("no") },
                ].map((option) => (
                  <label key={option.value} className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="prior_experience"
                      value={option.value}
                      checked={formData.prior_experience === option.value}
                      onChange={handleChange}
                      className={radioInputClass}
                    />
                    <span className={radioLabelClass}>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Prior Experience Frustration (conditional) */}
            {formData.prior_experience === "yes" && (
              <div>
                <label htmlFor="prior_experience_frustration" className={labelClass}>
                  {t("buyerFrustration")} <span className={requiredMarkClass}>*</span>
                </label>
                <textarea
                  id="prior_experience_frustration"
                  name="prior_experience_frustration"
                  rows={2}
                  value={formData.prior_experience_frustration}
                  onChange={handleChange}
                  placeholder={t("buyerFrustrationPlaceholder")}
                  className={textareaClass(!!errors.prior_experience_frustration)}
                />
                {errors.prior_experience_frustration && (
                  <p className={errorTextClass}>{errors.prior_experience_frustration}</p>
                )}
              </div>
            )}

            {/* Consultation Expectations */}
            <div>
              <label htmlFor="consultation_expectations" className={labelClass}>
                {t("buyerConsultationExpectations")}
              </label>
              <p className={helperTextClass}>{t("buyerConsultationExpectationsHelper")}</p>
              <textarea
                id="consultation_expectations"
                name="consultation_expectations"
                rows={2}
                value={formData.consultation_expectations}
                onChange={handleChange}
                placeholder={t("buyerConsultationExpectationsPlaceholder")}
                className={textareaClass()}
              />
            </div>

            {/* Commitment Level */}
            <div>
              <label className={`${labelClass} mb-3`}>
                {t("buyerCommitmentQuestion")} <span className={requiredMarkClass}>*</span>
              </label>
              <div className="space-y-2">
                {[
                  { value: "yes", label: t("buyerCommitmentYes") },
                  { value: "evaluating", label: t("buyerCommitmentEvaluating") },
                  { value: "info_only", label: t("buyerCommitmentInfoOnly") },
                ].map((option) => (
                  <label key={option.value} className={radioOptionClass}>
                    <input
                      type="radio"
                      name="commitment_level"
                      value={option.value}
                      checked={formData.commitment_level === option.value}
                      onChange={handleChange}
                      className={radioInputClass}
                    />
                    <span className={radioLabelClass}>{option.label}</span>
                  </label>
                ))}
              </div>
              {errors.commitment_level && (
                <p className={errorTextClass}>{errors.commitment_level}</p>
              )}
            </div>

            {/* Consent Marketing */}
            <div className="flex items-start">
              <input
                type="checkbox"
                id="consent_marketing"
                name="consent_marketing"
                checked={formData.consent_marketing}
                onChange={handleChange}
                className={`mt-1 ${checkboxInputClass}`}
              />
              <label
                htmlFor="consent_marketing"
                className="ml-3 font-[family-name:var(--font-editorial-body)] text-sm text-slate-600"
              >
                {t("consentMarketing")}
              </label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <BuyerHero />
      <BuyerAdvantages />
      <ProofStrip />

      <section id="buyer-consultation-form" className="bg-[#EEF1F5] py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          {/* Editorial section header, aligned with the card */}
          <div className="max-w-2xl">
            <h2 className="font-[family-name:var(--font-editorial-display)] text-4xl font-semibold tracking-[-0.01em] text-[#1A3A5C] md:text-5xl">
              {t("buyerFormSectionTitle")}
            </h2>
            <p className="mt-5 font-[family-name:var(--font-editorial-body)] text-lg leading-relaxed text-slate-600">
              {t("buyerFormSectionText")}
            </p>
          </div>

          {/* The consultation card: advisor rail + client side */}
          <div className="mt-12 grid overflow-hidden border-t-2 border-[#C4A44A] shadow-[0_32px_80px_-40px_rgba(26,58,92,0.4)] lg:grid-cols-[320px_1fr]">
            <BuyerStepper
              currentStep={currentStep}
              totalSteps={TOTAL_STEPS}
              labels={stepperLabels}
            />

            <div className="bg-white px-6 py-10 md:px-10 lg:px-14 lg:py-12">
              {/* Step Title & Description */}
              <div className="border-b border-slate-200 pb-6">
                <p className="font-[family-name:var(--font-editorial-body)] text-xs font-medium uppercase tracking-[0.2em] text-[#214C9B]">
                  {t("buyerStepPrefix")} {currentStep} {t("buyerStepConnector")} {TOTAL_STEPS}
                </p>
                <h3
                  ref={stepHeadingRef}
                  tabIndex={-1}
                  className="mt-3 font-[family-name:var(--font-editorial-display)] text-2xl font-semibold text-[#1A3A5C] focus:outline-none md:text-[1.7rem]"
                >
                  {stepTitles[currentStep - 1].title}
                </h3>
                <p className="mt-2 font-[family-name:var(--font-editorial-body)] text-sm leading-relaxed text-slate-500">
                  {stepTitles[currentStep - 1].description}
                </p>
              </div>

              {errors.general && (
                <div
                  role="alert"
                  className="mt-6 border-l-2 border-red-500 bg-red-50 p-4 font-[family-name:var(--font-editorial-body)] text-sm text-red-700"
                >
                  {errors.general}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mt-8 overflow-hidden">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={currentStep}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                      {renderStepContent()}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Navigation Buttons */}
                <div className="mt-10 flex justify-between gap-4 border-t border-slate-200 pt-6">
                  {currentStep > 1 ? (
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex h-12 items-center gap-2 border border-[#1A3A5C]/25 px-6 font-[family-name:var(--font-editorial-body)] text-sm font-medium text-[#1A3A5C] transition-colors hover:border-[#1A3A5C] hover:bg-[#1A3A5C]/[0.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#214C9B] focus-visible:ring-offset-2"
                    >
                      <IconChevronLeft size={16} stroke={2} aria-hidden="true" />
                      {t("buyerBack")}
                    </button>
                  ) : (
                    <div />
                  )}

                  {currentStep < TOTAL_STEPS ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="flex h-12 items-center gap-2 bg-[#1A3A5C] px-7 font-[family-name:var(--font-editorial-body)] text-sm font-medium text-white transition-colors hover:bg-[#214C9B] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#214C9B] focus-visible:ring-offset-2"
                    >
                      {t("buyerNext")}
                      <IconChevronRight size={16} stroke={2} aria-hidden="true" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={createLead.isPending}
                      className="flex h-12 items-center gap-2 bg-[#C4A44A] px-7 font-[family-name:var(--font-editorial-body)] text-sm font-semibold text-[#1A3A5C] transition-colors hover:bg-[#B69544] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#214C9B] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
                    >
                      {createLead.isPending ? t("submitting") : t("buyerSubmitButton")}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}
