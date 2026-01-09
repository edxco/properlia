"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { useT } from "@properlia/shared/components/TranslationProvider";
import {
  useGeneralInfo,
  useUpdateGeneralInfo,
} from "@/src/services/general-info/queries";

type FormState = {
  phone: string;
  whatsapp: string;
  email_to: string;
};

const emptyForm: FormState = {
  phone: "",
  whatsapp: "",
  email_to: "",
};

export default function GeneralInformationPage() {
  const t = useT();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { data: generalInfo, isLoading, error } = useGeneralInfo();
  const { mutateAsync: updateGeneralInfo, isPending: updating } =
    useUpdateGeneralInfo();

  useEffect(() => {
    if (generalInfo) {
      setForm({
        phone: generalInfo.phone ?? "",
        whatsapp: generalInfo.whatsapp ?? "",
        email_to: generalInfo.email_to ?? "",
      });
    }
  }, [generalInfo]);

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormError(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    if (!form.phone.trim() || !form.whatsapp.trim() || !form.email_to.trim()) {
      setFormError("All fields are required.");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email_to)) {
      setFormError("Please enter a valid email address.");
      return;
    }

    try {
      await updateGeneralInfo({
        phone: form.phone.trim(),
        whatsapp: form.whatsapp.trim(),
        email_to: form.email_to.trim(),
      });
      setSuccessMessage("General information updated successfully!");
    } catch (mutationError: any) {
      setFormError(
        mutationError?.message ||
          "There was a problem updating the information. Please try again."
      );
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">
          Error loading general information: {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary uppercase">
          {t("generalInformation")}
        </h2>
        <p className="text-sm text-gray-500">
          Manage contact information that will be used across the platform.
        </p>
      </div>

      <div className="max-w-2xl">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          {isLoading ? (
            <div className="flex justify-center py-12 text-gray-500">
              Loading general information...
            </div>
          ) : (
            <>
              {formError && (
                <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {formError}
                </div>
              )}

              {successMessage && (
                <div className="mb-4 rounded border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                  {successMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("phone")}
                  </label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(event) =>
                      handleChange("phone", event.target.value)
                    }
                    className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="+52 555 123 4567"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Main contact phone number for your business
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={form.whatsapp}
                    onChange={(event) =>
                      handleChange("whatsapp", event.target.value)
                    }
                    className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="+52 555 123 4567"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    WhatsApp number for quick customer communication
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("email")}
                  </label>
                  <input
                    type="email"
                    value={form.email_to}
                    onChange={(event) =>
                      handleChange("email_to", event.target.value)
                    }
                    className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="contact@example.com"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Email address where inquiries will be sent
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    All fields are required
                  </p>
                  <button
                    type="submit"
                    className="flex items-center gap-2 rounded-md bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    disabled={updating}
                  >
                    <Save className="h-4 w-4" />
                    {updating ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
