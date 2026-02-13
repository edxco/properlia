"use client";

import { useState } from "react";
import { useT } from "@properlia/shared/components/TranslationProvider";

interface FactSheetModalProps {
  isOpen: boolean;
  propertyId: string | null;
  onClose: () => void;
}

export default function FactSheetModal({
  isOpen,
  propertyId,
  onClose,
}: FactSheetModalProps) {
  const t = useT();
  const [includeProperliaInfo, setIncludeProperliaInfo] = useState(true);
  const [generateInSpanish, setGenerateInSpanish] = useState(true);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (propertyId) {
      // Determine the locale based on the generateInSpanish toggle
      const locale = generateInSpanish ? 'es' : 'en';

      // Get API base URL from environment or default to localhost
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

      // Generate PDF download URL with locale parameter
      const pdfUrl = `${apiBaseUrl}/properties/${propertyId}/pdf?locale=${locale}`;

      // Open PDF in new tab to trigger download
      window.open(pdfUrl, "_blank");
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 bg-opacity-20">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {t("factSheetOptions")}
          </h3>
        </div>
        <div className="px-6 py-4">
          <div className="space-y-4 mb-6">
            {/* Option 1: Display Properlia Info */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">
                {t("displayProperliaInfo")}
              </span>
              <button
                onClick={() => setIncludeProperliaInfo(!includeProperliaInfo)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  includeProperliaInfo ? "bg-primary" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    includeProperliaInfo ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Option 2: Generate Info in Spanish */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">
                {t("generateInfoInSpanish")}
              </span>
              <button
                onClick={() => setGenerateInSpanish(!generateInSpanish)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  generateInSpanish ? "bg-primary" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    generateInSpanish ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              {t("cancel")}
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 transition-colors"
            >
              {t("download")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
