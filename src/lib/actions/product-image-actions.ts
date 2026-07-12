"use server";

import { revalidatePath } from "next/cache";

import { assertMfaVerified, getStaffAuthState, type StaffAuthState } from "@/lib/auth/admin";
import { uploadOptimizedImage } from "@/lib/images/upload-optimized-image";
import { MAX_PRODUCT_IMAGES } from "@/lib/products/image-limits";
import { createAdminClient } from "@/lib/supabase/admin";

export type ProductImageActionResult = {
  ok: boolean;
  error?: string;
};

function revalidateProductImagePaths(productId: string) {
  revalidatePath(`/admin/products/${productId}/edit`);
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/shop", "layout");
}

function staffCanAccessProduct(
  staff: StaffAuthState,
  product: { market_id: string | null; vendor_id: string | null },
) {
  if (staff.role === "super_admin") return true;
  if (staff.role === "vendor") {
    return product.vendor_id === staff.userId && product.market_id === staff.marketId;
  }
  return product.vendor_id === staff.vendorId && product.market_id === staff.marketId;
}

async function requireProductImageStaff(productId: string) {
  const staff = await getStaffAuthState();
  if (!staff) throw new Error("Authentication required.");

  if (staff.role === "super_admin") {
    await assertMfaVerified();
  }

  if (!["super_admin", "vendor", "manager"].includes(staff.role)) {
    throw new Error("Forbidden");
  }

  const admin = createAdminClient();
  const { data: product, error } = await admin
    .from("products")
    .select("id, market_id, vendor_id")
    .eq("id", productId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!product) throw new Error("Product not found.");
  if (!staffCanAccessProduct(staff, product)) throw new Error("Forbidden");

  return { staff, admin };
}

export async function uploadProductImage(formData: FormData): Promise<ProductImageActionResult> {
  try {
    const productId = formData.get("productId");
    const imageFile = formData.get("image");

    if (typeof productId !== "string" || !productId) {
      return { ok: false, error: "Product id is required." };
    }

    if (!(imageFile instanceof Blob) || imageFile.size === 0) {
      return { ok: false, error: "Please select an image to upload." };
    }

    const { admin } = await requireProductImageStaff(productId);

    const { count: imageCount, error: countError } = await admin
      .from("product_images")
      .select("id", { count: "exact", head: true })
      .eq("product_id", productId);

    if (countError) {
      return { ok: false, error: `Unable to check image limit: ${countError.message}` };
    }

    if ((imageCount ?? 0) >= MAX_PRODUCT_IMAGES) {
      return { ok: false, error: `Each product can have up to ${MAX_PRODUCT_IMAGES} images.` };
    }

    const { storagePath } = await uploadOptimizedImage({
      bucket: "product-images",
      folder: productId,
      file: imageFile,
      fileName: imageFile instanceof File ? imageFile.name : undefined,
      maxWidth: 1800,
      maxHeight: 1800,
      quality: 82,
    });

    const { data: existing } = await admin
      .from("product_images")
      .select("id")
      .eq("product_id", productId)
      .eq("is_primary", true)
      .maybeSingle();

    const isPrimary = !existing;

    const { error } = await admin.from("product_images").insert({
      product_id: productId,
      storage_path: storagePath,
      is_primary: isPrimary,
    });

    if (error) {
      await admin.storage.from("product-images").remove([storagePath]);
      return { ok: false, error: `Failed to save image metadata: ${error.message}` };
    }

    revalidateProductImagePaths(productId);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to upload image.",
    };
  }
}

export async function deleteProductImage(
  imageId: string,
  storagePath: string,
  productId: string,
): Promise<ProductImageActionResult> {
  try {
    const { admin } = await requireProductImageStaff(productId);

    const { data: imageRow, error: imageLookupError } = await admin
      .from("product_images")
      .select("id, is_primary, storage_path")
      .eq("id", imageId)
      .eq("product_id", productId)
      .maybeSingle();

    if (imageLookupError) {
      return { ok: false, error: `Failed to load image: ${imageLookupError.message}` };
    }

    if (!imageRow) {
      return { ok: false, error: "Image not found." };
    }

    const pathToRemove = imageRow.storage_path || storagePath;

    const { error: storageError } = await admin.storage.from("product-images").remove([pathToRemove]);

    if (storageError) {
      return { ok: false, error: `Failed to delete file from storage: ${storageError.message}` };
    }

    const { error: dbError } = await admin.from("product_images").delete().eq("id", imageId);

    if (dbError) {
      return { ok: false, error: `Failed to delete image record: ${dbError.message}` };
    }

    if (imageRow.is_primary) {
      const { data: replacement } = await admin
        .from("product_images")
        .select("id, storage_path")
        .eq("product_id", productId)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (replacement) {
        const { error: promoteError } = await admin
          .from("product_images")
          .update({ is_primary: true })
          .eq("id", replacement.id);

        if (promoteError) {
          return { ok: false, error: `Failed to promote next primary image: ${promoteError.message}` };
        }
      }
    }

    revalidateProductImagePaths(productId);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to delete image.",
    };
  }
}

export async function setPrimaryImage(
  productId: string,
  imageId: string,
): Promise<ProductImageActionResult> {
  try {
    const { admin } = await requireProductImageStaff(productId);

    const { data: imageRow, error: imageLookupError } = await admin
      .from("product_images")
      .select("id, storage_path")
      .eq("id", imageId)
      .eq("product_id", productId)
      .maybeSingle();

    if (imageLookupError) {
      return { ok: false, error: `Failed to load image: ${imageLookupError.message}` };
    }

    if (!imageRow) {
      return { ok: false, error: "Image not found." };
    }

    const { error: unsetError } = await admin
      .from("product_images")
      .update({ is_primary: false })
      .eq("product_id", productId);

    if (unsetError) {
      return { ok: false, error: `Failed to update primary image: ${unsetError.message}` };
    }

    const { error: primaryError } = await admin
      .from("product_images")
      .update({ is_primary: true })
      .eq("id", imageId);

    if (primaryError) {
      return { ok: false, error: `Failed to set primary image: ${primaryError.message}` };
    }

    revalidateProductImagePaths(productId);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to set primary image.",
    };
  }
}
