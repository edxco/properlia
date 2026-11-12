"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Bed, Bath, DoorOpen, Car, Home, Trees, Copy, Check, MapPin, Phone, MessageCircle, X } from "lucide-react";
import type { Property } from "@properlia/shared/types";
import { capitalizeFirstWord, getAbsoluteImageUrl } from "@properlia/shared";
import { useT } from "@properlia/shared/components/TranslationProvider";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardTitle,
  Field,
  Input,
  PageTitle,
  Price,
  buttonClasses,
} from "@properlia/shared/components/ui";
import { capitalizeEachWord } from "@/lib/utils/capitalizeEachWord";
import { useGeneralInfo } from "@/src/services/general-info/queries";
import { useCreatePropertyLead } from "@/src/services/leads/mutations";
import { useContactPrefill } from "@/src/lib/useContactPrefill";
import { PropertyGallery } from "./PropertyGallery";

interface PropertyDetailViewProps {
  property: Property;
  locale: string;
  title: string;
  description: string | null;
}

export const PropertyDetailView = ({
  property,
  locale,
  title,
  description,
}: PropertyDetailViewProps) => {
  const t = useT();
  const isEs = locale === "es";
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const { data: generalInfo } = useGeneralInfo();
  const [pageUrl, setPageUrl] = useState("");
  useEffect(() => setPageUrl(window.location.href), []);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    whatsappConsent: false,
  });
  const [contactErrors, setContactErrors] = useState<{ name?: string; contact?: string }>({});
  const [honeypot, setHoneypot] = useState("");
  const [noticeDismissed, setNoticeDismissed] = useState(false);
  const submitLock = useRef(false);
  const createLead = useCreatePropertyLead(property.id);
  const { saved: savedContact, save: saveContact, clear: clearContact } = useContactPrefill();

  useEffect(() => {
    if (!savedContact) return;
    setContactForm((f) => ({
      ...f,
      name: f.name || savedContact.name,
      email: f.email || savedContact.email,
      phone: f.phone || savedContact.phone,
    }));
  }, [savedContact]);

  const handleContactSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors: { name?: string; contact?: string } = {};
    if (!contactForm.name.trim()) errors.name = t("propertyContactNameRequired");
    if (!contactForm.email.trim() && !contactForm.phone.trim()) {
      errors.contact = t("emailOrPhoneRequired");
    }
    setContactErrors(errors);
    if (Object.keys(errors).length > 0) return;

    if (submitLock.current) return;
    submitLock.current = true;

    const values = {
      name: contactForm.name.trim(),
      email: contactForm.email.trim(),
      phone: contactForm.phone.trim(),
    };

    createLead.mutate(
      {
        full_name: values.name,
        email: values.email || undefined,
        phone: values.phone || undefined,
        whatsapp_consent: contactForm.whatsappConsent,
        website: honeypot || undefined,
      },
      {
        onSuccess: () => saveContact(values),
        onSettled: () => {
          submitLock.current = false;
        },
      }
    );
  };

  const handleNotYou = () => {
    clearContact();
    setContactForm({ name: "", email: "", phone: "", whatsappConsent: false });
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(property.code);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    } catch {
      setCodeCopied(false);
    }
  };

  const label = (entity: { name: string; es_name: string }) =>
    (isEs && entity.es_name) || entity.name;
  const formatNumber = (value: number) => value.toLocaleString(isEs ? "es-MX" : "en-US");

  const formattedPrice = new Intl.NumberFormat(isEs ? "es-MX" : "en-US", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
  }).format(property.price);

  const images = property.images.map((img) => getAbsoluteImageUrl(img.url));

  const stats = [
    property.built_area
      ? { icon: Home, label: t("propertyDetailBuiltArea"), value: `${formatNumber(property.built_area)} m²` }
      : null,
    property.land_area
      ? { icon: Trees, label: t("propertyDetailLandArea"), value: `${formatNumber(property.land_area)} m²` }
      : null,
    property.rooms > 0 ? { icon: Bed, label: t("propertyDetailBedrooms"), value: property.rooms } : null,
    property.bathrooms > 0
      ? { icon: Bath, label: t("propertyDetailBathrooms"), value: property.bathrooms }
      : null,
    property.half_bathrooms > 0
      ? { icon: DoorOpen, label: t("propertyDetailHalfBathrooms"), value: property.half_bathrooms }
      : null,
    property.parking_spaces > 0
      ? { icon: Car, label: t("propertyDetailParking"), value: property.parking_spaces }
      : null,
  ].filter(Boolean) as { icon: typeof Home; label: string; value: string | number }[];

  const detailPills = [
    property.property_type && {
      key: "property_type",
      tone: "navy" as const,
      text: `${label(property.property_type).toUpperCase()}`,
    },
    property.status && {
      key: "status",
      tone: "navy" as const,
      text: `${label(property.status).toUpperCase()}`,
    },
  ].filter(Boolean) as { key: string; tone: "navy" | "info" | "neutral"; text: string }[];

  const features = property.property_features ?? [];

  const neighborhoodCityState = [
    property.neighborhood,
    property.city && label(property.city),
    property.state && label(property.state),
  ]
    .filter(Boolean)
    .join(", ");

  const whatsappDigits = generalInfo?.whatsapp?.replace(/\D/g, "");
  const whatsappHref = whatsappDigits
    ? `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(
        t("propertyContactWhatsappMessage")
          .replace("{title}", title)
          .replace("{code}", property.code ?? "")
          .replace("{url}", pageUrl)
      )}`
    : null;

  return (
    <div className="mx-auto max-w-[1400px] px-6 py-8 lg:px-8" id="property-detail-view">
      <header className="mb-6 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <PageTitle className="text-3xl md:text-4xl">{title}</PageTitle>
          <div className="mt-2 flex flex-wrap items-baseline gap-2">
            <Price className="text-3xl md:text-4xl">{formattedPrice}</Price>
            <span className="text-sm text-brand-gray">MXN</span>
          </div>
        </div>
        {(property.address || property.code) && (
          <div className="flex flex-col gap-3 md:max-w-sm md:items-end md:text-right">
            {(property.address || neighborhoodCityState || property.zip_code) && (
              <div className="flex flex-col gap-0.5 text-brand-carbon/70">
                {property.address && (
                  <p className="flex items-center gap-2 md:justify-end">
                    <MapPin size={18} strokeWidth={1.75} className="shrink-0 text-brand-gray" />
                    <span>{property.address}</span>
                  </p>
                )}
                {neighborhoodCityState && <p className="text-sm">{neighborhoodCityState}</p>}
              </div>
            )}
            {property.code && (
              <Badge tone="info" size="lg" className="w-fit gap-1.5 pr-3 pl-4 text-sm tabular-nums tracking-wide">
                <span>{property.code}</span>
                <button
                  type="button"
                  onClick={copyCode}
                  aria-label={codeCopied ? t("propertyCodeCopied") : t("propertyCodeCopy")}
                  title={codeCopied ? t("propertyCodeCopied") : t("propertyCodeCopy")}
                  className="inline-flex size-6 items-center justify-center rounded-full text-brand-blue transition-colors hover:bg-white/70"
                >
                  {codeCopied ? <Check size={14} strokeWidth={1.75} /> : <Copy size={14} strokeWidth={1.75} />}
                </button>
              </Badge>
            )}
          </div>
        )}
      </header>

      <PropertyGallery images={images} title={title} />

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-8 lg:col-span-2">
          {(stats.length > 0 || detailPills.length > 0 || features.length > 0) && (
            <Card padding="none" className="p-6">
              <CardTitle className="mb-4">{t("propertyDetails")}</CardTitle>
              {(detailPills.length > 0 || features.length > 0) && (
                <div className="mb-5 flex flex-wrap items-center gap-2">
                  {detailPills.map((pill) => (
                    <Badge
                      key={pill.key}
                      tone={pill.tone}
                      size="sm"
                      className="text-[11px] md:px-2.5 md:py-1.5 md:text-xs"
                    >
                      {pill.text}
                    </Badge>
                  ))}
                  {detailPills.length > 0 && features.length > 0 && (
                    <span aria-hidden="true" className="px-1 text-brand-border">
                      |
                    </span>
                  )}
                  {features.map((feature) => (
                    <Badge key={feature.id} tone="info" size="sm" className="md:px-2.5 md:py-1.5">
                      {capitalizeFirstWord(label(feature))}
                    </Badge>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 sm:gap-6">
                {stats.map(({ icon: Icon, label: statLabel, value }) => (
                  <div key={statLabel} className="flex min-w-0 items-center gap-2 sm:gap-3">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-pale text-brand-navy sm:size-10">
                      <Icon strokeWidth={1.75} className="size-4 sm:size-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="break-words text-[10px] font-medium uppercase tracking-wide text-brand-gray md:text-xs">{statLabel}</p>
                      <p className="mt-0.5 text-sm font-medium tabular-nums text-brand-carbon md:text-lg">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {description && (
            <Card padding="none" className="p-6">
              <CardTitle className="mb-4">{t("description")}</CardTitle>
              <p
                className={`whitespace-pre-line text-base leading-relaxed text-brand-carbon ${
                  descriptionExpanded ? "" : "line-clamp-9"
                }`}
              >
                {description}
              </p>
              <Button
                variant="link"
                size="sm"
                onClick={() => setDescriptionExpanded((v) => !v)}
                className="mt-3 px-0"
              >
                {descriptionExpanded ? t("propertyDetailReadLess") : t("propertyDetailReadMore")}
              </Button>
            </Card>
          )}
        </div>

        <aside className="lg:col-span-1">
          <Card padding="none" className="p-6 lg:sticky lg:top-24">
            <CardTitle className="mb-4">{t("contactTitle")}</CardTitle>
            {createLead.isSuccess ? (
              <Alert tone="success">{t("propertyContactSuccess")}</Alert>
            ) : (
            <form onSubmit={handleContactSubmit} noValidate className="flex flex-col gap-4">
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                className="absolute -left-[9999px] h-0 w-0 opacity-0"
              />
              {savedContact && !noticeDismissed && (
                <Alert tone="info" className="flex items-start justify-between gap-2 py-3">
                  <p>
                    {t("propertyContactPrefillNotice")}{" "}
                    <button type="button" onClick={handleNotYou} className="underline">
                      {t("propertyContactNotYou")}
                    </button>
                  </p>
                  <button
                    type="button"
                    onClick={() => setNoticeDismissed(true)}
                    aria-label={t("propertyContactDismissNotice")}
                    className="shrink-0"
                  >
                    <X size={16} strokeWidth={1.75} />
                  </button>
                </Alert>
              )}
              <Field label={t("name")} htmlFor="property-contact-name" required error={contactErrors.name}>
                <Input
                  id="property-contact-name"
                  name="name"
                  autoComplete="name"
                  placeholder={t("propertyContactName")}
                  value={contactForm.name}
                  invalid={!!contactErrors.name}
                  onChange={(e) => setContactForm((f) => ({ ...f, name: e.target.value }))}
                />
              </Field>
              <Field label={t("email")} htmlFor="property-contact-email" error={contactErrors.contact}>
                <Input
                  id="property-contact-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={contactForm.email}
                  invalid={!!contactErrors.contact}
                  onChange={(e) => setContactForm((f) => ({ ...f, email: e.target.value }))}
                />
              </Field>
              <Field label={t("phone")} htmlFor="property-contact-phone">
                <Input
                  id="property-contact-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={contactForm.phone}
                  invalid={!!contactErrors.contact}
                  onChange={(e) => setContactForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </Field>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-brand-carbon">
                <input
                  type="checkbox"
                  checked={contactForm.whatsappConsent}
                  onChange={(e) => setContactForm((f) => ({ ...f, whatsappConsent: e.target.checked }))}
                  className="h-4 w-4 rounded border-input accent-brand-blue"
                />
                {t("propertyContactWhatsappConsent")}
              </label>
              {createLead.isError && <Alert tone="danger">{t("propertyContactError")}</Alert>}
              <Button type="submit" className="w-full" disabled={createLead.isPending}>
                {createLead.isPending ? t("propertyContactSending") : t("propertyDetailContact")}
              </Button>
            </form>
            )}

            {(generalInfo?.phone || whatsappHref) && (
              <div className="mt-4 flex flex-col gap-4 lg:gap-2 border-t border-brand-border pt-4">
                {generalInfo?.phone && (
                  <a
                    href={`tel:${generalInfo.phone}`}
                    className={buttonClasses({ variant: "secondary", size: "lg", fullWidth: true })}
                  >
                    <Phone size={18} strokeWidth={1.75} />
                    {t("propertyContactCall")}
                  </a>
                )}
                {whatsappHref && (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonClasses({ variant: "secondary", size: "lg", fullWidth: true })}
                  >
                    <MessageCircle size={18} strokeWidth={1.75} />
                    {t("whatsapp")}
                  </a>
                )}
              </div>
            )}
          </Card>
        </aside>
      </div>
    </div>
  );
};
