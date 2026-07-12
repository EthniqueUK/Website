import Link from "next/link";

import type { ShopProductCard } from "@/lib/catalog/queries";

type ProductGridProps = {
  products: ShopProductCard[];
  emptyMessage?: string;
};

export function ProductGrid({
  products,
  emptyMessage = "No products in this collection yet.",
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-[#A79C89]/30 bg-white px-6 py-16 text-center text-sm text-[#A79C89]">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <article
          key={product.id}
          className="group overflow-hidden rounded-2xl border border-[#A79C89]/25 bg-white shadow-sm transition hover:border-[#C8A86A]/50"
        >
          <div
            className="aspect-[4/5] w-full bg-[#F7F3EB]"
            style={
              product.primary_image
                ? {
                    backgroundImage: `url(${product.primary_image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : undefined
            }
          />
          <div className="space-y-2 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-[#C8A86A]">
              {[product.department, product.category_name].filter(Boolean).join(" · ")}
            </p>
            <h3 className="font-[family-name:var(--font-playfair)] text-xl text-[#3B0F14]">
              {product.name}
            </h3>
            {product.short_description ? (
              <p className="text-sm text-[#A79C89] line-clamp-2">{product.short_description}</p>
            ) : null}
            <div className="flex items-center justify-between pt-2">
              <span className="text-sm font-medium text-[#3B0F14]">
                {product.price_label ?? "Price on request"}
              </span>
              {product.department && product.category_slug ? (
                <Link
                  href={`/shop/${product.department}/${product.category_slug}`}
                  className="text-xs font-semibold uppercase tracking-wider text-[#C8A86A] group-hover:text-[#3B0F14]"
                >
                  View type
                </Link>
              ) : null}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
