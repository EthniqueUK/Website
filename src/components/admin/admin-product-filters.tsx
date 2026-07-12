import Link from "next/link";

import {
  buildAdminProductsHref,
  PRODUCT_LIST_FILTERS,
  type ProductListFilterValue,
} from "@/lib/admin/product-list-filters";

type AdminProductFiltersProps = {
  activeFilter: ProductListFilterValue;
  searchQuery?: string;
};

export function AdminProductFilters({
  activeFilter,
  searchQuery = "",
}: AdminProductFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {PRODUCT_LIST_FILTERS.map((filter) => (
        <Link
          key={filter.value || "all"}
          href={buildAdminProductsHref({
            q: searchQuery || undefined,
            filter: filter.value,
          })}
          className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
            activeFilter === filter.value
              ? "bg-[#3B0F14] text-white"
              : "border border-[#A79C89]/40 bg-white text-[#3B0F14] hover:border-[#C8A86A] hover:text-[#C8A86A]"
          }`}
        >
          {filter.label}
        </Link>
      ))}
    </div>
  );
}
