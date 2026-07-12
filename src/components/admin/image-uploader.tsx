"use client";

import { useRouter } from "next/navigation";
import { ChangeEvent, DragEvent, useRef, useState } from "react";

import { uploadProductImage } from "@/lib/actions/product-image-actions";
import { MAX_PRODUCT_IMAGES } from "@/lib/products/image-limits";

export { MAX_PRODUCT_IMAGES };

type ImageUploaderProps = {
  productId: string;
  currentImageCount: number;
  /**
   * When provided, selected files are passed here instead of uploading immediately.
   * Used on the New Product page so images can be staged before the product exists.
   */
  onFilesSelected?: (files: File[]) => void;
};

export function ImageUploader({
  productId,
  currentImageCount,
  onFilesSelected,
}: ImageUploaderProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const remainingSlots = Math.max(0, MAX_PRODUCT_IMAGES - currentImageCount);
  const isFull = remainingSlots === 0;
  const isDeferred = typeof onFilesSelected === "function";

  async function processFiles(files: File[]) {
    if (isFull) {
      setError(`Each product can have up to ${MAX_PRODUCT_IMAGES} images.`);
      return;
    }

    const imageFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length === 0) {
      setError("Please select valid image files.");
      return;
    }

    if (imageFiles.length < files.length) {
      setError("Only image files can be uploaded. Non-image files were skipped.");
    } else {
      setError(null);
    }

    const oversized = imageFiles.find((file) => file.size > 15 * 1024 * 1024);
    if (oversized) {
      setError(`"${oversized.name}" is larger than 15MB.`);
      return;
    }

    const filesToUpload = imageFiles.slice(0, remainingSlots);
    const skippedForLimit = imageFiles.length - filesToUpload.length;

    if (filesToUpload.length === 0) {
      setError(`Each product can have up to ${MAX_PRODUCT_IMAGES} images.`);
      return;
    }

    if (isDeferred) {
      onFilesSelected(filesToUpload);
      if (skippedForLimit > 0) {
        setError(
          `${skippedForLimit} file${skippedForLimit === 1 ? " was" : "s were"} skipped because the ${MAX_PRODUCT_IMAGES}-image limit was reached.`,
        );
      }
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      return;
    }

    setIsUploading(true);
    setProgress(10);
    setStatusMessage(
      filesToUpload.length === 1
        ? "Uploading image…"
        : `Uploading ${filesToUpload.length} images…`,
    );

    const failures: string[] = [];

    for (let index = 0; index < filesToUpload.length; index += 1) {
      const file = filesToUpload[index];
      setStatusMessage(`Uploading ${index + 1} of ${filesToUpload.length}…`);
      setProgress(Math.round(((index + 0.35) / filesToUpload.length) * 100));

      const formData = new FormData();
      formData.set("productId", productId);
      formData.set("image", file);

      try {
        const result = await uploadProductImage(formData);
        if (!result.ok) {
          failures.push(result.error ?? `Failed to upload "${file.name}".`);
        }
      } catch (err: unknown) {
        console.error(err);
        failures.push(err instanceof Error ? err.message : `Failed to upload "${file.name}".`);
      }

      setProgress(Math.round(((index + 1) / filesToUpload.length) * 100));
    }

    const messages: string[] = [];
    if (skippedForLimit > 0) {
      messages.push(
        `${skippedForLimit} file${skippedForLimit === 1 ? " was" : "s were"} skipped because the ${MAX_PRODUCT_IMAGES}-image limit was reached.`,
      );
    }
    if (failures.length > 0) {
      messages.push(failures[0]);
    }

    setError(messages.length > 0 ? messages.join(" ") : null);
    setIsUploading(false);
    setProgress(0);
    setStatusMessage(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }

    if (failures.length < filesToUpload.length) {
      router.refresh();
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;
    void processFiles(files);
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (!isUploading && !isFull) {
      setIsDragging(true);
    }
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    if (isUploading || isFull) {
      if (isFull) {
        setError(`Each product can have up to ${MAX_PRODUCT_IMAGES} images.`);
      }
      return;
    }

    const files = Array.from(event.dataTransfer.files ?? []);
    if (files.length === 0) return;
    void processFiles(files);
  }

  return (
    <div className="space-y-2">
      {error ? (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-xs font-medium text-red-700">{error}</p>
          <button
            type="button"
            onClick={() => setError(null)}
            className="shrink-0 text-xs font-bold text-red-800 underline hover:text-red-900"
          >
            Dismiss
          </button>
        </div>
      ) : null}

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-6 text-center transition-all duration-200 ${
          isFull
            ? "cursor-not-allowed border-[#A79C89]/40 bg-[#F7F3EB]/70 opacity-70"
            : isUploading
              ? "cursor-wait border-[#C8A86A] bg-[#C8A86A]/10"
              : isDragging
                ? "border-[#C8A86A] bg-[#C8A86A]/15"
                : "cursor-pointer border-[#A79C89]/50 bg-[#F7F3EB] hover:border-[#C8A86A] hover:bg-[#C8A86A]/10"
        }`}
      >
        {isUploading ? (
          <>
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#C8A86A]/30 border-t-[#3B0F14]" />
            <span className="text-sm font-medium text-[#3B0F14]">
              {statusMessage ?? "Uploading…"}
            </span>
            <div className="h-1.5 w-full max-w-[160px] overflow-hidden rounded-full bg-[#A79C89]/30">
              <div
                className="h-full rounded-full bg-[#C8A86A] transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </>
        ) : isFull ? (
          <>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#A79C89]/20 text-sm font-bold text-[#A79C89]">
              {MAX_PRODUCT_IMAGES}/{MAX_PRODUCT_IMAGES}
            </div>
            <div>
              <span className="block text-sm font-semibold text-[#3B0F14]">Image limit reached</span>
              <span className="mt-0.5 block text-xs text-[#A79C89]">
                Delete an image to upload another
              </span>
            </div>
          </>
        ) : (
          <label className="flex w-full cursor-pointer flex-col items-center justify-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C8A86A]/20 text-xl text-[#C8A86A]">
              +
            </div>
            <div>
              <span className="block text-sm font-semibold text-[#3B0F14]">
                {isDragging ? "Drop images to upload" : "Add images"}
              </span>
              <span className="mt-0.5 block text-xs text-[#A79C89]">
                Drag & drop or click · PNG, JPG, GIF, WebP · up to 15 MB
              </span>
              <span className="mt-1 block text-xs font-medium text-[#C8A86A]">
                {currentImageCount}/{MAX_PRODUCT_IMAGES} used · {remainingSlots} remaining
              </span>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading || isFull}
            />
          </label>
        )}
      </div>
    </div>
  );
}
