import Link from "next/link";

import {
  PRODUCT_LIST_FILTER_PARAM,
  type ProductListFilterValue,
} from "@/lib/admin/product-list-filters";

type AdminProductSearchProps = {
  query?: string;
  filter?: ProductListFilterValue;
};

export function AdminProductSearch({ query = "", filter = "" }: AdminProductSearchProps) {
  return (
    <form
      action="/admin/products"
      method="GET"
      className="flex flex-col gap-3 sm:flex-row sm:items-center"
    >
      {filter ? <input type="hidden" name={PRODUCT_LIST_FILTER_PARAM} value={filter} /> : null}
      <label htmlFor="admin-product-search" className="sr-only">
        Search products by name
      </label>
      <input
        id="admin-product-search"
        type="search"
        name="q"
        defaultValue={query}
        placeholder="Search products by name..."
        className="w-full rounded-xl border border-[#A79C89]/40 bg-white px-4 py-2.5 text-sm text-[#3B0F14] outline-none transition focus:border-[#C8A86A] focus:ring-2 focus:ring-[#C8A86A]/20 sm:max-w-md"
      />
      <div className="flex items-center gap-2">
        <button
          type="submit"
          className="rounded-xl bg-[#3B0F14] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5C1520]"
        >
          Search
        </button>
        {query || filter ? (
          <Link
            href="/admin/products"
            className="rounded-xl border border-[#A79C89]/40 px-4 py-2.5 text-sm font-medium text-[#3B0F14] transition hover:border-[#C8A86A] hover:text-[#C8A86A]"
          >
            Clear
          </Link>
        ) : null}
      </div>
    </form>
  );
}
