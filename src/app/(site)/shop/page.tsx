import Link from "next/link";

import { ProductGrid } from "@/components/shop/product-grid";
import { PRODUCT_DEPARTMENTS } from "@/lib/catalog/constants";
import { listActiveCategories, listActiveTags, listShopProducts } from "@/lib/catalog/queries";

export default async function ShopHubPage() {
  const [categories, tags, products] = await Promise.all([
    listActiveCategories(),
    listActiveTags(),
    listShopProducts({ limit: 12 }),
  ]);

  return (
    <div className="min-h-screen bg-[#F7F3EB]">
      <section className="border-b border-[#A79C89]/20 bg-[#3B0F14] px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#C8A86A]">
            Shop Ethnique
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-playfair)] text-4xl text-[#F7F3EB] sm:text-5xl">
            Browse by department
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-[#A79C89]">
            Women, Men, and Kids — then filter by garment type or explore New Arrivals, Trending,
            and Offers.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {PRODUCT_DEPARTMENTS.map((department) => (
            <Link
              key={department.value}
              href={`/shop/${department.slug}`}
              className="rounded-2xl border border-[#A79C89]/30 bg-white px-6 py-10 text-center shadow-sm transition hover:border-[#C8A86A]"
            >
              <h2 className="font-[family-name:var(--font-playfair)] text-3xl text-[#3B0F14]">
                {department.label}
              </h2>
              <p className="mt-2 text-xs uppercase tracking-[0.25em] text-[#C8A86A]">Shop now</p>
            </Link>
          ))}
        </div>

        <div className="mt-14">
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl text-[#3B0F14]">
            Garment types
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/shop/women/${category.slug}`}
                className="rounded-full border border-[#A79C89]/40 bg-white px-4 py-2 text-sm text-[#3B0F14] transition hover:border-[#C8A86A]"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-14">
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl text-[#3B0F14]">
            Featured collections
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/shop/${tag.slug}`}
                className="rounded-full bg-[#3B0F14] px-4 py-2 text-sm text-[#F7F3EB] transition hover:bg-[#5C1520]"
              >
                {tag.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-14">
          <div className="mb-6 flex items-end justify-between gap-4">
            <h2 className="font-[family-name:var(--font-playfair)] text-2xl text-[#3B0F14]">
              Latest pieces
            </h2>
          </div>
          <ProductGrid products={products} />
        </div>
      </section>
    </div>
  );
}
