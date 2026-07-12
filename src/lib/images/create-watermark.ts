import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";

import sharp from "sharp";

/** Emblem size as a fraction of the photo's shorter side — visible brand mark. */
const WATERMARK_SCALE = 0.162;
const WATERMARK_MIN_WIDTH = 81;
const WATERMARK_MAX_WIDTH = 162;
/** Narrow the mark horizontally only; height stays at the base size. */
const WATERMARK_WIDTH_FACTOR = 0.7;
/** Keep the trademark clearly readable without fully covering the product. */
const WATERMARK_OPACITY = 0.95;
/** Inset from the bottom-right corner, scaled with watermark size. */
const WATERMARK_MARGIN_RATIO = 0.16;

const EMBLEM_PATH = path.join(process.cwd(), "public/watermarks/ethnique-trademark.png");

const overlayCache = new Map<string, Buffer>();

async function loadEmblemPng() {
  return fs.readFile(EMBLEM_PATH);
}

function resolveBaseWidth(imageWidth: number, imageHeight: number) {
  const shorterSide = Math.min(imageWidth, imageHeight);
  const scaled = Math.round(shorterSide * WATERMARK_SCALE);
  return Math.min(WATERMARK_MAX_WIDTH, Math.max(WATERMARK_MIN_WIDTH, scaled));
}

/**
 * Builds a transparent PNG of the Ethnique trademark for southeast compositing.
 */
export async function createWatermarkOverlay(imageWidth: number, imageHeight: number) {
  const baseWidth = resolveBaseWidth(imageWidth, imageHeight);
  const cacheKey = `${baseWidth}-w${WATERMARK_WIDTH_FACTOR}`;
  const cached = overlayCache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const emblem = await loadEmblemPng();
  const meta = await sharp(emblem).metadata();
  const sourceWidth = meta.width || baseWidth;
  const sourceHeight = meta.height || baseWidth;

  const targetHeight = Math.round((baseWidth * sourceHeight) / sourceWidth);
  const targetWidth = Math.round(baseWidth * WATERMARK_WIDTH_FACTOR);
  const margin = Math.max(10, Math.round(baseWidth * WATERMARK_MARGIN_RATIO));

  const resized = await sharp(emblem)
    .resize({
      width: targetWidth,
      height: targetHeight,
      fit: "fill",
      withoutEnlargement: false,
    })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = resized;
  // Keep gold + burgundy mark only — drop any leftover solid black plate.
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const max = Math.max(r, g, b);
    const chroma = max - Math.min(r, g, b);

    if (max < 28 && chroma < 12) {
      data[i + 3] = 0;
      continue;
    }

    data[i + 3] = Math.round(data[i + 3] * WATERMARK_OPACITY);
  }

  const paddedWidth = info.width + margin;
  const paddedHeight = info.height + margin;

  const overlay = await sharp({
    create: {
      width: paddedWidth,
      height: paddedHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      {
        input: await sharp(data, {
          raw: {
            width: info.width,
            height: info.height,
            channels: 4,
          },
        })
          .png()
          .toBuffer(),
        left: 0,
        top: 0,
      },
    ])
    .png()
    .toBuffer();

  overlayCache.set(cacheKey, overlay);
  return overlay;
}
