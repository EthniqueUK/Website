import Link from "next/link";

import { AdminProductFilters } from "@/components/admin/admin-product-filters";
import { AdminProductSearch } from "@/components/admin/admin-product-search";
import { AdminProductsList } from "@/components/admin/admin-products-list";
import {
  productListFilterLabel,
  sanitizeProductListFilter,
  sanitizeSearchQuery,
} from "@/lib/admin/product-list-filters";
import { requireProductAccess } from "@/lib/auth/admin";
import { canDeleteProducts } from "@/lib/auth/permissions";
import { isProductDepartment } from "@/lib/catalog/constants";
import { getProductImagePublicUrl } from "@/lib/images/product-image-url";
import { createAdminClient } from "@/lib/supabase/admin";

type ProductListRow = {
  id: string;
  name: string;
  department: string | null;
  is_active: boolean;
  is_featured: boolean;
  market_id: string | null;
  vendor_id: string | null;
  created_by: string | null;
  categories: { id: string; name: string } | { id: string; name: string }[] | null;
  product_images: { storage_path: string; is_primary: boolean; sort_order: number }[] | null;
  product_market_data:
    | {
        price: number | string;
        currency: string;
        stock_quantity: number;
        markets:
          | { code: string; sort_order: number }
          | { code: string; sort_order: number }[]
          | null;
      }[]
    | null;
  product_tags:
    | {
        tags: { name: string } | { name: string }[] | null;
      }[]
    | null;
  profiles: { role: string } | { role: string }[] | null;
};

type AdminProductsPageProps = {
  searchParams: Promise<{ q?: string; filter?: string }>;
};

function resolveMarket(
  markets:
    | { code: string; sort_order: number }
    | { code: string; sort_order: number }[]
    | null
    | undefined,
) {
  return Array.isArray(markets) ? markets[0] ?? null : markets ?? null;
}

function buildStockByMarket(
  marketData: NonNullable<ProductListRow["product_market_data"]>,
  allowedMarketCodes: Set<string> | null,
) {
  return [...marketData]
    .map((entry) => {
      const market = resolveMarket(entry.markets);
      return {
        code: market?.code ?? "—",
        quantity: entry.stock_quantity,
        sortOrder: market?.sort_order ?? 999,
      };
    })
    .filter((entry) => !allowedMarketCodes || allowedMarketCodes.has(entry.code))
    .sort((a, b) => a.sortOrder - b.sortOrder || a.code.localeCompare(b.code))
    .map(({ code, quantity }) => ({ code, quantity }));
}

