"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  deleteProductImage,
  setPrimaryImage,
} from "@/lib/actions/product-image-actions";
import { getProductImagePublicUrlBrowser } from "@/lib/images/product-image-url";
import type { ProductImageViewerItem } from "@/components/products/product-image-viewer";
import { ImageUploader, MAX_PRODUCT_IMAGES } from "./image-uploader";
import { WebsiteImagePreview } from "./website-image-preview";

export type ProductImage = {
  id: string;
  storage_path: string;
  is_primary: boolean;
};

export type StagedProductImage = {
  id: string;
  file: File;
  previewUrl: string;
};

type ProductImageGalleryProps = {
  productId: string;
  productName?: string;
  images?: ProductImage[];
  stagedFiles?: StagedProductImage[];
  onStagedFilesChange?: (files: StagedProductImage[]) => void;
};

function PreviewAsOnWebsiteButton({
  disabled,
  onClick,
}: {
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#A79C89]/40 bg-white px-4 py-2.5 text-xs font-semibold text-[#3B0F14] transition hover:border-[#C8A86A] hover:bg-[#C8A86A]/10 hover:text-[#3B0F14] disabled:cursor-not-allowed disabled:opacity-50"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
        aria-hidden="true"
      >
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      Preview as on website
    </button>
  );
}

function EmptyGalleryState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#A79C89]/40 bg-[#F7F3EB] py-12 text-center">
      <div className="mb-3 flex items-center gap-2 text-[#C8A86A]">
        <div className="h-px w-8 bg-[#C8A86A]/40" />
        <span className="text-2xl" aria-hidden="true">
          ◆
        </span>
        <div className="h-px w-8 bg-[#C8A86A]/40" />
      </div>
      <p className="text-sm font-medium text-[#3B0F14]">No images yet</p>
      <p className="mt-1 text-xs text-[#A79C89]">
        Drag & drop or click below · up to {MAX_PRODUCT_IMAGES} images
      </p>
    </div>
  );
}

