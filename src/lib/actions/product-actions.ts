"use server";

import { revalidatePath } from "next/cache";

import { logAdminAction } from "@/lib/audit/log-admin-action";
import { assertMfaVerified, getStaffAuthState } from "@/lib/auth/admin";
import { canActivateProducts, canDeleteProducts } from "@/lib/auth/permissions";
import {
  isProductDepartment,
  slugify,
  type ProductDepartment,
} from "@/lib/catalog/constants";
import { createAdminClient } from "@/lib/supabase/admin";
import { uploadOptimizedImage } from "@/lib/images/upload-optimized-image";
import { MAX_PRODUCT_IMAGES } from "@/lib/products/image-limits";
import {
  formatProductSku,
  parseProductSkuSequence,
  PRODUCT_SKU_SEQUENCE_START,
} from "@/lib/products/sku";

type ActionResult =
  | { ok: true; productId?: string }
  | { ok: false; error: string };

type AdminClient = ReturnType<typeof createAdminClient>;

function parseRequired(formData: FormData, key: string, label: string) {
  const value = String(formData.get(key) ?? "").trim();
  if (!value) throw new Error(`${label} is required.`);
  return value;
}

async function allocateUniqueProductSku(admin: AdminClient) {
  const { data, error } = await admin.from("products").select("sku");
  if (error) {
    throw new Error(`Unable to allocate SKU: ${error.message}`);
  }

  let nextSequence = PRODUCT_SKU_SEQUENCE_START;
  const used = new Set<string>();

  for (const row of data ?? []) {
    const sku = typeof row.sku === "string" ? row.sku.trim() : "";
    if (!sku) continue;

    used.add(sku.toUpperCase());
    const sequence = parseProductSkuSequence(sku);
    if (sequence != null && sequence >= nextSequence) {
      nextSequence = sequence + 1;
    }
  }

  for (let attempt = 0; attempt < 50; attempt += 1) {
    const candidate = formatProductSku(nextSequence + attempt);
    if (!used.has(candidate.toUpperCase())) {
      return candidate;
    }
  }

  return `ETH-${Date.now().toString(36).toUpperCase()}`;
}

export async function getNextProductSku(): Promise<
  { ok: true; sku: string } | { ok: false; error: string }
> {
  try {
    await requireProductStaff();
    const admin = createAdminClient();
    const sku = await allocateUniqueProductSku(admin);
    return { ok: true, sku };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to allocate SKU.",
    };
  }
}

async function requireProductStaff() {
  const staff = await getStaffAuthState();
  if (!staff) throw new Error("Authentication required.");

  if (staff.role === "super_admin") {
    await assertMfaVerified();
  }

  return staff;
}

export async function upsertProductAction(formData: FormData): Promise<ActionResult> {
  try {
    const staff = await requireProductStaff();
    const admin = createAdminClient();

    const id = String(formData.get("id") ?? "").trim() || null;
    const name = parseRequired(formData, "name", "Name");
    const departmentRaw = parseRequired(formData, "department", "Department");
    const categoryId = parseRequired(formData, "category_id", "Category");
    const slugInput = String(formData.get("slug") ?? "").trim();
    const slug = slugify(slugInput || name);
    const shortDescription = String(formData.get("short_description") ?? "").trim() || null;
    const description = String(formData.get("description") ?? "").trim() || null;
    const skuFromForm = String(formData.get("sku") ?? "").trim().toUpperCase() || null;
    const tagIds = formData.getAll("tag_ids").map(String).filter(Boolean);

    if (!isProductDepartment(departmentRaw)) {
      return { ok: false, error: "Select a valid department (Men, Women, or Kids)." };
    }

    const department: ProductDepartment = departmentRaw;
    let isActive = formData.get("is_active") === "1" || formData.get("is_active") === "on";

    if (staff.role === "manager") {
      // Managers create inactive products and cannot activate.
      if (!id) isActive = false;
      else if (isActive && !canActivateProducts(staff.role)) {
        return { ok: false, error: "Managers cannot activate products." };
      }
    }

    if (!canActivateProducts(staff.role) && isActive && !id) {
      isActive = false;
    }

    const marketId =
      staff.role === "super_admin"
        ? String(formData.get("market_id") ?? "").trim() || staff.marketId
        : staff.marketId;

    if (!marketId && staff.role !== "super_admin") {
      return { ok: false, error: "Your account has no market assigned." };
    }

    const vendorId =
      staff.role === "vendor"
        ? staff.userId
        : staff.role === "manager"
          ? staff.vendorId
          : String(formData.get("vendor_id") ?? "").trim() || null;

    let productId = id;
    let isCreate = false;

    if (id) {
      const { data: existing } = await admin
        .from("products")
        .select("id")
        .eq("id", id)
        .maybeSingle();

      isCreate = !existing;
    } else {
      isCreate = true;
    }

    // Always allocate a fresh unique SKU on create; allow manual override on edit.
    const sku = isCreate ? await allocateUniqueProductSku(admin) : skuFromForm;

    const payload = {
      name,
      slug,
      department,
      category_id: categoryId,
      short_description: shortDescription,
      description,
      sku,
      is_active: isActive,
      market_id: marketId,
      vendor_id: vendorId,
      updated_by: staff.userId,
    };

    if (id && !isCreate) {
      const { error } = await admin.from("products").update(payload).eq("id", id);
      if (error) return { ok: false, error: error.message };
    } else if (id && isCreate) {
      const { data, error } = await admin
        .from("products")
        .insert({
          id,
          ...payload,
          created_by: staff.userId,
        })
        .select("id")
        .single();

      if (error || !data) {
        return { ok: false, error: error?.message ?? "Failed to create product." };
      }
      productId = data.id;
    } else {
      const { data, error } = await admin
        .from("products")
        .insert({
          ...payload,
          created_by: staff.userId,
        })
        .select("id")
        .single();

      if (error || !data) {
        return { ok: false, error: error?.message ?? "Failed to create product." };
      }
      productId = data.id;
    }

    if (productId) {
      await admin.from("product_tags").delete().eq("product_id", productId);
      if (tagIds.length > 0) {
        const { error: tagError } = await admin.from("product_tags").insert(
          tagIds.map((tagId) => ({ product_id: productId!, tag_id: tagId })),
        );
        if (tagError) return { ok: false, error: tagError.message };
      }
    }

    if (isCreate && productId) {
      const stagedImages = formData
        .getAll("images")
        .filter((entry): entry is File => entry instanceof File && entry.size > 0)
        .slice(0, MAX_PRODUCT_IMAGES);

      for (let index = 0; index < stagedImages.length; index += 1) {
        const imageFile = stagedImages[index];
        const isPrimary = index === 0;

        try {
          const { storagePath } = await uploadOptimizedImage({
            bucket: "product-images",
            folder: productId,
            file: imageFile,
            fileName: imageFile.name,
            maxWidth: 1800,
            maxHeight: 1800,
            quality: 82,
          });

          const { error: imageError } = await admin.from("product_images").insert({
            product_id: productId,
            storage_path: storagePath,
            is_primary: isPrimary,
          });

          if (imageError) {
            await admin.storage.from("product-images").remove([storagePath]);
            console.error("Failed to save staged product image:", imageError.message);
          }
        } catch (imageUploadError) {
          console.error("Failed to upload staged product image:", imageUploadError);
        }
      }
    }

    await logAdminAction({
      actor: staff,
      action: isCreate ? "product.create" : "product.update",
      entityType: "product",
      entityId: productId,
      summary: `${isCreate ? "Created" : "Updated"} product ${name}`,
      metadata: { department, categoryId, tagIds },
    });

    revalidatePath("/admin/products");
    if (productId) {
      revalidatePath(`/admin/products/${productId}/edit`);
    }
    revalidatePath("/shop");
    return { ok: true, productId: productId ?? undefined };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to save product.",
    };
  }
}