function formatPriceLabel(
  marketData: NonNullable<ProductListRow["product_market_data"]>,
  preferredMarketCode: string | null,
) {
  const sorted = [...marketData].sort((a, b) => {
    const aCode = resolveMarket(a.markets)?.code ?? "";
    const bCode = resolveMarket(b.markets)?.code ?? "";
    if (preferredMarketCode) {
      if (aCode === preferredMarketCode && bCode !== preferredMarketCode) return -1;
      if (bCode === preferredMarketCode && aCode !== preferredMarketCode) return 1;
    }
    return (resolveMarket(a.markets)?.sort_order ?? 999) - (resolveMarket(b.markets)?.sort_order ?? 999);
  });

  const row = sorted[0];
  if (!row) return null;

  const amount = typeof row.price === "string" ? Number(row.price) : row.price;
  if (!Number.isFinite(amount)) return null;

  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: row.currency || "GBP",
    }).format(amount);
  } catch {
    return `${row.currency} ${amount}`;
  }
}

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  const staff = await requireProductAccess("/admin/products");
  const { q, filter } = await searchParams;
  const searchQuery = sanitizeSearchQuery(q ?? "");
  const activeFilter = sanitizeProductListFilter(filter);
  const admin = createAdminClient();
  const allowedMarkets = staff.role === "super_admin" ? null : new Set([staff.marketCode ?? ""]);
  const canDelete = canDeleteProducts(staff.role);

  let productsQuery = admin
    .from("products")
    .select(
      `
      id,
      name,
      department,
      is_active,
      is_featured,
      market_id,
      vendor_id,
      created_by,
      categories:category_id(id, name),
      product_images(storage_path, is_primary, sort_order),
      product_market_data(price, currency, stock_quantity, markets:market_id(code, sort_order)),
      product_tags(tags:tag_id(name)),
      profiles:created_by(role)
    `,
    )
    .order("created_at", { ascending: false });

  if (searchQuery) {
    productsQuery = productsQuery.ilike("name", `%${searchQuery}%`);
  }

  if (isProductDepartment(activeFilter)) {
    productsQuery = productsQuery.eq("department", activeFilter);
  } else if (activeFilter === "featured") {
    productsQuery = productsQuery.eq("is_featured", true);
  }

  const [{ data: productsRaw }, { count: featuredCount }, { data: soldItemsRaw }] =
    await Promise.all([
      productsQuery,
      admin.from("products").select("id", { count: "exact", head: true }).eq("is_featured", true),
      admin.from("order_items").select("product_id").not("product_id", "is", null),
    ]);

  const soldProductIds = new Set(
    (soldItemsRaw ?? [])
      .map((item) => item.product_id)
      .filter((productId): productId is string => typeof productId === "string" && productId.length > 0),
  );

  const visibleRows = (productsRaw ?? []).filter((product) => {
    if (staff.role === "super_admin") return true;
    if (staff.role === "vendor") {
      return product.vendor_id === staff.userId && product.market_id === staff.marketId;
    }
    return product.vendor_id === staff.vendorId && product.market_id === staff.marketId;
  }) as unknown as ProductListRow[];

  const products = visibleRows.map((row) => {
    const category = Array.isArray(row.categories) ? row.categories[0] : row.categories;
    const images = row.product_images ?? [];
    const primaryImage = images.find((img) => img.is_primary) || images[0];
    const creator = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    const tagNames = (row.product_tags ?? [])
      .map((entry) => {
        const tag = Array.isArray(entry.tags) ? entry.tags[0] : entry.tags;
        return tag?.name ?? null;
      })
      .filter((name): name is string => Boolean(name));

    const pendingApproval =
      !row.is_active && (creator?.role === "manager" || row.created_by !== null);

    return {
      id: row.id,
      name: row.name,
      priceLabel: formatPriceLabel(row.product_market_data ?? [], staff.marketCode),
      categoryId: category?.id ?? "uncategorized",
      categoryName: category?.name || "Uncategorized",
      department: row.department,
      imageUrl: getProductImagePublicUrl(primaryImage?.storage_path ?? null),
      isActive: row.is_active,
      isFeatured: row.is_featured,
      hasSales: soldProductIds.has(row.id),
      tagNames,
      stockByMarket: buildStockByMarket(row.product_market_data ?? [], allowedMarkets),
      pendingApproval,
    };
  });

  const filterLabel = productListFilterLabel(activeFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-semibold text-[#3B0F14]">
            Products
          </h1>
          <p className="mt-1 text-sm text-[#A79C89]">
            {staff.marketCode ? `${staff.marketCode} market · ` : ""}
            Featured: {featuredCount ?? 0}
            {filterLabel && filterLabel !== "All Products" ? ` · ${filterLabel}` : ""}
            {searchQuery
              ? ` · ${products.length} match${products.length === 1 ? "" : "es"} for "${searchQuery}"`
              : ` · ${products.length} product${products.length === 1 ? "" : "s"}`}
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#3B0F14] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#5C1520]"
        >
          Add Product
        </Link>
      </div>

      <AdminProductFilters activeFilter={activeFilter} searchQuery={searchQuery} />
      <AdminProductSearch query={searchQuery} filter={activeFilter} />

      <AdminProductsList
        products={products}
        canDelete={canDelete}
        emptyMessage={
          searchQuery || activeFilter
            ? `No products found${searchQuery ? ` matching "${searchQuery}"` : ""}${
                activeFilter && filterLabel ? ` in ${filterLabel}` : ""
              }.`
            : 'No products found. Click "Add Product" to create one.'
        }
      />
    </div>
  );
}
