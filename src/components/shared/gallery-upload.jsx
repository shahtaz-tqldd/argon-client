import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { useWatch } from "react-hook-form";

import { ImagePlus, Trash2 } from "lucide-react";
import { useFilePreviews } from "@/lib/file-preview";
import { Text, Title } from "../ui/typography";
import Card from "../ui/card";

const GalleryUploader = ({
  control,
  setValue,
  top_k = 4,
  coverImageName = "cover_image",
  coverImageFileName = "cover_image_file",
  galleryImagesName = "gallery_images",
  existingGalleryImagesName = "existing_gallery_images",
  removedGalleryImageIdsName = "removed_gallery_image_ids",
  removedGalleryImageValueKey = "id",
}) => {
  const coverInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const coverUrl = useWatch({ control, name: coverImageName });
  const coverFiles = useWatch({ control, name: coverImageFileName });
  const galleryFiles = useWatch({ control, name: galleryImagesName });

  const existingGalleryImages =
    useWatch({ control, name: existingGalleryImagesName }) || [];
  const removedGalleryImageIds =
    useWatch({ control, name: removedGalleryImageIdsName }) || [];

  const coverPreviews = useFilePreviews(coverFiles);
  const galleryPreviews = useFilePreviews(galleryFiles);

  const activeCover = coverPreviews[0]?.url || coverUrl;
  const selectedGalleryFiles = Array.from(galleryFiles || []);
  const galleryImageCount =
    existingGalleryImages.length + selectedGalleryFiles.length;
  const canAddGallery = galleryImageCount < top_k;

  const openCoverPicker = () => coverInputRef.current?.click();
  const openGalleryPicker = () => galleryInputRef.current?.click();

  const updateCover = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setValue(coverImageFileName, [file], { shouldDirty: true });
  };

  const removeCover = () => {
    setValue(coverImageFileName, null, { shouldDirty: true });
    setValue(coverImageName, "", { shouldDirty: true });
    if (coverInputRef.current) coverInputRef.current.value = "";
  };

  const addGalleryImages = (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = Math.max(top_k - existingGalleryImages.length, 0);
    const nextFiles = [...selectedGalleryFiles, ...files].slice(
      0,
      remainingSlots,
    );
    setValue(galleryImagesName, nextFiles, { shouldDirty: true });
    event.target.value = "";
  };

  const removeGalleryImage = (index) => {
    const nextFiles = selectedGalleryFiles.filter((_, itemIndex) => {
      return itemIndex !== index;
    });
    setValue(galleryImagesName, nextFiles.length ? nextFiles : null, {
      shouldDirty: true,
    });
  };

  const removeExistingGalleryImage = (index) => {
    const image = existingGalleryImages[index];
    const nextImages = existingGalleryImages.filter((_, itemIndex) => {
      return itemIndex !== index;
    });
    const removedValue = image?.[removedGalleryImageValueKey];
    const nextRemovedIds = removedValue
      ? [...new Set([...removedGalleryImageIds, removedValue])]
      : removedGalleryImageIds;

    setValue(existingGalleryImagesName, nextImages, { shouldDirty: true });
    setValue(removedGalleryImageIdsName, nextRemovedIds, {
      shouldDirty: true,
    });
  };

  return (
    <Card>
      <div className="mb-6">
        <Title variant="xs">Cover and Image Gallery</Title>
        <Text variant="sm" className="mt-1">
          Upload High resulation images within max 1mb size
        </Text>
      </div>
      <div>
        <div
          className={`relative aspect-[16/9] overflow-hidden rounded-3xl border ${
            activeCover
              ? "border-slate-200 bg-white"
              : "border-dashed border-slate-300 bg-white"
          }`}
        >
          {activeCover ? (
            <>
              <img
                src={activeCover}
                alt="Cover preview"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-x-3 bottom-3 flex justify-end gap-2">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    className="h-10 bg-white text-slate-800 shadow-sm hover:bg-slate-100 rounded-full"
                    onClick={openCoverPicker}
                  >
                    <ImagePlus size={15} />
                    Change
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={removeCover}
                    className="size-10 rounded-full bg-red-600 text-white border-2 border-white hover:bg-red-500 hover:text-white backdrop-blur-sm"
                  >
                    <Trash2 size={15} />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <button
              type="button"
              onClick={openCoverPicker}
              className="flex h-full w-full flex-col items-center justify-center px-4 text-center text-slate-500 transition hover:bg-primary/5 hover:text-primary"
            >
              <div className="h-14 w-14 center bg-primary/10 rounded-full">
                <ImagePlus size={32} strokeWidth={1} className="text-primary" />
              </div>
              <span className="mt-2 text-sm font-semibold text-slate-800">
                Upload a cover Image
              </span>
              <span className="text-xs mt-2 block">
                1600x1200 would be the best fit image for cover
              </span>
            </button>
          )}
        </div>
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={updateCover}
        />
      </div>

      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-800">
              Gallery Images
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Add up to {top_k} square gallery images.
            </p>
          </div>
          <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600">
            {galleryImageCount}/{top_k}
          </span>
        </div>

        <div className="flex flex-wrap gap-4">
          {existingGalleryImages.map((image, index) => (
            <div
              key={image.id || image.url}
              className="group relative size-36 overflow-hidden rounded-lg border border-slate-200 bg-white"
            >
              <img
                src={image.url}
                alt={image.caption || "Gallery image"}
                className="h-full w-full object-cover"
              />
              <span className="absolute left-1.5 top-1.5 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-medium text-slate-600 shadow-sm">
                Existing
              </span>
              <button
                type="button"
                onClick={() => removeExistingGalleryImage(index)}
                className="absolute right-1.5 top-1.5 flex size-7 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-sm opacity-0 transition hover:text-red-600 group-hover:opacity-100"
                aria-label="Remove existing gallery image"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}

          {galleryPreviews.map((preview, index) => (
            <div
              key={preview.url}
              className="size-36 group relative aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-white"
            >
              <img
                src={preview.url}
                alt={preview.name}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeGalleryImage(index)}
                className="absolute right-1.5 top-1.5 flex size-7 items-center justify-center rounded-full bg-white/95 text-slate-700 shadow-sm opacity-0 transition hover:text-red-600 group-hover:opacity-100"
                aria-label="Remove gallery image"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}

          {canAddGallery && (
            <button
              type="button"
              onClick={openGalleryPicker}
              className="size-36 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-3 text-center text-slate-500 transition hover:border-primary hover:bg-primary/5 hover:text-primary"
            >
              <ImagePlus size={24} className="text-primary" />
              <span className="mt-2 text-xs font-semibold text-slate-600">
                Upload Gallery Image
              </span>
            </button>
          )}
        </div>

        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={addGalleryImages}
        />
      </div>
    </Card>
  );
};

export default GalleryUploader;
