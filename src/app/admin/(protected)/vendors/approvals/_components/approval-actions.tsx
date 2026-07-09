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

  function approve() {
    setErrorMessage(null);
    startTransition(async () => {
      try {
        await approveSellerSubmissionAction(submissionId);
        router.refresh();
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Approve failed.");
      }
    });
  }

  function reject() {
    setErrorMessage(null);
    startTransition(async () => {
      try {
        await rejectSellerSubmissionAction(submissionId, reason);
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
          onClick={() => setShowReject((value) => !value)}
          disabled={isPending}
          className="rounded-xl border border-[#A79C89]/40 bg-[#F7F3EB] px-4 py-2 text-xs font-semibold text-[#3B0F14] disabled:opacity-60"
        >
          Reject
        </button>
      </div>

      {showReject ? (
        <div className="space-y-2 rounded-xl border border-[#A79C89]/30 bg-[#F7F3EB]/60 p-3">
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Rejection reason"
            rows={3}
            className="w-full rounded-lg border border-[#A79C89]/40 px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={reject}
            disabled={isPending}
            className="rounded-xl bg-red-700 px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
          >
            Confirm rejection
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
