import { TaxonomyManager } from "@/components/admin/taxonomy-manager";
import { requireVendorOrAbove } from "@/lib/auth/admin";
import { listCategoriesForAdmin, listTagsForAdmin } from "@/lib/catalog/queries";

export default async function AdminCategoriesPage() {
  await requireVendorOrAbove("/admin/categories");

  let categories: Awaited<ReturnType<typeof listCategoriesForAdmin>> = [];
  let tags: Awaited<ReturnType<typeof listTagsForAdmin>> = [];
  let loadError: string | null = null;

  try {
    [categories, tags] = await Promise.all([listCategoriesForAdmin(), listTagsForAdmin()]);
  } catch (error) {
    loadError =
      error instanceof Error
        ? error.message
        : "Unable to load taxonomy. Apply migration 20260712_catalog_taxonomy.sql.";
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[#A79C89]/40 bg-white p-6 shadow-sm">
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-semibold text-[#3B0F14]">
          Categories & tags
        </h1>
        <p className="mt-2 text-sm text-[#A79C89]">
          Flat garment types and marketing tags. Departments (Men / Women / Kids) are set on each
          product — not nested here.
        </p>
      </section>

      {loadError ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
          {loadError}
        </div>
      ) : (
        <TaxonomyManager categories={categories} tags={tags} />
      )}
    </div>
  );
}
