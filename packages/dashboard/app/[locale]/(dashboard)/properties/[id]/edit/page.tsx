"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { propertyApi } from "@properlia/shared/services/properties/api";
import type { Property } from "@properlia/shared/types";
import { useT } from "@properlia/shared/components/TranslationProvider";
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
          href="/properties"
          className="text-gray-500 hover:text-gray-700"
        >
          ← {t("properties")}
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error || "Property not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/properties"
          className="text-gray-500 hover:text-gray-700"
        >
          ← {t("properties")}
        </Link>
      </div>

      <div className="w-full">
        <PropertyForm
          editingProperty={property}
          onCancelEdit={() => {
            window.location.href = "/properties";
          }}
        />
      </div>
    </div>
  );
}
