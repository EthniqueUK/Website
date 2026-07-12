"use client";

import { FormEvent, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { ProductBarcodePanel } from "@/components/admin/product-barcode-panel";
import { getNextProductSku, upsertProductAction } from "@/lib/actions/product-actions";
import { MAX_PRODUCT_IMAGES } from "@/lib/products/image-limits";
import { PRODUCT_DEPARTMENTS } from "@/lib/catalog/constants";
import { canActivateProducts } from "@/lib/auth/permissions";
import type { StaffRole } from "@/lib/auth/admin";

type Option = { id: string; name: string; slug?: string };

type ProductCreateFormProps = {
  role: StaffRole;
  productId: string;
  markets: Option[];
  defaultMarketId: string | null;
  categories: Option[];
  tags: Option[];
  stagedImages?: File[];
  onProductNameChange?: (name: string) => void;
};

export function ProductCreateForm({
  role,
  productId,
  markets,
  defaultMarketId,
  categories,
  tags,
  stagedImages = [],
  onProductNameChange,
}: ProductCreateFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [skuPreview, setSkuPreview] = useState<string>("");
  const [skuLoading, setSkuLoading] = useState(true);
  const canActivate = canActivateProducts(role);

  useEffect(() => {
    let cancelled = false;
    setSkuLoading(true);
    void getNextProductSku().then((result) => {
      if (cancelled) return;
      if (result.ok) {
        setSkuPreview(result.sku);
      } else {
        setError(result.error ?? "Unable to allocate SKU.");
      }
      setSkuLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set("id", productId);

    for (const file of stagedImages.slice(0, MAX_PRODUCT_IMAGES)) {
      formData.append("images", file);
    }

    setError(null);
    startTransition(async () => {
      const result = await upsertProductAction(formData);
      if (!result.ok) {
        setError(result.error ?? "Failed to create product.");
        return;
      }
      if (result.productId) {
        router.push(`/admin/products/${result.productId}/edit`);
        return;
      }
      router.push("/admin/products");
    });
  }

  return (
    <div className="space-y-4">
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {isPending ? (
        <div className="rounded-xl border border-[#C8A86A]/40 bg-[#C8A86A]/10 px-4 py-3 text-sm text-[#3B0F14]">
          Creating product
          {stagedImages.length > 0
            ? ` and uploading ${stagedImages.length} image${stagedImages.length === 1 ? "" : "s"}…`
            : "…"}
        </div>
      ) : null}

      <form onSubmit={handleCreate} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <input type="hidden" name="id" value={productId} />

        <label className="block space-y-1.5 sm:col-span-2">
          <span className="text-sm font-medium text-[#1F1F1F]">Name *</span>
          <input
            name="name"
            required
            onChange={(event) => onProductNameChange?.(event.target.value)}
            className="w-full rounded-xl border border-[#A79C89]/40 px-4 py-3 text-sm"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-[#1F1F1F]">Department *</span>
          <select
            name="department"
            required
            defaultValue=""
            className="w-full rounded-xl border border-[#A79C89]/40 bg-white px-4 py-3 text-sm"
          >
            <option value="" disabled>
              Select department
            </option>
            {PRODUCT_DEPARTMENTS.map((department) => (
              <option key={department.value} value={department.value}>
                {department.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-[#1F1F1F]">Category *</span>
          <select
            name="category_id"
            required
            defaultValue=""
            className="w-full rounded-xl border border-[#A79C89]/40 bg-white px-4 py-3 text-sm"
          >
            <option value="" disabled>
              Select category
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        {role === "super_admin" ? (
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-[#1F1F1F]">Market</span>
            <select
              name="market_id"
              defaultValue={defaultMarketId ?? ""}
              className="w-full rounded-xl border border-[#A79C89]/40 bg-white px-4 py-3 text-sm"
            >
              {markets.map((market) => (
                <option key={market.id} value={market.id}>
                  {market.name}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-[#1F1F1F]">SKU</span>
          <input
            name="sku"
            value={skuLoading ? "Allocating…" : skuPreview}
            readOnly
            className="w-full rounded-xl border border-[#A79C89]/40 bg-[#F7F3EB] px-4 py-3 text-sm text-[#3B0F14]"
          />
          <span className="block text-xs text-[#A79C89]">
            Assigned automatically (ETH-#####). Confirmed uniquely when you create the product.
          </span>
        </label>

        <div className="space-y-2 sm:col-span-2">
          <p className="text-sm font-medium text-[#1F1F1F]">Barcode preview (Code 128)</p>
          <ProductBarcodePanel sku={skuLoading ? null : skuPreview} />
          <p className="text-xs text-[#A79C89]">
            After creating the product, use Print barcode label on the edit page with your barcode
            printer.
          </p>
        </div>

        <label className="block space-y-1.5 sm:col-span-2">
          <span className="text-sm font-medium text-[#1F1F1F]">Short description</span>
          <input
            name="short_description"
            className="w-full rounded-xl border border-[#A79C89]/40 px-4 py-3 text-sm"
          />
        </label>

        <fieldset className="sm:col-span-2">
          <legend className="text-sm font-medium text-[#1F1F1F]">Tags</legend>
          <div className="mt-2 flex flex-wrap gap-3">
            {tags.map((tag) => (
              <label key={tag.id} className="flex items-center gap-2 text-sm text-[#1F1F1F]">
                <input type="checkbox" name="tag_ids" value={tag.id} />
                {tag.name}
              </label>
            ))}
            {tags.length === 0 ? (
              <p className="text-sm text-[#A79C89]">No tags available yet.</p>
            ) : null}
          </div>
        </fieldset>

        {canActivate ? (
          <label className="flex items-center gap-2 text-sm text-[#1F1F1F]">
            <input name="is_active" type="checkbox" value="1" defaultChecked={role !== "manager"} />
            Active / published
          </label>
        ) : (
          <p className="text-sm text-[#A79C89] sm:col-span-2">
            Manager-created products stay inactive until a vendor or super admin activates them.
          </p>
        )}

        <div className="flex flex-wrap gap-3 sm:col-span-2">
          <button
            type="submit"
            disabled={isPending || categories.length === 0 || skuLoading}
            className="rounded-xl bg-[#3B0F14] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isPending ? "Creating…" : "Create product"}
          </button>
          <Link
            href="/admin/products"
            className="rounded-xl border border-[#A79C89]/40 px-5 py-3 text-sm font-medium text-[#3B0F14]"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
