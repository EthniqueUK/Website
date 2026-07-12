"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { DeleteProductButton } from "@/components/admin/delete-product-button";
import { departmentLabel } from "@/lib/catalog/constants";

export type AdminProductListItem = {
  id: string;
  name: string;
  priceLabel: string | null;
  categoryId: string;
  categoryName: string;
  department: string | null;
  imageUrl: string | null;
  isActive: boolean;
  isFeatured: boolean;
  hasSales: boolean;
  tagNames: string[];
  stockByMarket: { code: string; quantity: number }[];
  pendingApproval?: boolean;
};

type AdminProductsListProps = {
  products: AdminProductListItem[];
  emptyMessage: string;
  canDelete?: boolean;
};

function formatStockLabel(stockByMarket: AdminProductListItem["stockByMarket"]) {
  if (stockByMarket.length === 0) return "Stock: —";
  return stockByMarket.map((entry) => `${entry.code}: ${entry.quantity}`).join(" · ");
}

function stockTone(stockByMarket: AdminProductListItem["stockByMarket"]) {
  if (stockByMarket.length === 0) return "text-[#A79C89]";
  const total = stockByMarket.reduce((sum, entry) => sum + entry.quantity, 0);
  if (total <= 0) return "text-red-600";
  if (stockByMarket.some((entry) => entry.quantity <= 2)) return "text-amber-700";
  return "text-[#3B0F14]";
}

function getGroupTotalQuantity(products: AdminProductListItem[]) {
  return products.reduce(
    (groupSum, product) =>
      groupSum + product.stockByMarket.reduce((sum, entry) => sum + entry.quantity, 0),
    0,
  );
}

export function AdminProductsList({
  products,
  emptyMessage,
  canDelete = true,
}: AdminProductsListProps) {
  const groups = useMemo(() => {
    const grouped = new Map<string, { categoryName: string; products: AdminProductListItem[] }>();

    for (const product of products) {
      const key = product.categoryId || "uncategorized";
      const existing = grouped.get(key);
      if (existing) {
        existing.products.push(product);
      } else {
        grouped.set(key, {
          categoryName: product.categoryName,
          products: [product],
        });
      }
    }

    return [...grouped.values()]
      .sort((a, b) => a.categoryName.localeCompare(b.categoryName))
      .map((group) => ({
        ...group,
        products: [...group.products].sort((a, b) => a.name.localeCompare(b.name)),
      }));
  }, [products]);

  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(groups.map((group) => [group.categoryName, true])),
  );

  if (products.length === 0) {
    return (
      <div className="overflow-hidden rounded-2xl border border-[#A79C89]/30 bg-white p-6 text-center text-sm text-[#A79C89] shadow-sm">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => {
        const isOpen = expanded[group.categoryName] ?? true;
        const totalQuantity = getGroupTotalQuantity(group.products);

        return (
          <section
            key={group.categoryName}
            className="overflow-hidden rounded-2xl border border-[#A79C89]/30 bg-white shadow-sm"
          >
            <button
              type="button"
              onClick={() =>
                setExpanded((current) => ({
                  ...current,
                  [group.categoryName]: !isOpen,
                }))
              }
              className="flex w-full items-center justify-between gap-4 border-b border-[#A79C89]/20 bg-[#F7F3EB] px-5 py-4 text-left transition hover:bg-[#F0EBE0]"
              aria-expanded={isOpen}
              aria-label={isOpen ? `Collapse ${group.categoryName}` : `Expand ${group.categoryName}`}
            >
              <div>
                <h3 className="font-[family-name:var(--font-playfair)] text-base font-semibold text-[#3B0F14]">
                  {group.categoryName}
                </h3>
                <p className="mt-0.5 text-xs text-[#A79C89]">
                  {group.products.length} product{group.products.length === 1 ? "" : "s"}
                  <span className="mx-2 text-[#A79C89]/50">&bull;</span>
                  {totalQuantity} total quantity
                </p>
              </div>
              <span
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#A79C89]/30 bg-white text-[#C8A86A]"
                aria-hidden="true"
              >
                {isOpen ? (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m18 15-6-6-6 6" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                )}
              </span>
            </button>

            {isOpen ? (
              <ul className="divide-y divide-[#A79C89]/20">
                {group.products.map((product) => (
                  <li
                    key={product.id}
                    className="flex items-center justify-between gap-4 p-5 hover:bg-[#F7F3EB]/60 sm:p-6"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      {product.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-12 w-12 shrink-0 rounded-lg border border-[#A79C89]/30 bg-[#F7F3EB] object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-[#A79C89]/30 bg-[#F7F3EB] text-[#A79C89]">
                          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-[#3B0F14]">{product.name}</p>
                          {product.department ? (
                            <span className="rounded-full bg-[#C8A86A]/20 px-2.5 py-1 text-xs font-medium text-[#3B0F14]">
                              {departmentLabel(product.department)}
                            </span>
                          ) : null}
                          {product.isFeatured ? (
                            <span className="rounded-full bg-[#3B0F14]/10 px-2.5 py-1 text-xs font-medium text-[#3B0F14]">
                              Featured
                            </span>
                          ) : null}
                          {product.tagNames.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-[#A79C89]/30 bg-white px-2.5 py-1 text-xs font-medium text-[#A79C89]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-[#A79C89]">
                          <span>{product.priceLabel ?? "No price"}</span>
                          <span>&bull;</span>
                          <span className={`font-medium ${stockTone(product.stockByMarket)}`}>
                            {formatStockLabel(product.stockByMarket)}
                          </span>
                          {!product.isActive ? (
                            <>
                              <span>&bull;</span>
                              <span className="font-medium text-red-600">Inactive</span>
                            </>
                          ) : null}
                          {product.pendingApproval ? (
                            <>
                              <span>&bull;</span>
                              <span className="font-medium text-amber-700">Pending approval</span>
                            </>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="rounded-lg border border-[#A79C89]/40 px-3 py-1.5 text-sm font-medium text-[#3B0F14] transition hover:border-[#C8A86A] hover:text-[#C8A86A]"
                      >
                        Edit
                      </Link>
                      {canDelete ? (
                        <DeleteProductButton
                          productId={product.id}
                          productName={product.name}
                          hasSales={product.hasSales}
                        />
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
