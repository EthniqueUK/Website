export const PRODUCT_DEPARTMENTS = [
  { value: "women", label: "Women", slug: "women" },
  { value: "men", label: "Men", slug: "men" },
  { value: "kids", label: "Kids", slug: "kids" },
] as const;

export type ProductDepartment = (typeof PRODUCT_DEPARTMENTS)[number]["value"];

export function isProductDepartment(value: string): value is ProductDepartment {
  return PRODUCT_DEPARTMENTS.some((department) => department.value === value);
}

export function departmentLabel(value: string | null | undefined) {
  return PRODUCT_DEPARTMENTS.find((department) => department.value === value)?.label ?? value ?? "—";
}

export function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
