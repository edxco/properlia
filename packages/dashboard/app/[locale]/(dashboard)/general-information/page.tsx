"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { useT } from "@properlia/shared/components/TranslationProvider";
import {
  useGeneralInfo,
  useUpdateGeneralInfo,
} from "@/src/services/general-info/queries";
import { useAuth } from "@/src/contexts/AuthContext";
import {
  Alert,
  Button,
  Card,
  DashboardTitle,
  Field,
  Input,
} from "@properlia/shared/components/ui";

type FormState = {
  phone: string;
  whatsapp: string;
  email_to: string;
  instagram: string;
  tiktok: string;
  linkedin: string;
  facebook: string;
  email_contact: string;
};

const emptyForm: FormState = {
  phone: "",
  whatsapp: "",
  email_to: "",
  instagram: "",
  tiktok: "",
  linkedin: "",
  facebook: "",
  email_contact: "",
};

export default function GeneralInformationPage() {
  const t = useT();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
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
        instagram: generalInfo.instagram ?? "",
        tiktok: generalInfo.tiktok ?? "",
        linkedin: generalInfo.linkedin ?? "",
        facebook: generalInfo.facebook ?? "",
        email_contact: generalInfo.email_contact ?? "",
      });
    }
  }, [generalInfo]);

  const handleChange = (field: keyof FormState, value: string) => {
    console.log(field, value);
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

    // Validate email_contact if provided
    if (form.email_contact.trim() && !emailRegex.test(form.email_contact)) {
      setFormError("Please enter a valid contact email address.");
      return;
    }

    try {
      await updateGeneralInfo({
        phone: form.phone.trim(),
        whatsapp: form.whatsapp.trim(),
        email_to: form.email_to.trim(),
        instagram: form.instagram.trim() || null,
        tiktok: form.tiktok.trim() || null,
        linkedin: form.linkedin.trim() || null,
        facebook: form.facebook.trim() || null,
        email_contact: form.email_contact.trim() || null,
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
      <Alert tone="danger">
        Error loading general information: {error.message}
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <DashboardTitle>{t("generalInformation")}</DashboardTitle>
        <p className="text-sm text-brand-gray">
          Manage contact information that will be used across the platform.
        </p>
      </div>

      <div className="max-w-2xl">
        <Card>
          {isLoading ? (
            <div className="flex justify-center py-12 text-brand-gray">
              Loading general information...
            </div>
          ) : (
            <>
              {formError && (
                <Alert tone="danger" className="mb-4 p-3">
                  {formError}
                </Alert>
              )}

              {successMessage && (
                <Alert tone="success" className="mb-4 p-3">
                  {successMessage}
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <Field
                  label={t("phone")}
                  hint="Main contact phone number for your business"
                >
                  <Input
                    type="tel"
                    value={form.phone}
                    onChange={(event) =>
                      handleChange("phone", event.target.value)
                    }
                    placeholder="+52 555 123 4567"
                    required
                    disabled={!isAdmin}
                  />
                </Field>

                <Field
                  label="WhatsApp"
                  hint="WhatsApp number for quick customer communication"
                >
                  <Input
                    type="tel"
                    value={form.whatsapp}
                    onChange={(event) =>
                      handleChange("whatsapp", event.target.value)
                    }
                    placeholder="+52 555 123 4567"
                    required
                    disabled={!isAdmin}
                  />
                </Field>

                <Field
                  label={t("email")}
                  hint="Email address where inquiries will be sent"
                >
                  <Input
                    type="email"
                    value={form.email_to}
                    onChange={(event) =>
                      handleChange("email_to", event.target.value)
                    }
                    placeholder="contact@example.com"
                    required
                    disabled={!isAdmin}
                  />
                </Field>

                <div className="pt-6 border-t border-brand-border">
                  <h3 className="text-sm font-medium text-brand-carbon mb-4">
                    Social Media & Contact (Optional)
                  </h3>
                  <div className="space-y-6">
                    <Field
                      label="Contact Email (Footer)"
                      hint="Email displayed in the website footer"
                    >
                      <Input
                        type="email"
                        value={form.email_contact}
                        onChange={(event) =>
                          handleChange("email_contact", event.target.value)
                        }
                        placeholder="info@example.com"
                        disabled={!isAdmin}
                      />
                    </Field>

                    <Field
                      label="Instagram"
                      hint="Instagram displayed in the website footer"
                    >
                      <Input
                        type="url"
                        value={form.instagram}
                        onChange={(event) =>
                          handleChange("instagram", event.target.value)
                        }
                        placeholder="https://instagram.com/yourprofile"
                        disabled={!isAdmin}
                      />
                    </Field>

                    <Field
                      label="Facebook"
                      hint="Facebook displayed in the website footer"
                    >
                      <Input
                        type="url"
                        value={form.facebook}
                        onChange={(event) =>
                          handleChange("facebook", event.target.value)
                        }
                        placeholder="https://facebook.com/yourpage"
                        disabled={!isAdmin}
                      />
                    </Field>

                    <Field
                      label="LinkedIn"
                      hint="LinkedIn displayed in the website footer"
                    >
                      <Input
                        type="url"
                        value={form.linkedin}
                        onChange={(event) =>
                          handleChange("linkedin", event.target.value)
                        }
                        placeholder="https://linkedin.com/company/yourcompany"
                        disabled={!isAdmin}
                      />
                    </Field>

                    <Field
                      label="TikTok"
                      hint="TikTok displayed in the website footer"
                    >
                      <Input
                        type="url"
                        value={form.tiktok}
                        onChange={(event) =>
                          handleChange("tiktok", event.target.value)
                        }
                        placeholder="https://tiktok.com/@yourprofile"
                        disabled={!isAdmin}
                      />
                    </Field>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-brand-border">
                  <p className="text-sm text-brand-gray">
                    {!isAdmin
                      ? "Only admins can edit this information"
                      : "Phone, WhatsApp, and Email are required"}
                  </p>
                  <Button type="submit" disabled={updating || !isAdmin}>
                    <Save className="h-4 w-4" />
                    {updating ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
