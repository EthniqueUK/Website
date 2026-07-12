"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { deleteProductAction } from "@/lib/actions/product-actions";

type Props = {
  productId: string;
  productName: string;
  hasSales: boolean;
};

export function DeleteProductButton({ productId, productName, hasSales }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    const confirmationMessage = hasSales
      ? `Archive "${productName}"?\n\nThis product has sales history, so it will be archived instead of permanently deleted. It will be hidden from the storefront but kept for order reference.`
      : `Delete "${productName}"?\n\nThis will permanently remove the product, its market data, image records, and stored images. This cannot be undone.`;

    if (!window.confirm(confirmationMessage)) {
      return;
    }

    startTransition(async () => {
      const result = await deleteProductAction(productId);
      if (!result.ok) {
        window.alert(result.error ?? "Failed to delete product.");
        return;
      }
      window.alert(hasSales ? "Product archived." : "Product deleted.");
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isPending ? "Working…" : hasSales ? "Archive" : "Delete"}
    </button>
  );
}
