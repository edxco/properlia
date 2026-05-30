"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Upload,
  Image as ImageIcon,
  Video as VideoIcon,
  Check,
} from "lucide-react";
import type { Attachment, Property, PropertyPayload } from "@properlia/shared/types";

import {
  useCreateProperty,
  useUpdateProperty,
  useDeleteAttachment,
  useReorderImages,
} from "@/src/services/properties/queries";
import { usePropertyTypes } from "@/src/services/property-types/queries";
import { useStatuses } from "@/src/services/statuses/queries";
import { useListingTypes } from "@/src/services/listing-types/queries";
import { usePropertyFeatures } from "@/src/services/property-features/queries";
import {
  useLocale,
  useT,
} from "@properlia/shared/components/TranslationProvider";
import { PriceInput } from "@properlia/shared/components";
import {
  capitalizeFirstWord,
  getAbsoluteImageUrl,
  formatPriceInput,
} from "@properlia/shared";
import PreviewPDF from "./[id]/previewPDF";

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
  property_category_ids: string[];
  property_feature_ids: string[];
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
  property_category_ids: [],
  property_feature_ids: [],
  images: [],
  videos: [],
};

interface NewImageCardProps {
  index: number;
  file: File;
  objectUrl: string;
  isDragging: boolean;
  isDropTarget: boolean;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  onDragEnd: () => void;
  onDragEnter: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  onRemove: (index: number) => void;
}

const NewImageCard = memo(function NewImageCard({
  index,
  file,
  objectUrl,
  isDragging,
  isDropTarget,
  onDragStart,
  onDragEnd,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onRemove,
}: NewImageCardProps) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragEnd={onDragEnd}
      onDragEnter={(e) => onDragEnter(e, index)}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, index)}
      className={`relative group cursor-grab active:cursor-grabbing transition-all ${
        isDragging ? "opacity-40 scale-95" : "opacity-100"
      } ${isDropTarget ? "ring-2 ring-blue-500 ring-offset-2" : ""}`}
    >
      <img
        src={objectUrl}
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
        onClick={() => onRemove(index)}
        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 z-10"
      >
        <X className="h-3 w-3" />
      </button>
      <p className="text-xs text-gray-500 mt-1 truncate pointer-events-none">
        {file.name}
      </p>
    </div>
  );
});

interface ExistingImageCardProps {
  index: number;
  image: Attachment;
  isDragging: boolean;
  isDropTarget: boolean;
  deletingAttachment: boolean;
  reorderingImages: boolean;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  onDragEnd: () => void;
  onDragEnter: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, index: number) => void;
  onDelete: (id: string) => void;
}

