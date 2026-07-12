import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  isProductDepartment,
  type ProductDepartment,
} from "@/lib/catalog/constants";
import { getProductImagePublicUrl } from "@/lib/images/product-image-url";

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  parent_id: string | null;
};

export type TagRow = {
  id: string;
  name: string;
  slug: string;
  kind: string;
  sort_order: number;
  is_active: boolean;
};

export type ShopProductCard = {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  department: string | null;
  category_name: string | null;
  category_slug: string | null;
  primary_image: string | null;
  price_label: string | null;
};

type ProductQueryRow = {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  department: string | null;
  is_active?: boolean;
  categories: { name: string; slug: string } | { name: string; slug: string }[] | null;
  product_images: { storage_path: string; is_primary: boolean }[] | null;
  product_market_data:
    | { price: number | string; currency: string }[]
    | { price: number | string; currency: string }
    | null;
};

function marketPriceLabel(
  marketData: ProductQueryRow["product_market_data"],
) {
  const row = Array.isArray(marketData) ? marketData[0] : marketData;
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

function mapProductCard(row: ProductQueryRow): ShopProductCard {
  const category = Array.isArray(row.categories) ? row.categories[0] : row.categories;
  const images = row.product_images ?? [];
  const primary = images.find((image) => image.is_primary) ?? images[0] ?? null;

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    short_description: row.short_description,
    department: row.department,
    category_name: category?.name ?? null,
    category_slug: category?.slug ?? null,
    primary_image: getProductImagePublicUrl(primary?.storage_path ?? null),
    price_label: marketPriceLabel(row.product_market_data),
  };
}

const PRODUCT_CARD_SELECT = `
  id,
  name,
  slug,
  short_description,
  department,
  is_active,
  categories:category_id(name, slug),
  product_images(storage_path, is_primary),
  product_market_data(price, currency)
`;

export async function listActiveCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, description, sort_order, is_active, parent_id")
    .eq("is_active", true)
    .is("parent_id", null)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("listActiveCategories:", error);
    return [] as CategoryRow[];
  }

  return (data as CategoryRow[]) ?? [];
}

export async function listActiveTags() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tags")
    .select("id, name, slug, kind, sort_order, is_active")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("listActiveTags:", error);
    return [] as TagRow[];
  }

  return (data as TagRow[]) ?? [];
}

export async function getCategoryBySlug(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("id, name, slug, description, sort_order, is_active, parent_id")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  return (data as CategoryRow | null) ?? null;
}

export async function getTagBySlug(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("tags")
    .select("id, name, slug, kind, sort_order, is_active")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  return (data as TagRow | null) ?? null;
}

export async function listShopProducts(filters: {
  department?: ProductDepartment;
  categoryId?: string;
  tagId?: string;
  limit?: number;
}) {
  const supabase = await createClient();
  const limit = filters.limit ?? 48;

  if (filters.tagId) {
    const { data: tagged, error: taggedError } = await supabase
      .from("product_tags")
      .select(`products:product_id(${PRODUCT_CARD_SELECT})`)
      .eq("tag_id", filters.tagId);

    if (taggedError) {
      console.error("listShopProducts by tag:", taggedError);
      return [] as ShopProductCard[];
    }

    const products = (tagged ?? [])
      .map((row) => {
        const product = Array.isArray(row.products) ? row.products[0] : row.products;
        return product as ProductQueryRow | null;
      })
      .filter((product): product is ProductQueryRow => Boolean(product && product.is_active !== false));

    let cards = products.map(mapProductCard);

    if (filters.department) {
      cards = cards.filter((card) => card.department === filters.department);
    }

    return cards.slice(0, limit);
  }

  let query = supabase
    .from("products")
    .select(PRODUCT_CARD_SELECT)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (filters.department && isProductDepartment(filters.department)) {
    query = query.eq("department", filters.department);
  }

  if (filters.categoryId) {
    query = query.eq("category_id", filters.categoryId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("listShopProducts:", error);
    return [] as ShopProductCard[];
  }

  return ((data as ProductQueryRow[]) ?? []).map(mapProductCard);
}

export async function listCategoriesForAdmin() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("categories")
    .select("id, name, slug, description, sort_order, is_active, parent_id")
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);
  return (data as CategoryRow[]) ?? [];
}

export async function listTagsForAdmin() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("tags")
    .select("id, name, slug, kind, sort_order, is_active")
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);
  return (data as TagRow[]) ?? [];
}
