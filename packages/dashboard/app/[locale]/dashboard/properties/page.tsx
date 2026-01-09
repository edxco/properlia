"use client";

import { useEffect, useMemo, useState } from "react";
import {
  X,
  Upload,
  Image as ImageIcon,
  Video as VideoIcon,
  MoreVertical,
  Edit as EditIcon,
  Trash2,
  Eye,
} from "lucide-react";
import type {
  Property,
  PropertyPayload,
  Attachment,
} from "@properlia/shared/types";

import {
  useCreateProperty,
  useProperties,
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
import { capitalizeFirstWord, formatLargeNumber, getBadge } from "@properlia/shared";

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
  description: string;
  featured: boolean;
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
  description: "",
  featured: false,
  images: [],
  videos: [],
};

export default function PropertiesPage() {
  const t = useT();
  const locale = useLocale();
  const [filters, setFilters] = useState<{ status_id?: string }>({});
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const { data, isLoading, isFetching, error } = useProperties({
    status_id: filters.status_id || undefined,
  });
  const { data: propertyTypes } = usePropertyTypes();
  const { data: statuses } = useStatuses();
  const { data: listingTypes } = useListingTypes();
  const { mutateAsync: createProperty, isPending: creating } =
    useCreateProperty();
  const { mutateAsync: updateProperty, isPending: updating } =
    useUpdateProperty();
  const { mutateAsync: deleteAttachment, isPending: deletingAttachment } =
    useDeleteAttachment();

  const properties = useMemo(() => data?.data ?? [], [data]);
  const metadata = data?.metadata;

  const totalPrice = useMemo(() => {
    return properties.reduce((sum, property) => {
      const price = Number(property.price);
      return sum + (isNaN(price) ? 0 : price);
    }, 0);
  }, [properties]);

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
        description: editingProperty.description ?? "",
        featured: editingProperty.featured ?? false,
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

  const handleFileChange = (
    field: "images" | "videos",
    files: FileList | null
  ) => {
    if (!files) return;
    const fileArray = Array.from(files);
    setForm((prev) => ({ ...prev, [field]: [...prev[field], ...fileArray] }));
  };

  const removeFile = (field: "images" | "videos", index: number) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
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
      description: form.description || undefined,
      featured: form.featured,
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
      !form.description
    ) {
      setFormError(
        "All required fields must be filled: property type, listing type, title, address, city, state, zip code, status, and description."
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
      setEditingProperty(null);
      setForm(emptyForm);
    } catch (mutationError: any) {
      setFormError(
        mutationError?.message ||
          "There was a problem saving the property. Please try again."
      );
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">
          Error loading properties: {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary uppercase">
            {t("propertiesControlPanel")}
          </h2>
          <p className="text-sm text-gray-500">
            Connected to the Rails API: list, create, and update properties.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600">{t("filterByStatus")}</label>
          <select
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            value={filters.status_id ?? ""}
            onChange={(event) =>
              setFilters((prev) => ({
                ...prev,
                status_id: event.target.value || undefined,
              }))
            }
          >
            <option value="">{capitalizeFirstWord(t("all"))}</option>
            {statuses?.map((status) => (
              <option key={status.id} value={status.id}>
                {capitalizeFirstWord(
                  locale === "es" ? status.es_name : status.name
                )}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-primary">
                {editingProperty ? t("editProperty") : t("addProperty")}
              </h3>
              {editingProperty && (
                <button
                  onClick={() => setEditingProperty(null)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  {t('cancelEdit')}
                </button>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Fill out the form to {editingProperty ? "update" : "create"} a property listing.
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
                  {t("listingType")} <span className="text-red-600">*</span>
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
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t("title")} <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(event) =>
                    handleChange("title", event.target.value)
                  }
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
                  onChange={(event) =>
                    handleChange("address", event.target.value)
                  }
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Street, number, neighborhood"
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
                    onChange={(event) =>
                      handleChange("city", event.target.value)
                    }
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
                    onChange={(event) =>
                      handleChange("state", event.target.value)
                    }
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

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t("status")} <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={form.status_id}
                    onChange={(event) =>
                      handleChange("status_id", event.target.value)
                    }
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
                    {t("markAsFeatured")}
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t("rooms")}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.rooms}
                    onChange={(event) =>
                      handleChange("rooms", event.target.value)
                    }
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
                    {t("baths")}
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
                    Half Baths
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
                      onChange={(e) =>
                        handleFileChange("images", e.target.files)
                      }
                      className="hidden"
                    />
                  </label>
                </div>

                {/* New Images Preview */}
                {form.images.length > 0 && (
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {form.images.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-full h-20 object-cover rounded border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile("images", index)}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <p className="text-xs text-gray-500 mt-1 truncate">
                          {file.name}
                        </p>
                      </div>
                    ))}
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
                    <p className="text-xs text-gray-500 mb-2">
                      Current videos:
                    </p>
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
                      onChange={(e) =>
                        handleFileChange("videos", e.target.files)
                      }
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
                className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 disabled:opacity-50"
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
        </div>

        <div className="lg:col-span-2 space-y-4">
          {/* Status Filter Submenu */}
          <div className="pb-3">
            <div className="flex items-center justify-end gap-2 overflow-x-auto">
              <button
                onClick={() => setFilters({ status_id: undefined })}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                  !filters.status_id
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {capitalizeFirstWord(t("all"))}
              </button>
              {statuses?.map((status) => (
                <button
                  key={status.id}
                  onClick={() => setFilters({ status_id: status.id })}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                    filters.status_id === status.id
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {capitalizeFirstWord(
                    locale === "es" ? status.es_name : status.name
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-visible rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  {metadata?.count ?? 0} {t("properties")}
                </p>
                <p className="text-xs text-gray-500">
                  Total: ${formatLargeNumber(totalPrice)} (${totalPrice.toLocaleString()})
                </p>
              </div>
              {metadata && (
                <div className="text-right text-xs text-gray-500">
                  Page {metadata.page} of {metadata.pages}
                </div>
              )}
            </div>

            <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
              {isLoading ? (
                <div className="flex justify-center px-6 py-12 text-gray-500">
                  Loading properties...
                </div>
              ) : properties.length ? (
                <div className="divide-y divide-gray-200">
                  {properties.map((property) => (
                    <div key={property.id} className="relative group pb-2">
                      <a
                        href={`/properties/${property.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block px-6 py-4 pr-16 hover:bg-gray-100 transition-colors"
                      >
                        <div className="space-y-2">
                          {/* Row 1: Title and Price */}
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 flex gap-1 items-center">
                              <h3 className={`font-semibold text-base ${
                                property.status_id === "7d4a2f8e-6c91-4b5d-a3f2-9e0c1b8a7d64"
                                  ? "text-gray-500"
                                  : "text-primary"
                              }`}>
                                {property.title}
                              </h3>
                                {property.status && property.status_id && (
                                  getBadge(property.status, locale)
                                )}
                                {property.featured && (
                                  <span className="ml-2 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                                    Featured
                                  </span>
                                )}
                              
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-gray-900">
                                ${Number(property.price || 0).toLocaleString()}
                              </div>
                            </div>
                          </div>

                          {/* Row 2: Location Details and Status */}
                          <div className="flex items-center justify-between gap-4 text-sm">
                            <div className="flex items-center gap-3 text-gray-600 flex-wrap">
                              {property.neighborhood && (
                                <span className="font-medium">
                                  {property.neighborhood}
                                </span>
                              )}
                              <span>•</span>
                              <span>{property.city || "—"}</span>
                              <span>•</span>
                              <span>{property.state || "—"}</span>
                              {property.zip_code && (
                                <>
                                  <span>•</span>
                                  <span>{property.zip_code}</span>
                                </>
                              )}
                            </div>
                            <div>
                              {property.property_type && property.property_type_id && (
                                getBadge(property.property_type, locale)
                              )}
                              {property.listing_type && property.listing_type_id && (
                                getBadge(property.listing_type, locale)
                              )}
                            </div>
                          </div>
                        </div>
                      </a>

                      {/* Right Column - Actions Dropdown (spans 1 column) */}
                      <div className="absolute top-4 right-6 z-30">
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setOpenDropdownId(
                                openDropdownId === property.id
                                  ? null
                                  : property.id
                              );
                            }}
                            className="p-2 hover:bg-gray-200 rounded-md transition-colors"
                            aria-label="Actions"
                          >
                            <MoreVertical className="h-5 w-5 text-gray-500" />
                          </button>

                          {openDropdownId === property.id && (
                            <>
                              <div
                                className="fixed inset-0 z-40"
                                onClick={() => setOpenDropdownId(null)}
                              />
                              <div className="absolute right-0 mt-2 rounded-md shadow-lg bg-white ring ring-gray-400 ring-opacity-5 z-50">
                                <div className="flex items-center divide-x divide-gray-400">
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setEditingProperty(property);
                                      setOpenDropdownId(null);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 first:rounded-l-md"
                                  >
                                    <EditIcon className="h-4 w-4" />
                                    {t('edit')}
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      window.open(
                                        `/properties/${property.id}`,
                                        "_blank"
                                      );
                                      setOpenDropdownId(null);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    <Eye className="h-4 w-4" />
                                    {t('details')}
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
                                              status_id: "7d4a2f8e-6c91-4b5d-a3f2-9e0c1b8a7d64"
                                            }
                                          });
                                          setOpenDropdownId(null);
                                        } catch (error) {
                                          console.error("Failed to suspend property:", error);
                                        }
                                      }
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 last:rounded-r-md"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    {t('suspend')}
                                  </button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-12 text-center text-gray-500">
                  <p className="font-medium text-gray-700">
                    No properties found
                  </p>
                  <p className="text-sm text-gray-500">
                    Use the form on the left to create your first listing.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
