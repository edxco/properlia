"use client";

import { useId, useState } from "react";
import { useT } from "@properlia/shared/components/TranslationProvider";
import { Button, Card, Switch } from "@properlia/shared/components/ui";

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
  const properliaInfoLabelId = useId();
  const spanishLabelId = useId();

  if (!isOpen) return null;

  const handleDownload = () => {
    if (propertyId) {
      // Determine the locale based on the generateInSpanish toggle
      const locale = generateInSpanish ? 'es' : 'en';

      // Get API base URL from environment or default to localhost
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

      // Generate PDF download URL with locale parameter
      const pdfUrl = `${apiBaseUrl}/properties/${propertyId}/pdf?locale=${locale}&display_properlia_info=${includeProperliaInfo}`;

      // Open PDF in new tab to trigger download
      window.open(pdfUrl, "_blank");
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 bg-opacity-20">
      <Card padding="none" className="shadow-overlay max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b border-brand-border">
          <h3 className="text-lg font-medium text-brand-carbon">
            {t("factSheetOptions")}
          </h3>
        </div>
        <div className="px-6 py-4">
          <div className="space-y-4 mb-6">
            {/* Option 1: Display Properlia Info */}
            <div className="flex items-center justify-between">
              <span id={properliaInfoLabelId} className="text-sm text-brand-carbon">
                {t("displayProperliaInfo")}
              </span>
              <Switch
                checked={includeProperliaInfo}
                onCheckedChange={setIncludeProperliaInfo}
                aria-labelledby={properliaInfoLabelId}
              />
            </div>

            {/* Option 2: Generate Info in Spanish */}
            <div className="flex items-center justify-between">
              <span id={spanishLabelId} className="text-sm text-brand-carbon">
                {t("generateInfoInSpanish")}
              </span>
              <Switch
                checked={generateInSpanish}
                onCheckedChange={setGenerateInSpanish}
                aria-labelledby={spanishLabelId}
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="secondary" size="sm" onClick={onClose}>
              {t("cancel")}
            </Button>
            <Button size="sm" onClick={handleDownload}>
              {t("download")}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
