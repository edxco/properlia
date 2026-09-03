"use client";

import { useState } from "react";
import Link from "next/link";
import { Bed, Bath, DoorOpen, Car, Home, Trees } from "lucide-react";
import type { Property } from "@properlia/shared/types";
import { getAbsoluteImageUrl } from "@properlia/shared";
import { playfairDisplay, inter } from "./fonts";
import { textStyles } from "./typography";
import { PropertyGallery } from "./PropertyGallery";

interface PropertyDetailViewProps {
  property: Property;
  locale: string;
}

interface Crumb {
  label: string;
  href?: string;
}

export const PropertyDetailView = ({ property, locale }: PropertyDetailViewProps) => {
  const isEs = locale === "es";
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  const title = (isEs ? property.title : property.title_en) || property.title;
  const description = (isEs ? property.description : property.description_en) || property.description;

  const crumbs: Crumb[] = [{ label: isEs ? "Propiedades" : "Properties", href: "/properties" }];
  if (property.state) {
    crumbs.push({
      label: isEs ? property.state.es_name : property.state.name,
      href: `/properties?state_id=${encodeURIComponent(property.state.id)}`,
    });
  }
  if (property.city) {
    crumbs.push({
      label: isEs ? property.city.es_name : property.city.name,
      href: `/properties?city_id=${encodeURIComponent(property.city.id)}`,
    });
  }
  if (property.neighborhood) {
    crumbs.push({ label: property.neighborhood });
  }

  const formattedPrice = new Intl.NumberFormat(isEs ? "es-MX" : "en-US", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
  }).format(property.price);

  const images = property.images.map((img) => getAbsoluteImageUrl(img.url));

  const stats = [
    property.built_area
      ? {
          icon: Home,
          label: isEs ? "M² Construidos" : "Built Area",
          value: `${property.built_area.toLocaleString()} m²`,
        }
      : null,
    property.land_area
      ? {
          icon: Trees,
          label: isEs ? "M² de Terreno" : "Land Area",
          value: `${property.land_area.toLocaleString()} m²`,
        }
      : null,
    property.rooms > 0
      ? { icon: Bed, label: isEs ? "Habitaciones" : "Bedrooms", value: property.rooms }
      : null,
    property.bathrooms > 0
      ? { icon: Bath, label: isEs ? "Baños" : "Bathrooms", value: property.bathrooms }
      : null,
    property.half_bathrooms > 0
      ? { icon: DoorOpen, label: isEs ? "Medios Baños" : "Half Baths", value: property.half_bathrooms }
      : null,
    property.parking_spaces > 0
      ? { icon: Car, label: isEs ? "Estacionamientos" : "Parking", value: property.parking_spaces }
      : null,
  ].filter(Boolean) as { icon: typeof Home; label: string; value: string | number }[];

  const infoRows = [
    property.property_type && {
      label: isEs ? "Tipo" : "Type",
      value: isEs ? property.property_type.es_name : property.property_type.name,
    },
    property.status && {
      label: isEs ? "Estado" : "Status",
      value: isEs ? property.status.es_name : property.status.name,
    },
    property.city && {
      label: isEs ? "Ciudad" : "City",
      value: isEs ? property.city.es_name : property.city.name,
    },
    property.state && {
      label: isEs ? "Estado" : "State",
      value: isEs ? property.state.es_name : property.state.name,
    },
    property.zip_code && { label: isEs ? "Código Postal" : "Zip Code", value: property.zip_code },
    property.neighborhood && { label: isEs ? "Colonia" : "Neighborhood", value: property.neighborhood },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className={`${playfairDisplay.variable} ${inter.variable} max-w-[1200px] mx-auto px-6 lg:px-8 py-8`}>
      {/* Breadcrumbs */}
      <nav className="flex flex-wrap items-center gap-1 mb-4">
        {crumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && <span style={textStyles.meta}>/</span>}
            {crumb.href ? (
              <Link href={`/${locale}${crumb.href}`} style={textStyles.meta} className="hover:underline">
                {crumb.label}
              </Link>
            ) : (
              <span style={textStyles.meta}>{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>

      {/* Header */}
      <div className="mb-6">
        <h1 style={textStyles.h1}>{title}</h1>
        <div className="flex flex-wrap items-baseline gap-3 mt-2">
          <span style={textStyles.price}>{formattedPrice}</span>
          <span style={textStyles.meta}>MXN</span>
        </div>
        {property.address && <p style={{ ...textStyles.meta, marginTop: 6 }}>{property.address}</p>}
      </div>

      {/* Gallery */}
      <PropertyGallery images={images} title={title} />

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Stats */}
          {stats.length > 0 && (
            <div className="rounded-2xl p-6" style={{ border: "1px solid #EAEAE3" }}>
              <h2 style={{ ...textStyles.h2, marginBottom: 20 }}>
                {isEs ? "Detalles de la Propiedad" : "Property Details"}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {stats.map(({ icon: Icon, label, value }, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div
                      className="flex items-center justify-center rounded-full shrink-0"
                      style={{ width: 40, height: 40, background: "#E8F0F8", color: "#1A3A5C" }}
                    >
                      <Icon size={20} />
                    </div>
                    <div>
                      <p style={textStyles.label}>{label}</p>
                      <p style={{ ...textStyles.h3, marginTop: 2 }}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {description && (
            <div className="rounded-2xl p-6" style={{ border: "1px solid #EAEAE3" }}>
              <h2 style={{ ...textStyles.h2, marginBottom: 16 }}>
                {isEs ? "Descripción" : "Description"}
              </h2>
              <p
                style={{
                  ...textStyles.body,
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: descriptionExpanded ? "unset" : 5,
                  overflow: descriptionExpanded ? "visible" : "hidden",
                }}
              >
                {description}
              </p>
              <button
                onClick={() => setDescriptionExpanded((v) => !v)}
                className="mt-3"
                style={{ ...textStyles.button, color: "#1A3A5C" }}
              >
                {descriptionExpanded
                  ? isEs
                    ? "Ver menos"
                    : "Read less"
                  : isEs
                  ? "Ver más"
                  : "Read more"}
              </button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div
            className="rounded-2xl p-6 lg:sticky lg:top-24"
            style={{ border: "1px solid #EAEAE3" }}
          >
            <h3 style={{ ...textStyles.h3, marginBottom: 16 }}>
              {isEs ? "Información Adicional" : "Additional Information"}
            </h3>
            <div className="flex flex-col gap-3">
              {infoRows.map((row, i) => (
                <div key={i} className="flex justify-between gap-4">
                  <span style={textStyles.label}>{row.label}</span>
                  <span style={{ ...textStyles.body, fontSize: 14, textAlign: "right" }}>{row.value}</span>
                </div>
              ))}
            </div>

            <button
              className="w-full rounded-lg mt-6 py-3"
              style={{ ...textStyles.button, background: "#1A3A5C", color: "#fff" }}
            >
              {isEs ? "Contactar" : "Contact Us"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
