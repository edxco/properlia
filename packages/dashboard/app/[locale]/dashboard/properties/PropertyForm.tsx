"use client";

import { useEffect, useState } from "react";
import {
  X,
  Upload,
  Image as ImageIcon,
  Video as VideoIcon,
} from "lucide-react";
import type {
  Property,
  PropertyPayload,
} from "@properlia/shared/types";

import {
  useCreateProperty,
  useUpdateProperty,
  useDeleteAttachment,
} from "@/src/services/properties/queries";
import { usePropertyTypes } from "@/src/services/property-types/queries";
import { useStatuses } from "@/src/services/statuses/queries";
import { useListingTypes } from "@/src/services/listing-types/queries";
import {
  useLocale,
  useT,
} from "@properlia/shared/components/TranslationProvider";
import { capitalizeFirstWord } from "@properlia/shared";

type FormState = {
  title: string;
  address: string;
  price: string;
  property_type_id: string;
  status_id: string;
  listing_type_id: string;
  city: string;
  state: string;
  zip_code: string;
  neighborhood: string;
  rooms: string;
  bathrooms: string;
  half_bathrooms: string;
  parking_spaces: string;
  land_area: string;
  built_area: string;
  description: string;
  featured: boolean;
  exclusive_listing: boolean;
  images: File[];
  videos: File[];
};

const emptyForm: FormState = {
  title: "",
  address: "",
  price: "",
  property_type_id: "",
  status_id: "",
  listing_type_id: "",
  city: "",
  state: "",
  zip_code: "",
  neighborhood: "",
  rooms: "",
  bathrooms: "",
  half_bathrooms: "",
  parking_spaces: "",
  land_area: "",
  built_area: "",
  description: "",
  featured: false,
  exclusive_listing: true,
  images: [],
  videos: [],
};

interface PropertyFormProps {
  editingProperty: Property | null;
  onCancelEdit: () => void;
}