function StagedProductImageGallery({
  productId,
  productName,
  stagedFiles,
  onStagedFilesChange,
}: {
  productId: string;
  productName: string;
  stagedFiles: StagedProductImage[];
  onStagedFilesChange: (files: StagedProductImage[]) => void;
}) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const primaryImage = stagedFiles[0] ?? null;
  const secondaryImages = stagedFiles.slice(1);

  const previewImages: ProductImageViewerItem[] = stagedFiles.map((image, index) => ({
    id: image.id,
    url: image.previewUrl,
    is_primary: index === 0,
  }));

  function handleFilesSelected(files: File[]) {
    const remaining = Math.max(0, MAX_PRODUCT_IMAGES - stagedFiles.length);
    const nextFiles = files.slice(0, remaining).map((file) => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    if (nextFiles.length === 0) {
      return;
    }

    onStagedFilesChange([...stagedFiles, ...nextFiles]);
  }

  function handleRemove(imageId: string) {
    const target = stagedFiles.find((image) => image.id === imageId);
    if (target) {
      URL.revokeObjectURL(target.previewUrl);
    }
    onStagedFilesChange(stagedFiles.filter((image) => image.id !== imageId));
  }

  function handleSetPrimary(imageId: string) {
    const index = stagedFiles.findIndex((image) => image.id === imageId);
    if (index <= 0) {
      return;
    }

    const next = [...stagedFiles];
    const [selected] = next.splice(index, 1);
    next.unshift(selected);
    onStagedFilesChange(next);
  }

  return (
    <div className="space-y-4">
      {stagedFiles.length === 0 ? (
        <EmptyGalleryState />
      ) : (
        <div className="space-y-3">
          {primaryImage ? (
            <div
              className="group relative w-full overflow-hidden rounded-2xl border-2 border-[#C8A86A] bg-[#F7F3EB]"
              style={{ aspectRatio: "4/3" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={primaryImage.previewUrl}
                alt="Primary product image"
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />

              <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-[#3B0F14] px-3 py-1 shadow-md">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#F7F3EB]">
                  ★ Primary
                </span>
              </div>

              <div className="absolute inset-0 flex items-end justify-end p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => handleRemove(primaryImage.id)}
                  className="rounded-xl bg-red-600/90 px-3 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur-sm transition hover:bg-red-700"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : null}

          {secondaryImages.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {secondaryImages.map((image) => (
                <div
                  key={image.id}
                  className="group relative overflow-hidden rounded-xl border border-[#A79C89]/30 bg-[#F7F3EB] shadow-sm"
                  style={{ width: "100px", height: "100px" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.previewUrl}
                    alt="Product image"
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
                  />

                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-[#3B0F14]/75 p-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(image.id)}
                      className="w-full rounded-lg bg-white px-2 py-1.5 text-[10px] font-semibold leading-tight text-[#3B0F14] transition hover:bg-[#C8A86A]/30"
                    >
                      Set Primary
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(image.id)}
                      className="w-full rounded-lg bg-red-600 px-2 py-1.5 text-[10px] font-semibold leading-tight text-white transition hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      )}

      <PreviewAsOnWebsiteButton
        disabled={stagedFiles.length === 0}
        onClick={() => setPreviewOpen(true)}
      />

      <div className="pt-2">
        <ImageUploader
          productId={productId}
          currentImageCount={stagedFiles.length}
          onFilesSelected={handleFilesSelected}
        />
      </div>

      {stagedFiles.length > 0 ? (
        <p className="text-center text-xs text-[#A79C89]">
          Images will be watermarked and saved when you create the product.
        </p>
      ) : null}

      <WebsiteImagePreview
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        productName={productName}
        images={previewImages}
      />
    </div>
  );
}

export function ProductImageGallery({
  productId,
  productName = "Product",
  images = [],
  stagedFiles,
  onStagedFilesChange,
}: ProductImageGalleryProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  if (typeof onStagedFilesChange === "function") {
    return (
      <StagedProductImageGallery
        productId={productId}
        productName={productName}
        stagedFiles={stagedFiles ?? []}
        onStagedFilesChange={onStagedFilesChange}
      />
    );
  }

  const primaryImage = images.find((img) => img.is_primary) ?? images[0] ?? null;
  const secondaryImages = images.filter((img) => img.id !== primaryImage?.id);

  function getPublicUrl(storagePath: string) {
    return getProductImagePublicUrlBrowser(storagePath);
  }

  const previewImages: ProductImageViewerItem[] = [
    ...(primaryImage
      ? [
          {
            id: primaryImage.id,
            url: getPublicUrl(primaryImage.storage_path),
            is_primary: true,
          },
        ]
      : []),
    ...secondaryImages.map((image) => ({
      id: image.id,
      url: getPublicUrl(image.storage_path),
      is_primary: false,
    })),
  ];

  function handleDelete(imageId: string, storagePath: string) {
    if (!confirm("Are you sure you want to delete this image?")) {
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await deleteProductImage(imageId, storagePath, productId);
      if (!result.ok) {
        setError(result.error ?? "Failed to delete image.");
        return;
      }
      router.refresh();
    });
  }

  function handleSetPrimary(imageId: string) {
    setError(null);
    startTransition(async () => {
      const result = await setPrimaryImage(productId, imageId);
      if (!result.ok) {
        setError(result.error ?? "Failed to set primary image.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className={`space-y-4 transition-opacity ${isPending ? "pointer-events-none opacity-60" : ""}`}>
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

      {images.length === 0 ? (
        <EmptyGalleryState />
      ) : (
        <div className="space-y-3">
          {primaryImage ? (
            <div
              className="group relative w-full overflow-hidden rounded-2xl border-2 border-[#C8A86A] bg-[#F7F3EB]"
              style={{ aspectRatio: "4/3" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getPublicUrl(primaryImage.storage_path)}
                alt="Primary product image"
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />

              <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-[#3B0F14] px-3 py-1 shadow-md">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#F7F3EB]">
                  ★ Primary
                </span>
              </div>

              <div className="absolute inset-0 flex items-end justify-end p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleDelete(primaryImage.id, primaryImage.storage_path)}
                  className="rounded-xl bg-red-600/90 px-3 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur-sm transition hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ) : null}

          {secondaryImages.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {secondaryImages.map((image) => (
                <div
                  key={image.id}
                  className="group relative overflow-hidden rounded-xl border border-[#A79C89]/30 bg-[#F7F3EB] shadow-sm"
                  style={{ width: "100px", height: "100px" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={getPublicUrl(image.storage_path)}
                    alt="Product image"
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
                  />

                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-[#3B0F14]/75 p-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleSetPrimary(image.id)}
                      className="w-full rounded-lg bg-white px-2 py-1.5 text-[10px] font-semibold leading-tight text-[#3B0F14] transition hover:bg-[#C8A86A]/30"
                    >
                      Set Primary
                    </button>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleDelete(image.id, image.storage_path)}
                      className="w-full rounded-lg bg-red-600 px-2 py-1.5 text-[10px] font-semibold leading-tight text-white transition hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      )}

      <PreviewAsOnWebsiteButton
        disabled={images.length === 0}
        onClick={() => setPreviewOpen(true)}
      />

      <div className="pt-2">
        <ImageUploader productId={productId} currentImageCount={images.length} />
      </div>

      {isPending ? (
        <p className="animate-pulse text-center text-xs font-medium text-[#C8A86A]">
          Updating gallery…
        </p>
      ) : null}

      <WebsiteImagePreview
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        productName={productName}
        images={previewImages}
      />
    </div>
  );
}
