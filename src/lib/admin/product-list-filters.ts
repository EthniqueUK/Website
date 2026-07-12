export const PRODUCT_LIST_FILTER_PARAM = "filter";

export const PRODUCT_LIST_FILTERS = [
  { value: "", label: "All Products" },
  { value: "women", label: "Women" },
  { value: "men", label: "Men" },
  { value: "kids", label: "Kids" },
  { value: "featured", label: "Featured" },
] as const;

export type ProductListFilterValue = (typeof PRODUCT_LIST_FILTERS)[number]["value"];

export function sanitizeProductListFilter(value: string | undefined): ProductListFilterValue {
  const match = PRODUCT_LIST_FILTERS.find((filter) => filter.value === value);
  return match?.value ?? "";
}

export function productListFilterLabel(value: ProductListFilterValue) {
  return PRODUCT_LIST_FILTERS.find((filter) => filter.value === value)?.label ?? null;
}

export function buildAdminProductsHref(args: {
  q?: string;
  filter?: ProductListFilterValue;
}) {
  const params = new URLSearchParams();
  if (args.q) params.set("q", args.q);
  if (args.filter) params.set(PRODUCT_LIST_FILTER_PARAM, args.filter);
  const query = params.toString();
  return query ? `/admin/products?${query}` : "/admin/products";
}

export function sanitizeSearchQuery(value: string) {
  return value.trim().replace(/[%_]/g, "").slice(0, 100);
}
