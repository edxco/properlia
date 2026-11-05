"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { propertyApi } from "@properlia/shared/services/properties/api";
import type { Property } from "@properlia/shared/types";
import { useT } from "@properlia/shared/components/TranslationProvider";
import { Alert } from "@properlia/shared/components/ui";
import PropertyForm from "../../PropertyForm";

export default function EditPropertyPage() {
  const t = useT();
  const params = useParams();
  const id = params.id as string;

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const data = await propertyApi.getById(id);
        setProperty(data);
      } catch (err: any) {
        console.error("Error fetching property:", err);
        setError(err?.message || "Failed to load property");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProperty();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="space-y-6">
        <Link
          href="/dashboard/properties"
          className="text-brand-gray hover:text-brand-carbon"
        >
          ← {t("properties")}
        </Link>
        <Alert tone="danger">{error || "Property not found"}</Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/properties"
          className="text-brand-gray hover:text-brand-carbon"
        >
          ← {t("properties")}
        </Link>
      </div>

      <div className="w-full">
        <PropertyForm
          editingProperty={property}
          onCancelEdit={() => {
            window.location.href = "/dashboard/properties";
          }}
        />
      </div>
    </div>
  );
}
