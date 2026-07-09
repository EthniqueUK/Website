"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { deleteOnboardingRequestAction } from "@/lib/actions/vendor-actions";

type DeleteRequestButtonProps = {
  inviteId: string;
  vendorName: string;
  variant?: "pending" | "submitted";
};

export function DeleteRequestButton({
  inviteId,
  vendorName,
  variant = "pending",
}: DeleteRequestButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  function confirmDelete() {
    setErrorMessage(null);
    startTransition(async () => {
      try {
        await deleteOnboardingRequestAction(inviteId);
        setShowConfirm(false);
        router.refresh();
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to delete request.",
        );
      }
    });
  }

  return (
    <div className="space-y-2">
      {errorMessage ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {errorMessage}
        </p>
      ) : null}

      {!showConfirm ? (
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          disabled={isPending}
          className="rounded-xl border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
        >
          Delete request
        </button>
      ) : (
        <div className="max-w-sm space-y-2 rounded-xl border border-red-200 bg-red-50/60 p-3">
          <p className="text-xs leading-relaxed text-red-800">
            Delete the onboarding request for <strong>{vendorName}</strong>?{" "}
            {variant === "pending"
              ? "They will no longer be able to use their invite link."
              : "Their submitted form and uploaded documents will be removed."}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={confirmDelete}
              disabled={isPending}
              className="rounded-xl bg-red-700 px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
            >
              {isPending ? "Deleting…" : "Confirm delete"}
            </button>
            <button
              type="button"
              onClick={() => setShowConfirm(false)}
              disabled={isPending}
              className="rounded-xl border border-[#A79C89]/40 bg-white px-4 py-2 text-xs font-semibold text-[#3B0F14] disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
