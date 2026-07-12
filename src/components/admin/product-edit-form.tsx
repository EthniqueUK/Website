"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { ProductBarcodePanel } from "@/components/admin/product-barcode-panel";
import { getNextProductSku, upsertProductAction } from "@/lib/actions/product-actions";
import { PRODUCT_DEPARTMENTS } from "@/lib/catalog/constants";
import { canActivateProducts } from "@/lib/auth/permissions";
import type { StaffRole } from "@/lib/auth/admin";

type Option = { id: string; name: string; slug?: string };

export type EditableProduct = {
  id: string;
  name: string;
  slug: string;
  department: string | null;
  category_id: string;
  sku: string | null;
  short_description: string | null;
  description: string | null;
  is_active: boolean;
  market_id: string | null;
  tag_ids: string[];
};

type ProductEditFormProps = {
  role: StaffRole;
  product: EditableProduct;
  markets: Option[];
  categories: Option[];
  tags: Option[];
};

export function ProductEditForm({
  role,
  product,
  markets,
  categories,
  tags,
}: ProductEditFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [skuValue, setSkuValue] = useState(product.sku ?? "");
  const [productName, setProductName] = useState(product.name);
  const canActivate = canActivateProducts(role);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await upsertProductAction(formData);
      if (!result.ok) {
        setError(result.error ?? "Failed to save product.");
        return;
      }
      setMessage("Product saved.");
      router.refresh();
    });
  }

  function handleGenerateSku() {
    setError(null);
    startTransition(async () => {
      const result = await getNextProductSku();
      if (!result.ok) {
        setError(result.error ?? "Failed to allocate SKU.");
        return;
      }
      setSkuValue(result.sku);
      setMessage("New SKU allocated. Save the product to keep it.");
    });
  }

  return (
    <div className="space-y-4">
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}
      {message ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <input type="hidden" name="id" value={product.id} />

        <label className="block space-y-1.5 sm:col-span-2">
          <span className="text-sm font-medium text-[#1F1F1F]">Name *</span>
          <input
            name="name"
            required
            defaultValue={product.name}
            onChange={(event) => setProductName(event.target.value)}
            className="w-full rounded-xl border border-[#A79C89]/40 px-4 py-3 text-sm"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-[#1F1F1F]">Slug</span>
          <input
            name="slug"
            defaultValue={product.slug}
            className="w-full rounded-xl border border-[#A79C89]/40 px-4 py-3 text-sm"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-[#1F1F1F]">Department *</span>
          <select
            name="department"
            required
            defaultValue={product.department ?? ""}
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
            defaultValue={product.category_id}
            className="w-full rounded-xl border border-[#A79C89]/40 bg-white px-4 py-3 text-sm"
          >
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
              defaultValue={product.market_id ?? ""}
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

        <div className="space-y-1.5">
          <span className="text-sm font-medium text-[#1F1F1F]">SKU</span>
          <div className="flex gap-2">
            <input
              name="sku"
              value={skuValue}
              onChange={(event) => setSkuValue(event.target.value.toUpperCase())}
              className="w-full rounded-xl border border-[#A79C89]/40 px-4 py-3 text-sm uppercase"
            />
            <button
              type="button"
              disabled={isPending}
              onClick={handleGenerateSku}
              className="shrink-0 rounded-xl border border-[#A79C89]/40 px-3 py-2 text-xs font-semibold text-[#3B0F14] hover:border-[#C8A86A] disabled:opacity-60"
            >
              Generate
            </button>
          </div>
          <span className="block text-xs text-[#A79C89]">
            Auto format ETH-#####. Generate allocates the next free code.
          </span>
        </div>

        <div className="space-y-2 rounded-2xl border border-[#A79C89]/30 bg-[#F7F3EB]/50 p-4 sm:col-span-2">
          <p className="text-sm font-medium text-[#1F1F1F]">Barcode (Code 128)</p>
          <ProductBarcodePanel sku={skuValue} productName={productName} />
        </div>

        <label className="block space-y-1.5 sm:col-span-2">
          <span className="text-sm font-medium text-[#1F1F1F]">Short description</span>
          <input
            name="short_description"
            defaultValue={product.short_description ?? ""}
            className="w-full rounded-xl border border-[#A79C89]/40 px-4 py-3 text-sm"
          />
        </label>

        <label className="block space-y-1.5 sm:col-span-2">
          <span className="text-sm font-medium text-[#1F1F1F]">Description</span>
          <textarea
            name="description"
            rows={4}
            defaultValue={product.description ?? ""}
            className="w-full rounded-xl border border-[#A79C89]/40 px-4 py-3 text-sm"
          />
        </label>

        <fieldset className="sm:col-span-2">
          <legend className="text-sm font-medium text-[#1F1F1F]">Tags</legend>
          <div className="mt-2 flex flex-wrap gap-3">
            {tags.map((tag) => (
              <label key={tag.id} className="flex items-center gap-2 text-sm text-[#1F1F1F]">
                <input
                  type="checkbox"
                  name="tag_ids"
                  value={tag.id}
                  defaultChecked={product.tag_ids.includes(tag.id)}
                />
                {tag.name}
              </label>
            ))}
          </div>
        </fieldset>

        {canActivate ? (
          <label className="flex items-center gap-2 text-sm text-[#1F1F1F]">
            <input
              name="is_active"
              type="checkbox"
              value="1"
              defaultChecked={product.is_active}
            />
            Active / published
          </label>
        ) : null}

        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-[#3B0F14] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60 sm:col-span-2 sm:w-fit"
        >
          {isPending ? "Saving…" : "Save product"}
        </button>
      </form>
    </div>
  );
}
