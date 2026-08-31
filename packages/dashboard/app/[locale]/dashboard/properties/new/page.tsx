"use client";

import Link from "next/link";
import { useT } from "@properlia/shared/components/TranslationProvider";
import PropertyForm from "../PropertyForm";

export default function NewPropertyPage() {
  const t = useT();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/properties"
          className="text-gray-500 hover:text-gray-700"
        >
          ← {t("properties")}
        </Link>
      </div>

      <div className="w-full">
        <PropertyForm editingProperty={null} onCancelEdit={() => {}} />
      </div>
    </div>
  );
}