export default function PropertyForm({
  editingProperty,
  onCancelEdit,
}: PropertyFormProps) {
  const t = useT();
  const locale = useLocale();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const { data: propertyTypes } = usePropertyTypes();
  const { data: statuses } = useStatuses();
  const { data: listingTypes } = useListingTypes();
  const { mutateAsync: createProperty, isPending: creating } =
    useCreateProperty();
  const { mutateAsync: updateProperty, isPending: updating } =
    useUpdateProperty();
  const { mutateAsync: deleteAttachment, isPending: deletingAttachment } =
    useDeleteAttachment();

  useEffect(() => {
    if (editingProperty) {
      setForm({
        title: editingProperty.title ?? "",
        address: editingProperty.address ?? "",
        price: editingProperty.price?.toLocaleString() ?? "",
        property_type_id: editingProperty.property_type_id ?? "",
        status_id: editingProperty.status_id ?? "",
        listing_type_id: editingProperty.listing_type_id ?? "",
        city: editingProperty.city ?? "",
        state: editingProperty.state ?? "",
        zip_code: editingProperty.zip_code ?? "",
        neighborhood: editingProperty.neighborhood ?? "",
        rooms: editingProperty.rooms?.toString() ?? "",
        bathrooms: editingProperty.bathrooms?.toString() ?? "",
        half_bathrooms: editingProperty.half_bathrooms?.toString() ?? "",
        parking_spaces: editingProperty.parking_spaces?.toString() ?? "",
        land_area: editingProperty.land_area?.toString() ?? "",
        built_area: editingProperty.built_area?.toString() ?? "",
        description: editingProperty.description ?? "",
        featured: editingProperty.featured ?? false,
        exclusive_listing: editingProperty.exclusive_listing ?? true,
        images: [],
        videos: [],
      });
    } else {
      setForm(emptyForm);
    }
  }, [editingProperty]);

  const handleChange = (
    field: keyof FormState,
    value: string | boolean | File[]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePriceChange = (value: string) => {
    // Remove non-numeric characters except decimal point
    const numericValue = value.replace(/[^\d.]/g, "");
    // Split into integer and decimal parts
    const parts = numericValue.split(".");
    // Format integer part with commas
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    // Rejoin with decimal part if it exists
    const formatted = parts.length > 1 ? parts.slice(0, 2).join(".") : parts[0];
    setForm((prev) => ({ ...prev, price: formatted }));
  };

  // Convert WebP image to PNG
  const convertWebPToPNG = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;

        if (ctx) {
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            if (blob) {
              // Create new File from blob with .png extension
              const pngFile = new File(
                [blob],
                file.name.replace(/\.webp$/i, '.png'),
                { type: 'image/png' }
              );
              resolve(pngFile);
            } else {
              reject(new Error('Failed to convert image to PNG'));
            }
          }, 'image/png', 0.95); // 95% quality
        } else {
          reject(new Error('Canvas context not available'));
        }
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileChange = async (
    field: "images" | "videos",
    files: FileList | null
  ) => {
    if (!files) return;
    const fileArray = Array.from(files);

    // For images, check for WebP and convert to PNG
    if (field === "images") {
      const processedFiles: File[] = [];

      for (const file of fileArray) {
        if (file.type === 'image/webp') {
          try {
            const pngFile = await convertWebPToPNG(file);
            processedFiles.push(pngFile);
          } catch (error) {
            console.error('Failed to convert WebP to PNG:', error);
            // If conversion fails, keep the original file
            processedFiles.push(file);
          }
        } else {
          processedFiles.push(file);
        }
      }

      setForm((prev) => ({ ...prev, [field]: [...prev[field], ...processedFiles] }));
    } else {
      // For videos, no conversion needed
      setForm((prev) => ({ ...prev, [field]: [...prev[field], ...fileArray] }));
    }
  };

  const removeFile = (field: "images" | "videos", index: number) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  // Image reordering handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", index.toString());
    // Prevent image from being dragged
    e.dataTransfer.setDragImage(e.currentTarget, 0, 0);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    // Only clear if we're leaving the container, not a child element
    if (e.currentTarget === e.target) {
      setDragOverIndex(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation();

    const dragIndex = draggedIndex !== null ? draggedIndex : parseInt(e.dataTransfer.getData("text/html"));

    if (dragIndex === dropIndex || dragIndex === null) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    setForm((prev) => {
      const newImages = [...prev.images];
      const [removed] = newImages.splice(dragIndex, 1);
      newImages.splice(dropIndex, 0, removed);
      return { ...prev, images: newImages };
    });

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!editingProperty) return;
    try {
      await deleteAttachment({ propertyId: editingProperty.id, attachmentId });
    } catch (error: any) {
      setFormError(error?.message || "Failed to delete attachment");
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const payload: PropertyPayload = {
      title: form.title.trim(),
      address: form.address.trim(),
      price: parseFloat(form.price.replace(/,/g, "")) || 0,
      property_type_id: form.property_type_id,
      status_id: form.status_id || undefined,
      listing_type_id: form.listing_type_id,
      city: form.city || undefined,
      state: form.state || undefined,
      zip_code: form.zip_code || undefined,
      neighborhood: form.neighborhood || undefined,
      rooms: form.rooms ? Number(form.rooms) : undefined,
      bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
      half_bathrooms: form.half_bathrooms
        ? Number(form.half_bathrooms)
        : undefined,
      parking_spaces: form.parking_spaces
        ? Number(form.parking_spaces)
        : undefined,
      land_area: form.land_area ? Number(form.land_area) : undefined,
      built_area: form.built_area ? Number(form.built_area) : undefined,
      description: form.description || undefined,
      featured: form.featured,
      exclusive_listing: form.exclusive_listing,
      images: form.images.length > 0 ? form.images : undefined,
      videos: form.videos.length > 0 ? form.videos : undefined,
    };

    // Validate required fields
    if (
      !payload.title ||
      !payload.address ||
      !payload.property_type_id ||
      !payload.listing_type_id ||
      !form.city ||
      !form.state ||
      !form.zip_code ||
      !form.status_id ||
      !form.land_area ||
      !form.description
    ) {
      setFormError(
        "All required fields must be filled: property type, listing type, title, address, city, state, zip code, status, land area, and description."
      );
      return;
    }

    if (!form.price || Number.isNaN(payload.price) || payload.price <= 0) {
      setFormError("Price must be greater than 0.");
      return;
    }

    // Validate images for new properties
    if (!editingProperty && form.images.length === 0) {
      setFormError("At least one image is required.");
      return;
    }

    try {
      if (editingProperty) {
        await updateProperty({ id: editingProperty.id, data: payload });
      } else {
        await createProperty(payload);
      }
      onCancelEdit();
      setForm(emptyForm);
    } catch (mutationError: any) {
      setFormError(
        mutationError?.message ||
          "There was a problem saving the property. Please try again."
      );
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-primary">
          {editingProperty ? t("editProperty") : t("addProperty")}
        </h3>
        {editingProperty && (
          <button
            onClick={onCancelEdit}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            {t("cancelEdit")}
          </button>
        )}
      </div>
      <p className="mt-1 text-sm text-gray-500">
        {editingProperty ? t("updateForm") : t("createForm")}
      </p>

      {formError && (
        <div className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t("propertyType")} <span className="text-red-600">*</span>
          </label>
          <select
            value={form.property_type_id}
            onChange={(event) =>
              handleChange("property_type_id", event.target.value)
            }
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            required
          >
            <option value="">{t("select")}</option>
            {propertyTypes?.map((type) => (
              <option key={type.id} value={type.id}>
                {capitalizeFirstWord(
                  locale === "es" ? type.es_name : type.name
                )}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {capitalizeFirstWord(t("listingType"))}{" "}
            <span className="text-red-600">*</span>
          </label>
          <select
            value={form.listing_type_id}
            onChange={(event) =>
              handleChange("listing_type_id", event.target.value)
            }
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            required
          >
            <option value="">{t("select")}</option>
            {listingTypes?.map((type) => (
              <option key={type.id} value={type.id}>
                {capitalizeFirstWord(
                  locale === "es" ? type.es_name : type.name
                )}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 items-center">
          <div className="flex items-center gap-2 pt-6">
            <input
              id="featured"
              type="checkbox"
              checked={form.featured}
              onChange={(event) =>
                handleChange("featured", event.target.checked)
              }
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="featured" className="text-sm text-gray-700">
              {t("featured")}
            </label>
          </div>
          <div className="flex items-center gap-2 pt-6">
            <input
              id="exclusive_listing"
              type="checkbox"
              checked={form.exclusive_listing}
              onChange={(event) =>
                handleChange("exclusive_listing", event.target.checked)
              }
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label
              htmlFor="exclusive_listing"
              className="text-sm text-gray-700"
            >
              {t("exclusiveListing")}
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t("title")} <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(event) => handleChange("title", event.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder={t("modernApartmentInLomas")}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t("address")} <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            value={form.address}
            onChange={(event) => handleChange("address", event.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder={t('streetNumberNeighborhood')}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t("neighborhood")}
          </label>
          <input
            type="text"
            value={form.neighborhood}
            onChange={(event) =>
              handleChange("neighborhood", event.target.value)
            }
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder={t("neighborhood")}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t("city")} <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={form.city}
              onChange={(event) => handleChange("city", event.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="City"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t("state")} <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={form.state}
              onChange={(event) => handleChange("state", event.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="State"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t("zipCode")} <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={form.zip_code}
              onChange={(event) =>
                handleChange("zip_code", event.target.value)
              }
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="78640"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t("price")} <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={form.price}
              onChange={(event) => handlePriceChange(event.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="5,000,000"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t("status")} <span className="text-red-600">*</span>
          </label>
          <select
            value={form.status_id}
            onChange={(event) => handleChange("status_id", event.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            required
          >
            <option value="">{t("select")}</option>
            {statuses?.map((status) => (
              <option key={status.id} value={status.id}>
                {capitalizeFirstWord(
                  locale === "es" ? status.es_name : status.name
                )}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {capitalizeFirstWord(t("rooms"))}
            </label>
            <input
              type="number"
              min={0}
              value={form.rooms}
              onChange={(event) => handleChange("rooms", event.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t("parking")}
            </label>
            <input
              type="number"
              min={0}
              value={form.parking_spaces}
              onChange={(event) =>
                handleChange("parking_spaces", event.target.value)
              }
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {capitalizeFirstWord(t("baths"))}
            </label>
            <input
              type="number"
              min={0}
              value={form.bathrooms}
              onChange={(event) =>
                handleChange("bathrooms", event.target.value)
              }
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {capitalizeFirstWord(t("guestBath"))}
            </label>
            <input
              type="number"
              min={0}
              value={form.half_bathrooms}
              onChange={(event) =>
                handleChange("half_bathrooms", event.target.value)
              }
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {capitalizeFirstWord(t("landArea_m2"))}<span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={form.land_area}
              onChange={(event) =>
                handleChange("land_area", event.target.value)
              }
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {capitalizeFirstWord(t("builtArea_m2"))}
            </label>
            <input
              type="number"
              min={0}
              step="0.01"
              value={form.built_area}
              onChange={(event) =>
                handleChange("built_area", event.target.value)
              }
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t("description")} <span className="text-red-600">*</span>
          </label>
          <textarea
            value={form.description}
            onChange={(event) =>
              handleChange("description", event.target.value)
            }
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            rows={3}
            placeholder={t("keyHighlightsForThisListing")}
            required
          />
        </div>

        {/* Images Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <ImageIcon className="inline h-4 w-4 mr-1" />
            Images <span className="text-red-600">*</span>
          </label>

          {/* Existing Images */}
          {editingProperty && editingProperty.images.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-2">
                {t("currentImages")}:
              </p>
              <div className="grid grid-cols-3 gap-2">
                {editingProperty.images.map((img) => (
                  <div key={img.id} className="relative group">
                    <img
                      src={img.url}
                      alt={img.filename}
                      className="w-full h-20 object-cover rounded border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteAttachment(img.id)}
                      disabled={deletingAttachment}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 disabled:opacity-50"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Images Upload */}
          <div className="flex items-center gap-2">
            <label className="flex-1 cursor-pointer">
              <div className="flex items-center justify-center gap-2 rounded-md border-2 border-dashed border-gray-300 px-4 py-3 text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors">
                <Upload className="h-4 w-4" />
                <span>{t("uploadImages")}</span>
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleFileChange("images", e.target.files)}
                className="hidden"
              />
            </label>
          </div>

          {/* New Images Preview */}
          {form.images.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-gray-500 mb-2">
                Drag to reorder images (first image will be the cover)
              </p>
              <div className="grid grid-cols-3 gap-2">
                {form.images.map((file, index) => {
                  const isDragging = draggedIndex === index;
                  const isDropTarget = dragOverIndex === index;

                  return (
                    <div
                      key={index}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragEnd={handleDragEnd}
                      onDragEnter={(e) => handleDragEnter(e, index)}
                      onDragLeave={handleDragLeave}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index)}
                      className={`relative group cursor-grab active:cursor-grabbing transition-all ${
                        isDragging ? "opacity-40 scale-95" : "opacity-100"
                      } ${
                        isDropTarget ? "ring-2 ring-blue-500 ring-offset-2" : ""
                      }`}
                    >
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-full h-20 object-cover rounded border border-gray-200 pointer-events-none select-none"
                        draggable={false}
                      />
                      {index === 0 && (
                        <div className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs px-2 py-0.5 rounded pointer-events-none">
                          Cover
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeFile("images", index)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 z-10"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      <p className="text-xs text-gray-500 mt-1 truncate pointer-events-none">
                        {file.name}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Videos Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <VideoIcon className="inline h-4 w-4 mr-1" />
            Videos
          </label>

          {/* Existing Videos */}
          {editingProperty && editingProperty.videos.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-2">Current videos:</p>
              <div className="space-y-2">
                {editingProperty.videos.map((video) => (
                  <div
                    key={video.id}
                    className="flex items-center justify-between gap-2 p-2 bg-gray-50 rounded border border-gray-200"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <VideoIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span className="text-sm text-gray-700 truncate">
                        {video.filename}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteAttachment(video.id)}
                      disabled={deletingAttachment}
                      className="flex-shrink-0 text-red-600 hover:text-red-700 disabled:opacity-50"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Videos Upload */}
          <div className="flex items-center gap-2">
            <label className="flex-1 cursor-pointer">
              <div className="flex items-center justify-center gap-2 rounded-md border-2 border-dashed border-gray-300 px-4 py-3 text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors">
                <Upload className="h-4 w-4" />
                <span>{t("uploadVideos")}</span>
              </div>
              <input
                type="file"
                accept="video/*"
                multiple
                onChange={(e) => handleFileChange("videos", e.target.files)}
                className="hidden"
              />
            </label>
          </div>

          {/* New Videos Preview */}
          {form.videos.length > 0 && (
            <div className="mt-2 space-y-2">
              {form.videos.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-2 p-2 bg-blue-50 rounded border border-blue-200"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <VideoIcon className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile("videos", index)}
                    className="flex-shrink-0 text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-primary cursor-pointer px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 disabled:opacity-50"
          disabled={creating || updating}
        >
          {creating || updating
            ? "Saving..."
            : editingProperty
            ? t("updateProperty")
            : t("createProperty")}
        </button>
      </form>
    </div>
  );
}
