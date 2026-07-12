import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductGrid } from "@/components/shop/product-grid";
import {
  departmentLabel,
  isProductDepartment,
  PRODUCT_DEPARTMENTS,
} from "@/lib/catalog/constants";
import {
  getTagBySlug,
  listActiveCategories,
  listShopProducts,
} from "@/lib/catalog/queries";

type ShopSegmentPageProps = {
  params: Promise<{ segment: string }>;
};

export default async function ShopSegmentPage({ params }: ShopSegmentPageProps) {
  const { segment } = await params;
  const categories = await listActiveCategories();

  if (isProductDepartment(segment)) {
    const products = await listShopProducts({ department: segment, limit: 48 });

    return (
      <div className="min-h-screen bg-[#F7F3EB]">
        <section className="border-b border-[#A79C89]/20 bg-white px-4 py-12 sm:px-6">
          <div className="mx-auto max-w-7xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#C8A86A]">
              <Link href="/shop" className="hover:underline">
                Shop
              </Link>
            </p>
            <h1 className="mt-2 font-[family-name:var(--font-playfair)] text-4xl text-[#3B0F14]">
              {departmentLabel(segment)}
            </h1>
            <div className="mt-6 flex flex-wrap gap-2">
              {PRODUCT_DEPARTMENTS.map((department) => (
                <Link
                  key={department.value}
                  href={`/shop/${department.slug}`}
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
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/shop/${segment}/${category.slug}`}
                  className="rounded-full border border-[#A79C89]/30 bg-[#F7F3EB] px-3 py-1.5 text-xs text-[#3B0F14] hover:border-[#C8A86A]"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <ProductGrid
            products={products}
            emptyMessage={`No ${departmentLabel(segment).toLowerCase()} products published yet.`}
          />
        </section>
      </div>
    );
  }

  const tag = await getTagBySlug(segment);
  if (!tag) {
    notFound();
  }

  const products = await listShopProducts({ tagId: tag.id, limit: 48 });

  return (
    <div className="min-h-screen bg-[#F7F3EB]">
      <section className="border-b border-[#A79C89]/20 bg-white px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#C8A86A]">
            <Link href="/shop" className="hover:underline">
              Shop
            </Link>
            {" · "}
            Collection
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-playfair)] text-4xl text-[#3B0F14]">
            {tag.name}
          </h1>
          <div className="mt-6 flex flex-wrap gap-2">
            {PRODUCT_DEPARTMENTS.map((department) => (
              <Link
                key={department.value}
                href={`/shop/${department.slug}`}
                className="rounded-full border border-[#A79C89]/40 bg-white px-4 py-2 text-sm text-[#3B0F14]"
              >
                {department.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <ProductGrid
          products={products}
          emptyMessage={`No products tagged “${tag.name}” yet.`}
        />
      </section>
    </div>
  );
}
