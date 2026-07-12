import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductEditForm } from "@/components/admin/product-edit-form";
import { ProductImageGallery } from "@/components/admin/product-image-gallery";
import { requireProductAccess } from "@/lib/auth/admin";
import { listCategoriesForAdmin, listTagsForAdmin } from "@/lib/catalog/queries";
import { createAdminClient } from "@/lib/supabase/admin";

type EditProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const staff = await requireProductAccess(`/admin/products/${id}/edit`);
  const admin = createAdminClient();

  const [
    categories,
    tags,
    { data: markets },
    { data: product },
    { data: images },
    { data: productTags },
  ] = await Promise.all([
    listCategoriesForAdmin(),
    listTagsForAdmin(),
    admin.from("markets").select("id, name, code").order("sort_order", { ascending: true }),
    admin
      .from("products")
      .select(
        "id, name, slug, department, category_id, sku, short_description, description, is_active, market_id, vendor_id",
      )
      .eq("id", id)
      .maybeSingle(),
    admin
      .from("product_images")
      .select("id, storage_path, is_primary")
      .eq("product_id", id)
      .order("created_at", { ascending: true }),
    admin.from("product_tags").select("tag_id").eq("product_id", id),
  ]);

  if (!product) {
    notFound();
  }

  const canAccess =
    staff.role === "super_admin"
    || (staff.role === "vendor"
      && product.vendor_id === staff.userId
      && product.market_id === staff.marketId)
    || (staff.role === "manager"
      && product.vendor_id === staff.vendorId
      && product.market_id === staff.marketId);

  if (!canAccess) {
    notFound();
  }

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
          Edit Product
        </h1>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="space-y-4 rounded-2xl border border-[#A79C89]/40 bg-white p-6 shadow-sm">
            <h2 className="font-[family-name:var(--font-playfair)] text-xl text-[#3B0F14]">
              Product Details
            </h2>
            <ProductEditForm
              role={staff.role}
              product={{
                id: product.id,
                name: product.name,
                slug: product.slug,
                department: product.department,
                category_id: product.category_id,
                sku: product.sku,
                short_description: product.short_description,
                description: product.description,
                is_active: product.is_active,
                market_id: product.market_id,
                tag_ids: (productTags ?? []).map((row) => row.tag_id),
              }}
              markets={markets ?? []}
              categories={categories.map((category) => ({
                id: category.id,
                name: category.name,
                slug: category.slug,
              }))}
              tags={tags.map((tag) => ({ id: tag.id, name: tag.name, slug: tag.slug }))}
            />
          </section>
        </div>

        <div className="space-y-6">
          <section className="space-y-4 rounded-2xl border border-[#A79C89]/40 bg-white p-6 shadow-sm">
            <h2 className="font-[family-name:var(--font-playfair)] text-xl text-[#3B0F14]">
              Product Gallery
            </h2>
            <p className="text-sm text-[#A79C89]">
              Upload and manage images. The primary image is shown as the storefront thumbnail.
            </p>
            <ProductImageGallery
              productId={id}
              productName={product.name}
              images={images ?? []}
            />
          </section>
        </div>
      </div>
    </div>
  );
}