const ExistingImageCard = memo(function ExistingImageCard({
  index,
  image,
  isDragging,
  isDropTarget,
  deletingAttachment,
  reorderingImages,
  onDragStart,
  onDragEnd,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onDelete,
}: ExistingImageCardProps) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragEnd={onDragEnd}
      onDragEnter={(e) => onDragEnter(e, index)}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, index)}
      className={`relative group cursor-grab active:cursor-grabbing transition-all ${
        isDragging ? "opacity-40 scale-95" : "opacity-100"
      } ${isDropTarget ? "ring-2 ring-blue-500 ring-offset-2" : ""}`}
    >
      <img
        src={getAbsoluteImageUrl(image.url)}
        alt={image.filename}
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
        onClick={() => onDelete(image.id)}
        disabled={deletingAttachment || reorderingImages}
        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 disabled:opacity-50 z-10"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
});

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
  const router = useRouter();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isDroppingImages, setIsDroppingImages] = useState(false);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const [deletedAttachmentIds, setDeletedAttachmentIds] = useState<Set<string>>(
    new Set()
  );
  // State for existing images order (for drag-and-drop reordering)
  const [existingImageOrder, setExistingImageOrder] = useState<string[]>([]);
  const [existingDraggedIndex, setExistingDraggedIndex] = useState<
    number | null
  >(null);
  const [existingDragOverIndex, setExistingDragOverIndex] = useState<
    number | null
  >(null);

  const [featureSearch, setFeatureSearch] = useState("");
  const [featureOpen, setFeatureOpen] = useState(false);
  const featureRef = useRef<HTMLDivElement>(null);
  const draggedIndexRef = useRef<number | null>(null);
  const existingDraggedIndexRef = useRef<number | null>(null);

  const objectUrlCacheRef = useRef<Map<File, string>>(new Map());

  const getObjectUrl = useCallback((file: File): string => {
    const cache = objectUrlCacheRef.current;
    if (!cache.has(file)) cache.set(file, URL.createObjectURL(file));
    return cache.get(file)!;
  }, []);

  useEffect(() => {
    const cache = objectUrlCacheRef.current;
    const current = new Set(form.images);
    for (const [file, url] of cache.entries()) {
      if (!current.has(file)) {
        URL.revokeObjectURL(url);
        cache.delete(file);
      }
    }
  }, [form.images]);

  useEffect(() => {
    const cache = objectUrlCacheRef.current;
    return () => {
      for (const url of cache.values()) URL.revokeObjectURL(url);
      cache.clear();
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        featureRef.current &&
        !featureRef.current.contains(e.target as Node)
      ) {
        setFeatureOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const { data: propertyTypes } = usePropertyTypes();
  const { data: statuses } = useStatuses();
  const { data: listingTypes } = useListingTypes();
  const { data: propertyFeatures } = usePropertyFeatures();
  const { mutateAsync: createProperty, isPending: creating } =
    useCreateProperty();
  const { mutateAsync: updateProperty, isPending: updating } =
    useUpdateProperty();
  const { mutateAsync: deleteAttachment, isPending: deletingAttachment } =
    useDeleteAttachment();
  const { mutateAsync: reorderImages, isPending: reorderingImages } =
    useReorderImages();

  useEffect(() => {
    // Reset deleted attachments and existing image order when property changes
    setDeletedAttachmentIds(new Set());
    setExistingImageOrder(editingProperty?.images.map((img) => img.id) ?? []);

    if (editingProperty) {
      // Get existing category IDs from the property
      let categoryIds =
        editingProperty.property_categories?.map((c) => c.id) ?? [];

      // If no categories assigned, auto-assign if property type has exactly one category
      if (
        categoryIds.length === 0 &&
        editingProperty.property_type_id &&
        propertyTypes
      ) {
        const propertyType = propertyTypes.find(
          (pt) => pt.id === editingProperty.property_type_id
        );
        const availableCategories = propertyType?.property_categories ?? [];
        if (availableCategories.length === 1) {
          categoryIds = [availableCategories[0].id];
        }
      }

      setForm({
        title: editingProperty.title ?? "",
        address: editingProperty.address ?? "",
        price: editingProperty.price
          ? formatPriceInput(editingProperty.price.toString())
          : "",
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
        property_category_ids: categoryIds,
        property_feature_ids:
          editingProperty.property_features?.map((f) => f.id) ?? [],
        images: [],
        videos: [],
      });
    } else {
      // Set default status to "active" when creating a new property
      const activeStatus = statuses?.find(
        (s) => s.name.toLowerCase() === "active"
      );
      setForm({
        ...emptyForm,
        status_id: activeStatus?.id ?? "",
      });
    }
  }, [editingProperty, propertyTypes, statuses]);

  const handleChange = (
    field: keyof FormState,
    value: string | boolean | File[] | string[]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Convert WebP image to PNG
  const convertWebPToPNG = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;

        if (ctx) {
          ctx.drawImage(img, 0, 0);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                // Create new File from blob with .png extension
                const pngFile = new File(
                  [blob],
                  file.name.replace(/\.webp$/i, ".png"),
                  { type: "image/png" }
                );
                resolve(pngFile);
              } else {
                reject(new Error("Failed to convert image to PNG"));
              }
            },
            "image/png",
            0.95
          ); // 95% quality
        } else {
          reject(new Error("Canvas context not available"));
        }
      };

      img.onerror = () => {
        reject(new Error("Failed to load image"));
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
        if (file.type === "image/webp") {
          try {
            const pngFile = await convertWebPToPNG(file);
            processedFiles.push(pngFile);
          } catch (error) {
            console.error("Failed to convert WebP to PNG:", error);
            // If conversion fails, keep the original file
            processedFiles.push(file);
          }
        } else {
          processedFiles.push(file);
        }
      }

      setForm((prev) => ({
        ...prev,
        [field]: [...prev[field], ...processedFiles],
      }));
    } else {
      // For videos, no conversion needed
      setForm((prev) => ({ ...prev, [field]: [...prev[field], ...fileArray] }));
    }
  };

  const removeFile = useCallback((field: "images" | "videos", index: number) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  }, []);

  const handleRemoveNewImage = useCallback((index: number) => {
    removeFile("images", index);
  }, [removeFile]);

  // Image reordering handlers
  const handleDragStart = useCallback((
    e: React.DragEvent<HTMLDivElement>,
    index: number
  ) => {
    draggedIndexRef.current = index;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", index.toString());
    e.dataTransfer.setDragImage(e.currentTarget, 0, 0);
  }, []);

  const handleDragEnd = useCallback(() => {
    draggedIndexRef.current = null;
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, []);

  const handleDragEnter = useCallback((
    e: React.DragEvent<HTMLDivElement>,
    index: number
  ) => {
    e.preventDefault();
    if (draggedIndexRef.current !== null && draggedIndexRef.current !== index) {
      setDragOverIndex(index);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.currentTarget === e.target) {
      setDragOverIndex(null);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback((
    e: React.DragEvent<HTMLDivElement>,
    dropIndex: number
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const dragIndex =
      draggedIndexRef.current !== null
        ? draggedIndexRef.current
        : parseInt(e.dataTransfer.getData("text/html"));

    if (dragIndex === dropIndex || draggedIndexRef.current === null) {
      draggedIndexRef.current = null;
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

    draggedIndexRef.current = null;
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, []);

  // Existing images reordering handlers
  const handleExistingDragStart = useCallback((
    e: React.DragEvent<HTMLDivElement>,
    index: number
  ) => {
    existingDraggedIndexRef.current = index;
    setExistingDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", index.toString());
    e.dataTransfer.setDragImage(e.currentTarget, 0, 0);
  }, []);

  const handleExistingDragEnd = useCallback(() => {
    existingDraggedIndexRef.current = null;
    setExistingDraggedIndex(null);
    setExistingDragOverIndex(null);
  }, []);

  const handleExistingDragEnter = useCallback((
    e: React.DragEvent<HTMLDivElement>,
    index: number
  ) => {
    e.preventDefault();
    if (existingDraggedIndexRef.current !== null && existingDraggedIndexRef.current !== index) {
      setExistingDragOverIndex(index);
    }
  }, []);

  const handleExistingDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.currentTarget === e.target) {
      setExistingDragOverIndex(null);
    }
  }, []);

  const handleExistingDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleExistingDrop = useCallback(async (
    e: React.DragEvent<HTMLDivElement>,
    dropIndex: number
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const dragIndex =
      existingDraggedIndexRef.current !== null
        ? existingDraggedIndexRef.current
        : parseInt(e.dataTransfer.getData("text/html"));

    if (dragIndex === dropIndex || existingDraggedIndexRef.current === null || !editingProperty) {
      existingDraggedIndexRef.current = null;
      setExistingDraggedIndex(null);
      setExistingDragOverIndex(null);
      return;
    }

    existingDraggedIndexRef.current = null;
    setExistingDraggedIndex(null);
    setExistingDragOverIndex(null);

    let newOrder: string[] = [];
    setExistingImageOrder((prev) => {
      const updated = [...prev];
      const [removed] = updated.splice(dragIndex, 1);
      updated.splice(dropIndex, 0, removed);
      newOrder = updated;
      return updated;
    });

    try {
      await reorderImages({
        propertyId: editingProperty.id,
        imageIds: newOrder,
      });
    } catch (error: any) {
      setExistingImageOrder(editingProperty.images.map((img) => img.id));
      setFormError(error?.message || "Failed to reorder images");
    }
  }, [editingProperty, reorderImages]);

  const visibleExistingImages = useMemo(
    () => existingImageOrder.filter((id) => !deletedAttachmentIds.has(id)),
    [existingImageOrder, deletedAttachmentIds]
  );

  const visibleExistingAttachments = useMemo(
    () =>
      visibleExistingImages
        .map((id) => editingProperty?.images.find((i) => i.id === id) ?? null)
        .filter((img): img is Attachment => img !== null),
    [visibleExistingImages, editingProperty]
  );

  const totalImages = visibleExistingImages.length + form.images.length;

  const handleDeleteAllImages = async () => {
    setForm((prev) => ({ ...prev, images: [] }));
    if (editingProperty && visibleExistingImages.length > 0) {
      await Promise.all(
        visibleExistingImages.map((id) =>
          deleteAttachment({ propertyId: editingProperty.id, attachmentId: id })
        )
      );
      setDeletedAttachmentIds(
        (prev) => new Set([...prev, ...visibleExistingImages])
      );
      setExistingImageOrder([]);
    }
    setConfirmDeleteAll(false);
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!editingProperty) return;
    try {
      await deleteAttachment({ propertyId: editingProperty.id, attachmentId });
      // Track the deleted attachment locally so the UI updates immediately
      setDeletedAttachmentIds((prev) => new Set(prev).add(attachmentId));
      // Also remove from the existing image order
      setExistingImageOrder((prev) => prev.filter((id) => id !== attachmentId));
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
      price: parseInt(form.price.replace(/,/g, ""), 10) || 0,
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
      property_category_ids:
        form.property_category_ids.length > 0
          ? form.property_category_ids
          : undefined,
      property_feature_ids:
        form.property_feature_ids.length > 0
          ? form.property_feature_ids
          : undefined,
      images: form.images.length > 0 ? form.images : undefined,
      videos: form.videos.length > 0 ? form.videos : undefined,
    };

    // Validate required fields
    if (
      !payload.title ||
      !payload.address ||
      !payload.price ||
      !payload.neighborhood ||
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

    // Validate property categories for property types with multiple categories (e.g., land)
    const selectedPropertyType = propertyTypes?.find(
      (pt) => pt.id === form.property_type_id
    );
    const availableCategories = selectedPropertyType?.property_categories ?? [];
    if (
      availableCategories.length > 1 &&
      form.property_category_ids.length === 0
    ) {
      setFormError("Please select at least one property category.");
      return;
    }

    // Validate images for new properties
    if (!editingProperty && form.images.length === 0) {
      setFormError("At least one image is required.");
      return;
    }

    try {
      let property;
      if (editingProperty) {
        property = await updateProperty({
          id: editingProperty.id,
          data: payload,
        });
      } else {
        property = await createProperty(payload);
      }
      router.push(`/dashboard/properties/${property.id}`);
    } catch (mutationError: any) {
      setFormError(
        mutationError?.message ||
          "There was a problem saving the property. Please try again."
      );
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between content-center">
        <div className="m-none">
          <h3 className="text-lg font-semibold text-primary">
            {editingProperty ? t("editProperty") : t("addProperty")}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {editingProperty ? t("updateForm") : t("createForm")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleChange("featured", !form.featured)}
            className={`cursor-pointer relative px-3 py-1.5 text-sm font-medium rounded-md border transition-colors ${
              form.featured
                ? "bg-blue-100 text-blue-700 border-blue-300"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            {form.featured && (
              <span className="absolute -top-1.5 -right-1.5 bg-green-500 rounded-full p-0.5">
                <Check className="h-2.5 w-2.5 text-white" />
              </span>
            )}
            {t("featured")}
          </button>
          <button
            type="button"
            onClick={() =>
              handleChange("exclusive_listing", !form.exclusive_listing)
            }
            className={`cursor-pointer relative px-3 py-1.5 text-sm font-medium rounded-md border transition-colors ${
              form.exclusive_listing
                ? "bg-blue-100 text-blue-700 border-blue-300"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            {form.exclusive_listing && (
              <span className="absolute -top-1.5 -right-1.5 bg-green-500 rounded-full p-0.5">
                <Check className="h-2.5 w-2.5 text-white" />
              </span>
            )}
            {t("exclusiveListing")}
          </button>
          {editingProperty && (
            <button
              onClick={onCancelEdit}
              className="cursor-pointer  relative px-3 py-1.5 text-sm rounded-md border transition-colors bg-red-400 text-white border-gray-400"
            >
              {t("cancelEdit")}
            </button>
          )}
        </div>
      </div>

      {formError && (
        <div className="mt-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t("propertyType")} <span className="text-red-600">*</span>
            </label>
            <select
              value={form.property_type_id}
              onChange={(event) => {
                const newPropertyTypeId = event.target.value;
                handleChange("property_type_id", newPropertyTypeId);
                // Update property categories when property type changes
                const newPropertyType = propertyTypes?.find(
                  (pt) => pt.id === newPropertyTypeId
                );
                const newCategories =
                  newPropertyType?.property_categories ?? [];
                if (newCategories.length === 1) {
                  // Auto-assign the single category
                  handleChange("property_category_ids", [newCategories[0].id]);
                } else if (newCategories.length > 1) {
                  // Clear categories if new type has multiple categories (user must select)
                  handleChange("property_category_ids", []);
                } else {
                  // No categories available
                  handleChange("property_category_ids", []);
                }
              }}
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
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 items-center my-6">
          {/* Property Categories - shown only when land is selected and not editing */}
          {(() => {
            const selectedPropertyType = propertyTypes?.find(
              (pt) => pt.id === form.property_type_id
            );
            const categories = selectedPropertyType?.property_categories ?? [];

            if (categories.length > 1) {
              return (
                <div className="flex flex-wrap content-center items-center gap-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {t("propertyCategory")}{" "}
                    <span className="text-red-600">*</span>
                  </label>
                  <div className="flex gap-4">
                    {categories.map((category) => {
                      const isSelected = form.property_category_ids.includes(
                        category.id
                      );
                      return (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => {
                            const newIds = isSelected
                              ? form.property_category_ids.filter(
                                  (id) => id !== category.id
                                )
                              : [...form.property_category_ids, category.id];
                            handleChange("property_category_ids", newIds);
                          }}
                          className={`relative px-3 py-1.5 text-sm font-medium rounded-md border transition-colors ${
                            isSelected
                              ? "bg-blue-100 text-blue-700 border-blue-300"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {isSelected && (
                            <span className="absolute -top-1.5 -right-1.5 bg-green-500 rounded-full p-0.5">
                              <Check className="h-2.5 w-2.5 text-white" />
                            </span>
                          )}
                          {capitalizeFirstWord(
                            locale === "es" ? category.es_name : category.name
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            }
            return null;
          })()}
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
            {t("address")}
          </label>
          <input
            type="text"
            value={form.address}
            onChange={(event) => handleChange("address", event.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            placeholder={t("streetNumberNeighborhood")}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t("neighborhood")} <span className="text-red-600">*</span>
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
              onChange={(event) => handleChange("zip_code", event.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="78640"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t("price")} <span className="text-red-600">*</span>
            </label>
            <PriceInput
              value={form.price}
              onChange={(formatted) => handleChange("price", formatted)}
              wrapperClassName="mt-1"
              className="w-full rounded-md border border-gray-300 pl-7 pr-3 py-2 text-sm"
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
              {capitalizeFirstWord(t("landArea_m2"))}
              <span className="text-red-600">*</span>
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

        {/* Property Features */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("propertyFeatures")}
          </label>
          <div ref={featureRef} className="relative">
            <input
              type="text"
              value={featureSearch}
              onChange={(e) => {
                setFeatureSearch(e.target.value);
                setFeatureOpen(true);
              }}
              onFocus={() => setFeatureOpen(true)}
              placeholder={t("select")}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
            />
            {featureOpen && (
              <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg text-sm">
                {propertyFeatures
                  ?.filter((feature) => {
                    if (form.property_feature_ids.includes(feature.id))
                      return false;
                    const name =
                      (locale === "es" ? feature.es_name : feature.name) ?? "";
                    return name
                      .toLowerCase()
                      .includes(featureSearch.toLowerCase());
                  })
                  .sort((a, b) => {
                    const nameA = (locale === "es" ? a.es_name : a.name) ?? "";
                    const nameB = (locale === "es" ? b.es_name : b.name) ?? "";
                    return nameA.localeCompare(nameB);
                  })
                  .map((feature) => (
                    <li
                      key={feature.id}
                      onMouseDown={() => {
                        handleChange("property_feature_ids", [
                          ...form.property_feature_ids,
                          feature.id,
                        ]);
                        setFeatureSearch("");
                        setFeatureOpen(false);
                      }}
                      className="cursor-pointer px-3 py-2 hover:bg-blue-50"
                    >
                      {capitalizeFirstWord(
                        locale === "es" ? feature.es_name : feature.name
                      )}
                    </li>
                  ))}
              </ul>
            )}
          </div>

          {/* Selected Features Pills */}
          {form.property_feature_ids.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {[...form.property_feature_ids]
                .sort((a, b) => {
                  const featureA = propertyFeatures?.find((f) => f.id === a);
                  const featureB = propertyFeatures?.find((f) => f.id === b);
                  const nameA =
                    (locale === "es" ? featureA?.es_name : featureA?.name) ??
                    "";
                  const nameB =
                    (locale === "es" ? featureB?.es_name : featureB?.name) ??
                    "";
                  return nameA.localeCompare(nameB);
                })
                .map((featureId) => {
                  const feature = propertyFeatures?.find(
                    (f) => f.id === featureId
                  );
                  if (!feature) return null;
                  return (
                    <span
                      key={featureId}
                      className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
                    >
                      {capitalizeFirstWord(
                        locale === "es" ? feature.es_name : feature.name
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          handleChange(
                            "property_feature_ids",
                            form.property_feature_ids.filter(
                              (id) => id !== featureId
                            )
                          )
                        }
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  );
                })}
            </div>
          )}
        </div>

        {/* Images Upload */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              <ImageIcon className="inline h-4 w-4 mr-1" />
              Images <span className="text-red-600">*</span>
            </label>
            {totalImages > 1 &&
              (confirmDeleteAll ? (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-600">
                    {t("deleteAllConfirmation")}
                  </span>
                  <button
                    type="button"
                    onClick={handleDeleteAllImages}
                    className="cursor-pointer px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  >
                    {t("confirm")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteAll(false)}
                    className="cursor-pointer px-2 py-1 border border-gray-400 text-gray-600 rounded hover:border-gray-600 hover:text-gray-800 transition-colors"
                  >
                    {t("cancel")}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDeleteAll(true)}
                  className="cursor-pointer text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  {t("deleteAll")}
                </button>
              ))}
          </div>

          {/* Existing Images */}
          {editingProperty &&
            existingImageOrder.filter((id) => !deletedAttachmentIds.has(id))
              .length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-2">
                  {t("currentImages")} - Drag to reorder (first image will be
                  the cover):
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {visibleExistingAttachments.map((img, index) => (
                    <ExistingImageCard
                      key={img.id}
                      index={index}
                      image={img}
                      isDragging={existingDraggedIndex === index}
                      isDropTarget={existingDragOverIndex === index}
                      deletingAttachment={deletingAttachment}
                      reorderingImages={reorderingImages}
                      onDragStart={handleExistingDragStart}
                      onDragEnd={handleExistingDragEnd}
                      onDragEnter={handleExistingDragEnter}
                      onDragLeave={handleExistingDragLeave}
                      onDragOver={handleExistingDragOver}
                      onDrop={handleExistingDrop}
                      onDelete={handleDeleteAttachment}
                    />
                  ))}
                </div>
              </div>
            )}

          {/* New Images Upload */}
          <div className="flex items-center gap-2">
            <label className="flex-1 cursor-pointer">
              <div
                className={`flex items-center justify-center gap-2 rounded-md border-2 border-dashed px-4 py-3 text-sm transition-colors ${
                  isDroppingImages
                    ? "border-blue-500 bg-blue-50 text-blue-600"
                    : "border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600"
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDroppingImages(true);
                }}
                onDragEnter={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDroppingImages(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDroppingImages(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDroppingImages(false);
                  handleFileChange("images", e.dataTransfer.files);
                }}
              >
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
                {form.images.map((file, index) => (
                  <NewImageCard
                    key={index}
                    index={index}
                    file={file}
                    objectUrl={getObjectUrl(file)}
                    isDragging={draggedIndex === index}
                    isDropTarget={dragOverIndex === index}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onRemove={handleRemoveNewImage}
                  />
                ))}
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
          {editingProperty &&
            editingProperty.videos.filter(
              (video) => !deletedAttachmentIds.has(video.id)
            ).length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-2">Current videos:</p>
                <div className="space-y-2">
                  {editingProperty.videos
                    .filter((video) => !deletedAttachmentIds.has(video.id))
                    .map((video) => (
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
