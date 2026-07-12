import "server-only";

import sharp from "sharp";

import { createAdminClient } from "@/lib/supabase/admin";
import { createWatermarkOverlay } from "@/lib/images/create-watermark";

const MAX_SOURCE_FILE_SIZE = 15 * 1024 * 1024;

type UploadOptimizedImageOptions = {
  bucket: "product-images" | "category-images";
  folder: string;
  file: File | Blob;
  fileName?: string;
  maxWidth: number;
  maxHeight: number;
  quality?: number;
};

type UploadOptimizedImageResult = {
  storagePath: string;
  publicUrl: string;
};

function sanitizeFileStem(fileName: string) {
  const baseName = fileName.replace(/\.[^.]+$/, "").trim().toLowerCase();
  const safe = baseName.replace(/[^a-z0-9-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return safe || "image";
}

function resolveFileName(file: File | Blob, fileName?: string) {
  if (fileName?.trim()) {
    return fileName.trim();
  }

  if (file instanceof File && file.name) {
    return file.name;
  }

  return "image.webp";
}

function resolveContentType(file: File | Blob) {
  if (file.type && file.type.startsWith("image/")) {
    return file.type;
  }

  return null;
}

export async function uploadOptimizedImage({
  bucket,
  folder,
  file,
  fileName,
  maxWidth,
  maxHeight,
  quality = 82,
}: UploadOptimizedImageOptions): Promise<UploadOptimizedImageResult> {
  const resolvedName = resolveFileName(file, fileName);
  const contentType = resolveContentType(file);

  if (!contentType) {
    throw new Error(`"${resolvedName}" is not a supported image file.`);
  }

  if (file.size > MAX_SOURCE_FILE_SIZE) {
    throw new Error(`"${resolvedName}" is too large. Please keep uploads under 15MB.`);
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const resized = await sharp(buffer)
    .rotate()
    .resize({
      width: maxWidth,
      height: maxHeight,
      fit: "inside",
      withoutEnlargement: true,
    })
    .toBuffer({ resolveWithObject: true });

  const watermarkOverlay = await createWatermarkOverlay(resized.info.width, resized.info.height);

  const optimizedBuffer = await sharp(resized.data)
    .composite([
      {
        input: watermarkOverlay,
        gravity: "southeast",
      },
    ])
    .webp({
      quality,
      effort: 5,
      smartSubsample: true,
    })
    .toBuffer();

  const fileStem = sanitizeFileStem(resolvedName);
  const storagePath = `${folder}/${Date.now()}-${crypto.randomUUID()}-${fileStem}.webp`;
  const supabase = createAdminClient();

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(storagePath, optimizedBuffer, {
      contentType: "image/webp",
      cacheControl: "31536000",
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Failed to upload optimized image: ${uploadError.message}`);
  }

  const publicUrl = supabase.storage.from(bucket).getPublicUrl(storagePath).data.publicUrl;

  return {
    storagePath,
    publicUrl,
  };
}
