"use client";

import { useState } from "react";
import {
  MoreVertical,
  Edit as EditIcon,
  Trash2,
  Eye,
  Download,
} from "lucide-react";
import type { Property } from "@properlia/shared/types";
import { useT } from "@properlia/shared/components/TranslationProvider";
import { useUpdateProperty } from "@/src/services/properties/queries";
import { Button } from "@properlia/shared/components/ui";

interface PropertyActionsDropdownProps {
  property: Property;
  onFactSheetClick: (propertyId: string) => void;
}

export default function PropertyActionsDropdown({
  property,
  onFactSheetClick,
}: PropertyActionsDropdownProps) {
  const t = useT();
  const [isOpen, setIsOpen] = useState(false);
  const { mutateAsync: updateProperty } = useUpdateProperty();

  return (
    <div className="absolute bottom-4 right-3 sm:bottom-auto sm:top-4 sm:right-6">
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className="size-9"
          aria-label="Actions"
        >
          <MoreVertical className="h-5 w-5 text-brand-gray" />
        </Button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute right-0 mt-2 rounded-card shadow-overlay bg-white ring ring-input ring-opacity-5 z-50">
              <div className="flex flex-col divide-y divide-brand-border">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.location.href = `/dashboard/properties/${property.id}/edit`;
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-brand-carbon hover:bg-brand-bg first:rounded-t-md cursor-pointer"
                >
                  <EditIcon className="h-4 w-4" />
                  {t("edit")}
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.open(
                      `/dashboard/properties/${property.id}`,
                      "_blank"
                    );
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-brand-carbon hover:bg-brand-bg cursor-pointer"
                >
                  <Eye className="h-4 w-4" />
                  {t("details")}
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onFactSheetClick(property.id);
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-brand-carbon hover:bg-brand-bg cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  {t("download")}
                </button>
                <button
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (
                      confirm(
                        "Are you sure you want to suspend this property?"
                      )
                    ) {
                      try {
                        await updateProperty({
                          id: property.id,
                          data: {
                            status_id:
                              "7d4a2f8e-6c91-4b5d-a3f2-9e0c1b8a7d64",
                          },
                        });
                        setIsOpen(false);
                      } catch (error) {
                        console.error(
                          "Failed to suspend property:",
                          error
                        );
                      }
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-danger hover:bg-danger-soft last:rounded-b-md cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                  {t("suspend")}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
