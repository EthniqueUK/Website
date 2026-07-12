import Link from "next/link";

import { NewProductEditor } from "@/components/admin/new-product-editor";
import { requireProductAccess } from "@/lib/auth/admin";
import { listCategoriesForAdmin, listTagsForAdmin } from "@/lib/catalog/queries";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function NewProductPage() {
  const staff = await requireProductAccess("/admin/products/new");
  const admin = createAdminClient();

  let categories: Awaited<ReturnType<typeof listCategoriesForAdmin>> = [];
  let tags: Awaited<ReturnType<typeof listTagsForAdmin>> = [];
  let loadError: string | null = null;

  try {
    [categories, tags] = await Promise.all([listCategoriesForAdmin(), listTagsForAdmin()]);
  } catch (error) {
    loadError =
      error instanceof Error
        ? error.message
        : "Unable to load catalog taxonomy. Apply migration 20260712_catalog_taxonomy.sql.";
  }

  const { data: markets } = await admin
    .from("markets")
    .select("id, name, code")
    .order("sort_order", { ascending: true });

  const marketRows = markets ?? [];
  const defaultMarketId =
    marketRows.find((market) => market.code === "uk")?.id ?? marketRows[0]?.id ?? null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/admin/products"
          className="text-sm font-medium text-[#A79C89] hover:text-[#3B0F14]"
        >
          ← Back to Products
        </Link>
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-semibold text-[#3B0F14]">
          Add Product
        </h1>
      </div>

      {loadError ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
          {loadError}
        </div>
      ) : (
        <NewProductEditor
          role={staff.role}
          markets={marketRows}
          defaultMarketId={defaultMarketId}
          categories={categories.map((category) => ({
            id: category.id,
            name: category.name,
            slug: category.slug,
          }))}
          tags={tags.map((tag) => ({ id: tag.id, name: tag.name, slug: tag.slug }))}
        />
      )}
    </div>
  );
}
