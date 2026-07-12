import { createAdminClient } from "@/lib/supabase/admin";

const PRODUCT_IMAGES_BUCKET = "product-images";

/** Build a public URL for a product image storage path (or pass through absolute URLs). */
export function getProductImagePublicUrl(storagePath: string | null | undefined) {
  if (!storagePath) return null;
  if (/^https?:\/\//i.test(storagePath)) return storagePath;

  try {
    return createAdminClient()
      .storage.from(PRODUCT_IMAGES_BUCKET)
      .getPublicUrl(storagePath).data.publicUrl;
  } catch {
    return storagePath;
  }
}

export function getProductImagePublicUrlBrowser(storagePath: string) {
  if (/^https?:\/\//i.test(storagePath)) return storagePath;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return storagePath;

  return `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/${PRODUCT_IMAGES_BUCKET}/${storagePath}`;
}
