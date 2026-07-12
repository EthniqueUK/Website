/** Product SKU prefix used for auto-allocated codes. */
export const PRODUCT_SKU_PREFIX = "ETH";

const SKU_PATTERN = /^ETH-(\d+)$/i;

export function formatProductSku(sequence: number) {
  return `${PRODUCT_SKU_PREFIX}-${String(sequence).padStart(5, "0")}`;
}

export function parseProductSkuSequence(sku: string | null | undefined) {
  if (!sku) {
    return null;
  }

  const match = SKU_PATTERN.exec(sku.trim());
  if (!match) {
    return null;
  }

  const value = Number.parseInt(match[1], 10);
  return Number.isFinite(value) ? value : null;
}

/** Starting sequence when no ETH-##### SKUs exist yet. */
export const PRODUCT_SKU_SEQUENCE_START = 10001;
