"use client";

import { useState } from "react";
import { useT } from "@properlia/shared/components/TranslationProvider";
import { PriceInput } from "@properlia/shared/components";
import { parsePriceInput } from "@properlia/shared";
import { useCreatePublicLead } from "@/src/services/leads/mutations";
import { CreatePublicLeadDto } from "@properlia/shared/services/leads/api";
import {
  Shield,
  TrendingUp,
  Search,
  Handshake,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

// Step configuration
const TOTAL_STEPS = 4;

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
  const createLead = useCreatePublicLead();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormData | "general", string>>
  >({});
  const [isSuccess, setIsSuccess] = useState(false);

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
      setFormData(initialFormData);
      setCurrentStep(1);
    } catch (error: any) {
      setErrors({
        general: error?.errors?.join(", ") || t("formError"),
      });
    }
  };

  const benefits = [
    {
      icon: Shield,
      title: t("buyerBenefit1Title"),
      description: t("buyerBenefit1Description"),
    },
    {
      icon: TrendingUp,
      title: t("buyerBenefit2Title"),
      description: t("buyerBenefit2Description"),
    },
    {
      icon: Search,
      title: t("buyerBenefit3Title"),
      description: t("buyerBenefit3Description"),
    },
    {
      icon: Handshake,
      title: t("buyerBenefit4Title"),
      description: t("buyerBenefit4Description"),
    },
  ];

  const stepTitles = [
    { title: t("buyerStep1Title"), description: t("buyerStep1Description") },
    { title: t("buyerStep2Title"), description: t("buyerStep2Description") },
    { title: t("buyerStep3Title"), description: t("buyerStep3Description") },
    { title: t("buyerStep4Title"), description: t("buyerStep4Description") },
  ];

  if (isSuccess) {
    return (
      <section className="py-16 bg-gray-50 min-h-screen">
        <div className="max-w-2xl mx-auto px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-4">
              {t("formSuccess")}
            </h2>
            <button
              onClick={() => setIsSuccess(false)}
              className="mt-6 px-6 py-3 bg-stone-900 text-white hover:bg-stone-800 transition-colors"
            >
              {t("buyerSubmitButton")}
            </button>
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
              <label
                htmlFor="full_name"
                className="block text-sm font-medium text-stone-700 mb-1"
              >
                {t("buyerFullName")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder={t("enterFullName")}
                className={`w-full px-4 py-3 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-stone-900 ${
                  errors.full_name ? "border-red-500" : "border-stone-200"
                }`}
              />
              {errors.full_name && (
                <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>
              )}
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-stone-700 mb-1"
                >
                  {t("buyerEmail")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t("enterEmail")}
                  className={`w-full px-4 py-3 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-stone-900 ${
                    errors.email ? "border-red-500" : "border-stone-200"
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-stone-700 mb-1"
                >
                  {t("phone")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder={t("enterPhone")}
                  className={`w-full px-4 py-3 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-stone-900 ${
                    errors.phone ? "border-red-500" : "border-stone-200"
                  }`}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
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
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-2 ${
                  formData.phone_has_whatsapp ? "bg-stone-900" : "bg-stone-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    formData.phone_has_whatsapp
                      ? "translate-x-5"
                      : "translate-x-0"
                  }`}
                />
              </button>
              <label className="text-sm text-stone-700">
                {t("buyerWhatsAppSwitch")}
              </label>
            </div>

            {/* How did you hear about us */}
            <div>
              <label
                htmlFor="how_did_you_hear"
                className="block text-sm font-medium text-stone-700 mb-1"
              >
                {t("buyerHowDidYouHear")}
              </label>
              <select
                id="how_did_you_hear"
                name="how_did_you_hear"
                value={formData.how_did_you_hear}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-stone-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-stone-900"
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
                <label
                  htmlFor="how_did_you_hear_other"
                  className="block text-sm font-medium text-stone-700 mb-1"
                >
                  {t("buyerSpecifyOther")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="how_did_you_hear_other"
                  name="how_did_you_hear_other"
                  value={formData.how_did_you_hear_other}
                  onChange={handleChange}
                  placeholder={t("buyerSpecifyOtherPlaceholder")}
                  className={`w-full px-4 py-3 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-stone-900 ${
                    errors.how_did_you_hear_other
                      ? "border-red-500"
                      : "border-stone-200"
                  }`}
                />
                {errors.how_did_you_hear_other && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.how_did_you_hear_other}
                  </p>
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
              <label className="block text-sm font-medium text-stone-700 mb-3">
                {t("buyerProfileQuestion")} <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {[
                  { value: "single", label: t("buyerProfileSingle") },
                  { value: "family", label: t("buyerProfileFamily") },
                  { value: "investor", label: t("buyerProfileInvestor") },
                  { value: "company", label: t("buyerProfileCompany") },
                  { value: "other", label: t("buyerProfileOther") },
                ].map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="buyer_profile"
                      value={option.value}
                      checked={formData.buyer_profile === option.value}
                      onChange={handleChange}
                      className="h-4 w-4 text-stone-900 focus:ring-stone-900 border-stone-300"
                    />
                    <span className="text-sm text-stone-700">{option.label}</span>
                  </label>
                ))}
              </div>
              {errors.buyer_profile && (
                <p className="mt-1 text-sm text-red-600">{errors.buyer_profile}</p>
              )}
            </div>

            {/* Conditional Other input */}
            {formData.buyer_profile === "other" && (
              <div>
                <label
                  htmlFor="buyer_profile_other"
                  className="block text-sm font-medium text-stone-700 mb-1"
                >
                  {t("buyerSpecifyOther")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="buyer_profile_other"
                  name="buyer_profile_other"
                  value={formData.buyer_profile_other}
                  onChange={handleChange}
                  placeholder={t("buyerSpecifyOtherPlaceholder")}
                  className={`w-full px-4 py-3 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-stone-900 ${
                    errors.buyer_profile_other
                      ? "border-red-500"
                      : "border-stone-200"
                  }`}
                />
                {errors.buyer_profile_other && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.buyer_profile_other}
                  </p>
                )}
              </div>
            )}

            {/* Buying As */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-3">
                {t("buyerBuyingAsQuestion")} <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {[
                  { value: "individual", label: t("buyerBuyingAsIndividual") },
                  { value: "company", label: t("buyerBuyingAsCompany") },
                ].map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="buying_as"
                      value={option.value}
                      checked={formData.buying_as === option.value}
                      onChange={handleChange}
                      className="h-4 w-4 text-stone-900 focus:ring-stone-900 border-stone-300"
                    />
                    <span className="text-sm text-stone-700">{option.label}</span>
                  </label>
                ))}
              </div>
              {errors.buying_as && (
                <p className="mt-1 text-sm text-red-600">{errors.buying_as}</p>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {/* Property Types (Checkbox Group) */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-3">
                {t("buyerPropertyType")} <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {[
                  { value: "residential", label: t("buyerPropertyTypeResidential") },
                  { value: "commercial", label: t("buyerPropertyTypeCommercial") },
                  { value: "industrial", label: t("buyerPropertyTypeIndustrial") },
                  { value: "mixed", label: t("buyerPropertyTypeMixed") },
                ].map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.property_types.includes(option.value)}
                      onChange={() =>
                        handleCheckboxGroupChange("property_types", option.value)
                      }
                      className="h-4 w-4 text-stone-900 focus:ring-stone-900 border-stone-300 rounded"
                    />
                    <span className="text-sm text-stone-700">{option.label}</span>
                  </label>
                ))}
              </div>
              {errors.property_types && (
                <p className="mt-1 text-sm text-red-600">{errors.property_types}</p>
              )}
            </div>

            {/* Process Stage */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-3">
                {t("buyerProcessStage")} <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {[
                  { value: "exploring", label: t("buyerStageExploring") },
                  { value: "clear_idea", label: t("buyerStageClearIdea") },
                  { value: "visited", label: t("buyerStageVisited") },
                  { value: "decide_soon", label: t("buyerStageDecideSoon") },
                ].map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="process_stage"
                      value={option.value}
                      checked={formData.process_stage === option.value}
                      onChange={handleChange}
                      className="h-4 w-4 text-stone-900 focus:ring-stone-900 border-stone-300"
                    />
                    <span className="text-sm text-stone-700">{option.label}</span>
                  </label>
                ))}
              </div>
              {errors.process_stage && (
                <p className="mt-1 text-sm text-red-600">{errors.process_stage}</p>
              )}
            </div>

            {/* Priority Zones */}
            <div>
              <label
                htmlFor="priority_zones"
                className="block text-sm font-medium text-stone-700 mb-1"
              >
                {t("buyerPriorityZones")}
              </label>
              <p className="text-xs text-stone-400 mb-2">
                {t("buyerPriorityZonesHelper")}
              </p>
              <textarea
                id="priority_zones"
                name="priority_zones"
                rows={2}
                value={formData.priority_zones}
                onChange={handleChange}
                placeholder={t("buyerPriorityZonesPlaceholder")}
                className="w-full px-4 py-3 border border-stone-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-stone-900 resize-none"
              />
            </div>

            {/* Open to Other Zones */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-3">
                {t("buyerOpenToOtherZones")}
              </label>
              <div className="flex gap-6">
                {[
                  { value: "yes", label: t("yes") },
                  { value: "no", label: t("no") },
                ].map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="open_to_other_zones"
                      value={option.value}
                      checked={formData.open_to_other_zones === option.value}
                      onChange={handleChange}
                      className="h-4 w-4 text-stone-900 focus:ring-stone-900 border-stone-300"
                    />
                    <span className="text-sm text-stone-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Budget & Payment Method */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="max_budget"
                  className="block text-sm font-medium text-stone-700 mb-1"
                >
                  {t("buyerMaxBudget")} <span className="text-red-500">*</span>
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
                  className={`w-full pl-8 pr-4 py-3 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-stone-900 ${
                    errors.max_budget ? "border-red-500" : "border-stone-200"
                  }`}
                  symbolClassName="text-stone-500"
                  hasError={!!errors.max_budget}
                />
                {errors.max_budget && (
                  <p className="mt-1 text-sm text-red-600">{errors.max_budget}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  {t("buyerPaymentMethod")} <span className="text-red-500">*</span>
                </label>
                <select
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-stone-900 ${
                    errors.payment_method ? "border-red-500" : "border-stone-200"
                  }`}
                >
                  <option value="">{t("select")}</option>
                  <option value="cash">{t("buyerPaymentCash")}</option>
                  <option value="mortgage">{t("buyerPaymentMortgage")}</option>
                  <option value="mixed">{t("buyerPaymentMixed")}</option>
                  <option value="not_defined">{t("buyerPaymentNotDefined")}</option>
                </select>
                {errors.payment_method && (
                  <p className="mt-1 text-sm text-red-600">{errors.payment_method}</p>
                )}
              </div>
            </div>

            {/* Credit Pre-Approval (conditional) */}
            {(formData.payment_method === "mortgage" ||
              formData.payment_method === "mixed") && (
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-3">
                  {t("buyerCreditPreApproval")} <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-6">
                  {[
                    { value: "yes", label: t("yes") },
                    { value: "no", label: t("no") },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="credit_pre_approval"
                        value={option.value}
                        checked={formData.credit_pre_approval === option.value}
                        onChange={handleChange}
                        className="h-4 w-4 text-stone-900 focus:ring-stone-900 border-stone-300"
                      />
                      <span className="text-sm text-stone-700">{option.label}</span>
                    </label>
                  ))}
                </div>
                {errors.credit_pre_approval && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.credit_pre_approval}
                  </p>
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
              <label
                htmlFor="essential_criteria"
                className="block text-sm font-medium text-stone-700 mb-1"
              >
                {t("buyerEssentialCriteria")} <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-stone-400 mb-2">
                {t("buyerEssentialCriteriaHelper")}
              </p>
              <textarea
                id="essential_criteria"
                name="essential_criteria"
                rows={3}
                value={formData.essential_criteria}
                onChange={handleChange}
                placeholder={t("buyerEssentialCriteriaPlaceholder")}
                className={`w-full px-4 py-3 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-stone-900 resize-none ${
                  errors.essential_criteria ? "border-red-500" : "border-stone-200"
                }`}
              />
              {errors.essential_criteria && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.essential_criteria}
                </p>
              )}
            </div>

            {/* Deal Breakers */}
            <div>
              <label
                htmlFor="deal_breakers"
                className="block text-sm font-medium text-stone-700 mb-1"
              >
                {t("buyerDealBreakers")}
              </label>
              <textarea
                id="deal_breakers"
                name="deal_breakers"
                rows={2}
                value={formData.deal_breakers}
                onChange={handleChange}
                placeholder={t("buyerDealBreakersPlaceholder")}
                className="w-full px-4 py-3 border border-stone-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-stone-900 resize-none"
              />
            </div>

            {/* Primary Goal */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-3">
                {t("buyerPrimaryGoal")} <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {[
                  { value: "home", label: t("buyerGoalHome") },
                  { value: "investment", label: t("buyerGoalInvestment") },
                  { value: "cash_flow", label: t("buyerGoalCashFlow") },
                  { value: "business", label: t("buyerGoalBusiness") },
                  { value: "other", label: t("buyerGoalOther") },
                ].map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="primary_goal"
                      value={option.value}
                      checked={formData.primary_goal === option.value}
                      onChange={handleChange}
                      className="h-4 w-4 text-stone-900 focus:ring-stone-900 border-stone-300"
                    />
                    <span className="text-sm text-stone-700">{option.label}</span>
                  </label>
                ))}
              </div>
              {errors.primary_goal && (
                <p className="mt-1 text-sm text-red-600">{errors.primary_goal}</p>
              )}
            </div>

            {/* Conditional Other input */}
            {formData.primary_goal === "other" && (
              <div>
                <label
                  htmlFor="primary_goal_other"
                  className="block text-sm font-medium text-stone-700 mb-1"
                >
                  {t("buyerSpecifyOther")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="primary_goal_other"
                  name="primary_goal_other"
                  value={formData.primary_goal_other}
                  onChange={handleChange}
                  placeholder={t("buyerSpecifyOtherPlaceholder")}
                  className={`w-full px-4 py-3 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-stone-900 ${
                    errors.primary_goal_other
                      ? "border-red-500"
                      : "border-stone-200"
                  }`}
                />
                {errors.primary_goal_other && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.primary_goal_other}
                  </p>
                )}
              </div>
            )}

            {/* Timeframe */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-3">
                {t("buyerDecisionTimeframe")} <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {[
                  { value: "0-3", label: t("buyerTimeframe0to3") },
                  { value: "3-6", label: t("buyerTimeframe3to6") },
                  { value: "6-12", label: t("buyerTimeframe6to12") },
                ].map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="decision_timeframe"
                      value={option.value}
                      checked={formData.decision_timeframe === option.value}
                      onChange={handleChange}
                      className="h-4 w-4 text-stone-900 focus:ring-stone-900 border-stone-300"
                    />
                    <span className="text-sm text-stone-700">{option.label}</span>
                  </label>
                ))}
              </div>
              {errors.decision_timeframe && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.decision_timeframe}
                </p>
              )}
            </div>

            {/* Prior Experience */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-3">
                {t("buyerPriorExperience")}
              </label>
              <div className="flex gap-6">
                {[
                  { value: "yes", label: t("yes") },
                  { value: "no", label: t("no") },
                ].map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="prior_experience"
                      value={option.value}
                      checked={formData.prior_experience === option.value}
                      onChange={handleChange}
                      className="h-4 w-4 text-stone-900 focus:ring-stone-900 border-stone-300"
                    />
                    <span className="text-sm text-stone-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Prior Experience Frustration (conditional) */}
            {formData.prior_experience === "yes" && (
              <div>
                <label
                  htmlFor="prior_experience_frustration"
                  className="block text-sm font-medium text-stone-700 mb-1"
                >
                  {t("buyerFrustration")} <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="prior_experience_frustration"
                  name="prior_experience_frustration"
                  rows={2}
                  value={formData.prior_experience_frustration}
                  onChange={handleChange}
                  placeholder={t("buyerFrustrationPlaceholder")}
                  className={`w-full px-4 py-3 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-stone-900 resize-none ${
                    errors.prior_experience_frustration
                      ? "border-red-500"
                      : "border-stone-200"
                  }`}
                />
                {errors.prior_experience_frustration && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.prior_experience_frustration}
                  </p>
                )}
              </div>
            )}

            {/* Consultation Expectations */}
            <div>
              <label
                htmlFor="consultation_expectations"
                className="block text-sm font-medium text-stone-700 mb-1"
              >
                {t("buyerConsultationExpectations")}
              </label>
              <p className="text-xs text-stone-400 mb-2">
                {t("buyerConsultationExpectationsHelper")}
              </p>
              <textarea
                id="consultation_expectations"
                name="consultation_expectations"
                rows={2}
                value={formData.consultation_expectations}
                onChange={handleChange}
                placeholder={t("buyerConsultationExpectationsPlaceholder")}
                className="w-full px-4 py-3 border border-stone-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-stone-900 resize-none"
              />
            </div>

            {/* Commitment Level */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-3">
                {t("buyerCommitmentQuestion")} <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {[
                  { value: "yes", label: t("buyerCommitmentYes") },
                  { value: "evaluating", label: t("buyerCommitmentEvaluating") },
                  { value: "info_only", label: t("buyerCommitmentInfoOnly") },
                ].map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="commitment_level"
                      value={option.value}
                      checked={formData.commitment_level === option.value}
                      onChange={handleChange}
                      className="h-4 w-4 text-stone-900 focus:ring-stone-900 border-stone-300"
                    />
                    <span className="text-sm text-stone-700">{option.label}</span>
                  </label>
                ))}
              </div>
              {errors.commitment_level && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.commitment_level}
                </p>
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
                className="mt-1 h-4 w-4 text-stone-900 focus:ring-stone-900 border-stone-300 rounded"
              />
              <label
                htmlFor="consent_marketing"
                className="ml-3 text-sm text-stone-600"
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
    <section className="py-16 bg-gray-50 min-h-screen">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-stone-900 mb-4">
            {t("buyerPageTitle")}
          </h1>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto">
            {t("buyerPageSubtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Form */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            {/* Step Progress Indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map(
                  (step) => (
                    <div key={step} className="flex items-center">
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                          step === currentStep
                            ? "bg-stone-900 text-white"
                            : step < currentStep
                            ? "bg-stone-900 text-white"
                            : "bg-stone-200 text-stone-500"
                        }`}
                      >
                        {step < currentStep ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          step
                        )}
                      </div>
                      {step < TOTAL_STEPS && (
                        <div
                          className={`w-full h-1 mx-2 rounded ${
                            step < currentStep ? "bg-stone-900" : "bg-stone-200"
                          }`}
                          style={{ width: "40px" }}
                        />
                      )}
                    </div>
                  )
                )}
              </div>

              {/* Step Title & Description */}
              <div className="text-center">
                <h2 className="text-xl font-semibold text-stone-900 mb-1">
                  {stepTitles[currentStep - 1].title}
                </h2>
                <p className="text-sm text-stone-500">
                  {stepTitles[currentStep - 1].description}
                </p>
              </div>
            </div>

            {errors.general && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-700">
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {renderStepContent()}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t border-stone-200">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex items-center gap-2 px-6 py-3 border border-stone-300 text-stone-700 hover:bg-stone-50 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    {t("buyerBack")}
                  </button>
                ) : (
                  <div />
                )}

                {currentStep < TOTAL_STEPS ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex items-center gap-2 px-6 py-3 bg-stone-900 text-white hover:bg-stone-800 transition-colors"
                  >
                    {t("buyerNext")}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={createLead.isPending}
                    className="flex items-center gap-2 px-6 py-3 bg-stone-900 text-white hover:bg-stone-800 transition-colors disabled:bg-stone-400 disabled:cursor-not-allowed"
                  >
                    {createLead.isPending ? t("submitting") : t("buyerSubmitButton")}
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Benefits Section */}
          <div>
            <h2 className="text-2xl font-semibold text-stone-900 mb-8">
              {t("whyChooseUs")}
            </h2>
            <div className="space-y-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-stone-100 rounded-lg flex items-center justify-center">
                    <benefit.icon className="w-6 h-6 text-stone-700" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-stone-900 mb-1">
                      {benefit.title}
                    </h3>
                    <p className="text-stone-600">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
