import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductGrid } from "@/components/shop/product-grid";
import {
  departmentLabel,
  isProductDepartment,
  PRODUCT_DEPARTMENTS,
} from "@/lib/catalog/constants";
import {
  getCategoryBySlug,
  listActiveCategories,
  listShopProducts,
} from "@/lib/catalog/queries";

type ShopDepartmentCategoryPageProps = {
  params: Promise<{ segment: string; category: string }>;
};

export default async function ShopDepartmentCategoryPage({
  params,
}: ShopDepartmentCategoryPageProps) {
  const { segment, category: categorySlug } = await params;

  if (!isProductDepartment(segment)) {
    notFound();
  }

  const category = await getCategoryBySlug(categorySlug);
  if (!category) {
    notFound();
  }

  const [categories, products] = await Promise.all([
    listActiveCategories(),
    listShopProducts({
      department: segment,
      categoryId: category.id,
      limit: 48,
    }),
  ]);

  return (
    <div className="min-h-screen bg-[#F7F3EB]">
      <section className="border-b border-[#A79C89]/20 bg-white px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#C8A86A]">
            <Link href="/shop" className="hover:underline">
              Shop
            </Link>
            {" · "}
            <Link href={`/shop/${segment}`} className="hover:underline">
              {departmentLabel(segment)}
            </Link>
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-playfair)] text-4xl text-[#3B0F14]">
            {departmentLabel(segment)} {category.name}
          </h1>
          {category.description ? (
            <p className="mt-3 max-w-2xl text-sm text-[#A79C89]">{category.description}</p>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-2">
            {PRODUCT_DEPARTMENTS.map((department) => (
              <Link
                key={department.value}
                href={`/shop/${department.slug}/${category.slug}`}
                className={`rounded-full px-4 py-2 text-sm ${
                  department.value === segment
                    ? "bg-[#3B0F14] text-white"
                    : "border border-[#A79C89]/40 bg-white text-[#3B0F14]"
                }`}
              >
                {department.label}
              </Link>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((item) => (
              <Link
                key={item.id}
                href={`/shop/${segment}/${item.slug}`}
                className={`rounded-full px-3 py-1.5 text-xs ${
                  item.slug === category.slug
                    ? "bg-[#C8A86A] text-[#3B0F14]"
                    : "border border-[#A79C89]/30 bg-[#F7F3EB] text-[#3B0F14]"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <ProductGrid
          products={products}
          emptyMessage={`No ${departmentLabel(segment).toLowerCase()} ${category.name.toLowerCase()} products published yet.`}
        />
      </section>
    </div>
  );
}