export async function setProductActiveAction(
  productId: string,
  isActive: boolean,
): Promise<ActionResult> {
  try {
    const staff = await requireProductStaff();
    if (!canActivateProducts(staff.role)) {
      return { ok: false, error: "You cannot activate or deactivate products." };
    }

    const admin = createAdminClient();
    const { error } = await admin
      .from("products")
      .update({ is_active: isActive, updated_by: staff.userId })
      .eq("id", productId);

    if (error) return { ok: false, error: error.message };

    await logAdminAction({
      actor: staff,
      action: "product.activate",
      entityType: "product",
      entityId: productId,
      summary: `${isActive ? "Activated" : "Deactivated"} product ${productId}`,
    });

    revalidatePath("/admin/products");
    revalidatePath("/shop");
    return { ok: true, productId };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to update product status.",
    };
  }
}

export async function deleteProductAction(productId: string): Promise<ActionResult> {
  try {
    const staff = await requireProductStaff();
    if (!canDeleteProducts(staff.role)) {
      return { ok: false, error: "You cannot delete products." };
    }

    const admin = createAdminClient();

    const { count: salesCount } = await admin
      .from("order_items")
      .select("id", { count: "exact", head: true })
      .eq("product_id", productId);

    if ((salesCount ?? 0) > 0) {
      const { error: archiveError } = await admin
        .from("products")
        .update({
          is_active: false,
          is_featured: false,
          updated_by: staff.userId,
        })
        .eq("id", productId);

      if (archiveError) return { ok: false, error: archiveError.message };

      await admin
        .from("product_market_data")
        .update({ is_available: false, is_visible: false, stock_quantity: 0 })
        .eq("product_id", productId);

      await logAdminAction({
        actor: staff,
        action: "product.archive",
        entityType: "product",
        entityId: productId,
        summary: `Archived product ${productId} (has sales history)`,
      });

      revalidatePath("/admin/products");
      revalidatePath(`/admin/products/${productId}/edit`);
      revalidatePath("/shop");
      return { ok: true };
    }

    const { data: imageRows } = await admin
      .from("product_images")
      .select("storage_path")
      .eq("product_id", productId);

    const storagePaths = (imageRows ?? [])
      .map((row) => row.storage_path)
      .filter(Boolean);

    if (storagePaths.length > 0) {
      await admin.storage.from("product-images").remove(storagePaths);
    }

    const { error } = await admin.from("products").delete().eq("id", productId);
    if (error) return { ok: false, error: error.message };

    await logAdminAction({
      actor: staff,
      action: "product.delete",
      entityType: "product",
      entityId: productId,
      summary: `Deleted product ${productId}`,
    });

    revalidatePath("/admin/products");
    revalidatePath("/shop");
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to delete product.",
    };
  }
}
