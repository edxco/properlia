"use client";

import { useState } from "react";
import { useT, useLocale } from "@properlia/shared/components/TranslationProvider";
import { usePropertyTypes } from "@/src/services/property-types/queries";
import { useCreatePublicLead } from "@/src/services/leads/mutations";
import { CreatePublicLeadDto } from "@properlia/shared/services/leads/api";
import { MapPin, Users, Eye, DollarSign, CheckCircle } from "lucide-react";

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
    if (formData.max_budget) leadData.max_budget = parseFloat(formData.max_budget);
    if (formData.neighborhood.trim()) leadData.neighborhood = formData.neighborhood;
    if (formData.city.trim()) leadData.city = formData.city;
    if (formData.state.trim()) leadData.state = formData.state;
    if (formData.notes.trim()) leadData.notes = formData.notes;

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
      icon: MapPin,
      title: t("benefit1Title"),
      description: t("benefit1Description"),
    },
    {
      icon: Users,
      title: t("benefit2Title"),
      description: t("benefit2Description"),
    },
    {
      icon: Eye,
      title: t("benefit3Title"),
      description: t("benefit3Description"),
    },
    {
      icon: DollarSign,
      title: t("benefit4Title"),
      description: t("benefit4Description"),
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
              {t("submitForm")}
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
            {t("sellPageTitle")}
          </h1>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto">
            {t("sellPageSubtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Form */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-stone-900 mb-6">
              {t("sellFormTitle")}
            </h2>

            {errors.general && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-700">
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-stone-700 mb-1">
                  {t("fullName")} *
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
                  <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-1">
                    {t("email")}
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
                  <label htmlFor="phone" className="block text-sm font-medium text-stone-700 mb-1">
                    {t("phone")}
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

              {/* Property Type & Desired Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="property_type_id" className="block text-sm font-medium text-stone-700 mb-1">
                    {t("propertyType")}
                  </label>
                  <select
                    id="property_type_id"
                    name="property_type_id"
                    value={formData.property_type_id}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-stone-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-stone-900"
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
                  <label htmlFor="desired_date" className="block text-sm font-medium text-stone-700 mb-1">
                    {t("desiredDate")}
                  </label>
                  <input
                    type="date"
                    id="desired_date"
                    name="desired_date"
                    value={formData.desired_date}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-stone-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                </div>
              </div>

              {/* Max Budget */}
              <div>
                <label htmlFor="max_budget" className="block text-sm font-medium text-stone-700 mb-1">
                  {t("maxBudget")}
                </label>
                <input
                  type="number"
                  id="max_budget"
                  name="max_budget"
                  value={formData.max_budget}
                  onChange={handleChange}
                  placeholder={t("enterMaxBudget")}
                  className="w-full px-4 py-3 border border-stone-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-stone-900"
                />
              </div>

              {/* Location */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="neighborhood" className="block text-sm font-medium text-stone-700 mb-1">
                    {t("neighborhood")}
                  </label>
                  <input
                    type="text"
                    id="neighborhood"
                    name="neighborhood"
                    value={formData.neighborhood}
                    onChange={handleChange}
                    placeholder={t("enterNeighborhood")}
                    className="w-full px-4 py-3 border border-stone-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                </div>
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-stone-700 mb-1">
                    {t("city")}
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder={t("enterCity")}
                    className="w-full px-4 py-3 border border-stone-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                </div>
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-stone-700 mb-1">
                    {t("state")}
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder={t("enterState")}
                    className="w-full px-4 py-3 border border-stone-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-stone-700 mb-1">
                  {t("propertyDescription")}
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder={t("enterDescription")}
                  className="w-full px-4 py-3 border border-stone-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-stone-900 resize-none"
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
                  className="mt-1 h-4 w-4 text-stone-900 focus:ring-stone-900 border-stone-300 rounded"
                />
                <label htmlFor="consent_marketing" className="ml-3 text-sm text-stone-600">
                  {t("consentMarketing")}
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={createLead.isPending}
                className="w-full bg-stone-900 text-white py-4 px-6 hover:bg-stone-800 transition-colors disabled:bg-stone-400 disabled:cursor-not-allowed font-medium"
              >
                {createLead.isPending ? t("submitting") : t("submitForm")}
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
                    <p className="text-stone-600">
                      {benefit.description}
                    </p>
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
