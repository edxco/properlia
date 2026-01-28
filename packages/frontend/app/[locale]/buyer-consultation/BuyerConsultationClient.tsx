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
} from "lucide-react";

interface FormData {
  full_name: string;
  email: string;
  phone: string;
  property_type: string;
  purchase_goal: string;
  max_budget: string;
  payment_method: string;
  essential_criteria: string;
  decision_timeframe: string;
  alignment_answer: string;
  neighborhood: string;
  city: string;
  state: string;
  consent_marketing: boolean;
}

const initialFormData: FormData = {
  full_name: "",
  phone: "",
  email: "",
  property_type: "",
  purchase_goal: "",
  max_budget: "",
  payment_method: "",
  essential_criteria: "",
  decision_timeframe: "",
  alignment_answer: "",
  neighborhood: "",
  city: "",
  state: "",
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

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData | "general", string>> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = t("requiredField");
    }
    if (!formData.email.trim()) {
      newErrors.email = t("requiredField");
    }
    if (!formData.property_type) {
      newErrors.property_type = t("requiredField");
    }
    if (!formData.purchase_goal) {
      newErrors.purchase_goal = t("requiredField");
    }
    if (!formData.max_budget.trim()) {
      newErrors.max_budget = t("requiredField");
    }
    if (!formData.payment_method.trim()) {
      newErrors.payment_method = t("requiredField");
    }
    if (!formData.essential_criteria.trim()) {
      newErrors.essential_criteria = t("requiredField");
    }
    if (!formData.decision_timeframe) {
      newErrors.decision_timeframe = t("requiredField");
    }
    if (!formData.alignment_answer) {
      newErrors.alignment_answer = t("requiredField");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    // Parse max_budget using shared utility
    const parsedBudget = parsePriceInput(formData.max_budget);

    const leadData: CreatePublicLeadDto = {
      full_name: formData.full_name,
      email: formData.email,
      phone: formData.phone,
      source: "buyer_form",
      interest_operation: "buy",
      consent_marketing: formData.consent_marketing,
      max_budget: isNaN(parsedBudget) ? undefined : parsedBudget,
      desired_date: getDesiredDate(formData.decision_timeframe),
      neighborhood: formData.neighborhood.trim() || undefined,
      city: formData.city.trim() || undefined,
      state: formData.state.trim() || undefined,
      interest_property_type: formData.property_type,
      source_detail: {
        purchase_goal: formData.purchase_goal,
        payment_method: formData.payment_method,
        essential_criteria: formData.essential_criteria,
        decision_timeframe: formData.decision_timeframe,
        alignment_answer: formData.alignment_answer,
      },
      notes: `Purchase Goal: ${formData.purchase_goal}\nPayment Method: ${formData.payment_method}\nEssential Criteria: ${formData.essential_criteria}\nDecision Timeframe: ${formData.decision_timeframe}\nAlignment: ${formData.alignment_answer}`,
    };

    try {
      await createLead.mutateAsync(leadData);
      setIsSuccess(true);
      setFormData(initialFormData);
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

  return (
    <section className="py-16 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
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
            <h2 className="text-2xl font-semibold text-stone-900 mb-6">
              {t("buyerFormTitle")}
            </h2>

            {errors.general && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-700">
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
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
                  value={formData.full_name || ""}
                  onChange={handleChange}
                  placeholder={t("enterFullName")}
                  className={`w-full px-4 py-3 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-stone-900 ${
                    errors.full_name ? "border-red-500" : "border-stone-200"
                  }`}
                />
                {errors.full_name && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.full_name}
                  </p>
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
                    value={formData.email || ""}
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
                    {t("phone")}
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone || ""}
                    onChange={handleChange}
                    placeholder={t("enterPhone")}
                    className="w-full px-4 py-3 border border-stone-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                </div>
              </div>

              {/* Property Type */}
              <div>
                <label
                  htmlFor="property_type"
                  className="block text-sm font-medium text-stone-700 mb-1"
                >
                  {t("buyerPropertyType")} <span className="text-red-500">*</span>
                </label>
                <select
                  id="property_type"
                  name="property_type"
                  value={formData.property_type || ""}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-stone-900 ${
                    errors.property_type ? "border-red-500" : "border-stone-200"
                  }`}
                >
                  <option value="">{t("select")}</option>
                  <option value="residential">
                    {t("buyerPropertyTypeResidential")}
                  </option>
                  <option value="commercial">
                    {t("buyerPropertyTypeCommercial")}
                  </option>
                  <option value="industrial">
                    {t("buyerPropertyTypeIndustrial")}
                  </option>
                </select>
                {errors.property_type && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.property_type}
                  </p>
                )}
              </div>

              {/* Purchase Goal */}
              <div>
                <label
                  htmlFor="purchase_goal"
                  className="block text-sm font-medium text-stone-700 mb-1"
                >
                  {t("buyerPurchaseGoal")} <span className="text-red-500">*</span>
                </label>
                <select
                  id="purchase_goal"
                  name="purchase_goal"
                  value={formData.purchase_goal || ""}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-stone-900 ${
                    errors.purchase_goal ? "border-red-500" : "border-stone-200"
                  }`}
                >
                  <option value="">{t("select")}</option>
                  <option value="living">{t("buyerGoalLiving")}</option>
                  <option value="investment">{t("buyerGoalInvestment")}</option>
                  <option value="cash_flow">{t("buyerGoalCashFlow")}</option>
                  <option value="business">{t("buyerGoalBusiness")}</option>
                </select>
                {errors.purchase_goal && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.purchase_goal}
                  </p>
                )}
              </div>

              {/* Max Budget & Payment Method */}
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
                    value={formData.max_budget || ""}
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
                    <p className="mt-1 text-sm text-red-600">
                      {errors.max_budget}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="payment_method"
                    className="block text-sm font-medium text-stone-700 mb-1"
                  >
                    {t("buyerPaymentMethod")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="payment_method"
                    name="payment_method"
                    value={formData.payment_method || ""}
                    onChange={handleChange}
                    placeholder={t("buyerPaymentMethodPlaceholder")}
                    className={`w-full px-4 py-3 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-stone-900 ${
                      errors.payment_method ? "border-red-500" : "border-stone-200"
                    }`}
                  />
                  {errors.payment_method && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.payment_method}
                    </p>
                  )}
                </div>
              </div>

              {/* Location */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label
                    htmlFor="neighborhood"
                    className="block text-sm font-medium text-stone-700 mb-1"
                  >
                    {t("neighborhood")}
                  </label>
                  <input
                    type="text"
                    id="neighborhood"
                    name="neighborhood"
                    value={formData.neighborhood || ""}
                    onChange={handleChange}
                    placeholder={t("neighborhood")}
                    className="w-full px-4 py-3 border border-stone-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                </div>
                <div>
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium text-stone-700 mb-1"
                  >
                    {t("city")}
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city || ""}
                    onChange={handleChange}
                    placeholder={t("city")}
                    className="w-full px-4 py-3 border border-stone-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                </div>
                <div>
                  <label
                    htmlFor="state"
                    className="block text-sm font-medium text-stone-700 mb-1"
                  >
                    {t("state")}
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state || ""}
                    onChange={handleChange}
                    placeholder={t("state")}
                    className="w-full px-4 py-3 border border-stone-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                </div>
              </div>

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
                  rows={4}
                  value={formData.essential_criteria || ""}
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

              {/* Decision Timeframe */}
              <div>
                <label
                  htmlFor="decision_timeframe"
                  className="block text-sm font-medium text-stone-700 mb-1"
                >
                  {t("buyerDecisionTimeframe")} <span className="text-red-500">*</span>
                </label>
                <select
                  id="decision_timeframe"
                  name="decision_timeframe"
                  value={formData.decision_timeframe || ""}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-stone-900 ${
                    errors.decision_timeframe ? "border-red-500" : "border-stone-200"
                  }`}
                >
                  <option value="">{t("select")}</option>
                  <option value="0-3">{t("buyerTimeframe0to3")}</option>
                  <option value="3-6">{t("buyerTimeframe3to6")}</option>
                  <option value="6-12">{t("buyerTimeframe6to12")}</option>
                </select>
                {errors.decision_timeframe && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.decision_timeframe}
                  </p>
                )}
              </div>

              {/* Alignment Question */}
              <div>
                <label
                  htmlFor="alignment_answer"
                  className="block text-sm font-medium text-stone-700 mb-1"
                >
                  {t("buyerAlignmentQuestion")} <span className="text-red-500">*</span>
                </label>
                <select
                  id="alignment_answer"
                  name="alignment_answer"
                  value={formData.alignment_answer || ""}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-stone-900 ${
                    errors.alignment_answer ? "border-red-500" : "border-stone-200"
                  }`}
                >
                  <option value="">{t("select")}</option>
                  <option value="yes">{t("buyerAlignmentYes")}</option>
                  <option value="evaluating">{t("buyerAlignmentEvaluating")}</option>
                </select>
                {errors.alignment_answer && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.alignment_answer}
                  </p>
                )}
              </div>

              {/* Consent Marketing */}
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="consent_marketing"
                  name="consent_marketing"
                  checked={formData.consent_marketing || false}
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={createLead.isPending}
                className="w-full bg-stone-900 text-white py-4 px-6 hover:bg-stone-800 transition-colors disabled:bg-stone-400 disabled:cursor-not-allowed font-medium"
              >
                {createLead.isPending ? t("submitting") : t("buyerSubmitButton")}
              </button>
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
