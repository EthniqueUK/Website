"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  approveSellerSubmissionAction,
  rejectSellerSubmissionAction,
} from "@/lib/actions/vendor-actions";

import { DeleteRequestButton } from "./delete-request-button";

type ApprovalActionsProps = {
  submissionId: string;
  inviteId: string;
  vendorName: string;
};

export function ApprovalActions({ submissionId, inviteId, vendorName }: ApprovalActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [reasonError, setReasonError] = useState<string | null>(null);

  function approve() {
    setErrorMessage(null);
    setReasonError(null);
    setShowReject(false);
    startTransition(async () => {
      try {
        await approveSellerSubmissionAction(submissionId);
        router.refresh();
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Approve failed.");
      }
    });
  }

  function openReject() {
    setErrorMessage(null);
    setReasonError(null);
    setShowReject(true);
  }

  function reject() {
    setErrorMessage(null);
    const trimmed = reason.trim();
    if (!trimmed) {
      setReasonError("Please enter a rejection reason before confirming.");
      setShowReject(true);
      return;
    }

    setReasonError(null);
    startTransition(async () => {
      try {
        await rejectSellerSubmissionAction(submissionId, trimmed);
        setShowReject(false);
        setReason("");
        router.refresh();
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Reject failed.");
      }
    });
  }

  return (
    <div className="space-y-3">
      {errorMessage ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {errorMessage}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={approve}
          disabled={isPending}
          className="rounded-xl bg-[#3B0F14] px-4 py-2 text-xs font-semibold text-white hover:bg-[#5C1520] disabled:opacity-60"
        >
          {isPending ? "Working…" : "Approve"}
        </button>
        <button
          type="button"
          onClick={() => (showReject ? setShowReject(false) : openReject())}
          disabled={isPending}
          className="rounded-xl border border-[#A79C89]/40 bg-[#F7F3EB] px-4 py-2 text-xs font-semibold text-[#3B0F14] disabled:opacity-60"
        >
          {showReject ? "Cancel reject" : "Reject"}
        </button>
      </div>

      {showReject ? (
        <div className="space-y-2 rounded-xl border border-red-200 bg-red-50/50 p-3">
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-red-800">
              Rejection reason <span className="font-normal">(required)</span>
            </span>
            <textarea
              value={reason}
              onChange={(event) => {
                setReason(event.target.value);
                if (reasonError && event.target.value.trim()) {
                  setReasonError(null);
                }
              }}
              placeholder="Explain why this seller application is being rejected…"
              rows={3}
              required
              aria-required="true"
              className={`w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring-2 ${
                reasonError
                  ? "border-red-400 focus:ring-red-200"
                  : "border-[#A79C89]/40 focus:ring-[#C8A86A]/30"
              }`}
            />
          </label>
          {reasonError ? (
            <p className="text-xs font-medium text-red-700">{reasonError}</p>
          ) : (
            <p className="text-xs text-[#5C5348]">
              The seller will receive this reason by email.
            </p>
          )}
          <button
            type="button"
            onClick={reject}
            disabled={isPending || !reason.trim()}
            className="rounded-xl bg-red-700 px-4 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? "Rejecting…" : "Confirm rejection"}
          </button>
        </div>
      ) : null}

      <DeleteRequestButton
        inviteId={inviteId}
        vendorName={vendorName}
        variant="submitted"
      />
    </div>
  );
}
