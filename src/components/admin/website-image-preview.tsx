"use client";

import { useEffect } from "react";

import {
  ProductImageViewer,
  type ProductImageViewerItem,
} from "@/components/products/product-image-viewer";

type WebsiteImagePreviewProps = {
  open: boolean;
  onClose: () => void;
  productName: string;
  images: ProductImageViewerItem[];
};

export function WebsiteImagePreview({
  open,
  onClose,
  productName,
  images,
}: WebsiteImagePreviewProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#3B0F14]/55 p-4 backdrop-blur-sm sm:p-8">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Website image preview"
        className="relative z-10 my-4 w-full max-w-5xl overflow-hidden rounded-2xl border border-[#A79C89]/30 bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#A79C89]/20 bg-[#F7F3EB] px-5 py-4 sm:px-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#C8A86A]">
              Website preview
            </p>
            <h2 className="mt-1 font-[family-name:var(--font-playfair)] text-xl font-semibold text-[#3B0F14] sm:text-2xl">
              {productName}
            </h2>
            <p className="mt-1 text-xs text-[#A79C89]">
              This is how customers will see the product gallery on the storefront.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-xl border border-[#A79C89]/40 bg-white px-3 py-2 text-xs font-semibold text-[#3B0F14] transition hover:border-[#C8A86A] hover:text-[#C8A86A]"
          >
            Close
          </button>
        </div>

        <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <ProductImageViewer images={images} productName={productName} />
          </div>

          <div className="rounded-2xl border border-dashed border-[#A79C89]/40 bg-[#F7F3EB]/80 p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#C8A86A]">
              Wear · Celebrate · Share
            </p>
            <h3 className="mt-2 font-[family-name:var(--font-playfair)] text-2xl font-bold tracking-tight text-[#3B0F14]">
              {productName}
            </h3>
            <p className="mt-3 text-sm leading-6 text-[#A79C89]">
              Use the main image and thumbnails exactly as shoppers will. Click the main image to
              open the full-screen lightbox.
            </p>
            <ul className="mt-4 space-y-2 text-xs text-[#3B0F14]/80">
              <li>• Primary image appears first</li>
              <li>• Thumbnails switch the featured view</li>
              <li>• Lightbox supports arrow keys and next/previous</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
