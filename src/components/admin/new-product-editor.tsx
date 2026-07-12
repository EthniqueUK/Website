"use client";

import { useEffect, useRef, useState } from "react";

import { ProductCreateForm } from "@/components/admin/product-create-form";
import {
  ProductImageGallery,
  type StagedProductImage,
} from "@/components/admin/product-image-gallery";
import type { StaffRole } from "@/lib/auth/admin";

type Option = { id: string; name: string; slug?: string };

type NewProductEditorProps = {
  role: StaffRole;
  markets: Option[];
  defaultMarketId: string | null;
  categories: Option[];
  tags: Option[];
};

export function NewProductEditor({
  role,
  markets,
  defaultMarketId,
  categories,
  tags,
}: NewProductEditorProps) {
  const productIdRef = useRef(crypto.randomUUID());
  const [stagedFiles, setStagedFiles] = useState<StagedProductImage[]>([]);
  const [productName, setProductName] = useState("New product");

  useEffect(() => {
    return () => {
      stagedFiles.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    };
    // Only revoke on unmount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="grid items-start gap-8 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <section className="space-y-4 rounded-2xl border border-[#A79C89]/40 bg-white p-6 shadow-sm">
          <h2 className="font-[family-name:var(--font-playfair)] text-xl text-[#3B0F14]">
            Product Details
          </h2>
          <ProductCreateForm
            role={role}
            productId={productIdRef.current}
            markets={markets}
            defaultMarketId={defaultMarketId}
            categories={categories}
            tags={tags}
            stagedImages={stagedFiles.map((image) => image.file)}
            onProductNameChange={setProductName}
          />
        </section>
      </div>

      <div className="space-y-6">
        <section className="space-y-4 rounded-2xl border border-[#A79C89]/40 bg-white p-6 shadow-sm">
          <h2 className="font-[family-name:var(--font-playfair)] text-xl text-[#3B0F14]">
            Product Gallery
          </h2>
          <p className="text-sm text-[#A79C89]">
            Upload and manage images. The primary image is shown as the storefront thumbnail.
          </p>
          <ProductImageGallery
            productId={productIdRef.current}
            productName={productName.trim() || "New product"}
            stagedFiles={stagedFiles}
            onStagedFilesChange={setStagedFiles}
          />
        </section>
      </div>
    </div>
  );
}
