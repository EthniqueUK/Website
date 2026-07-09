"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  deleteStaffUserAction,
  resetStaffPasswordAction,
  updateStaffStatusAction,
} from "@/lib/actions/user-actions";

type StaffUserActionsProps = {
  userId: string;
  userEmail: string;
  userName: string;
  userRole: string;
  userStatus: string;
  canManage: boolean;
  canDelete: boolean;
  isSelf: boolean;
};

export function StaffUserActions({
  userId,
  userEmail,
  userName,
  userRole,
  userStatus,
  canManage,
  canDelete,
  isSelf,
}: StaffUserActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showReset, setShowReset] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const canResetPassword = canManage || isSelf;
  const isActive = userStatus === "active";

  function runAction(action: () => Promise<unknown>) {
    setErrorMessage(null);
    startTransition(async () => {
      try {
        await action();
        setShowReset(false);
        setShowDeleteConfirm(false);
        setNewPassword("");
        router.refresh();
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Action failed.");
      }
    });
  }

  if (!canManage && !canResetPassword) {
    return null;
  }

  return (
    <div className="space-y-2">
      {errorMessage ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {errorMessage}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {canResetPassword ? (
          <button
            type="button"
            onClick={() => setShowReset((value) => !value)}
            disabled={isPending}
            className="rounded-lg border border-[#A79C89]/40 bg-white px-3 py-1.5 text-xs font-semibold text-[#3B0F14] hover:bg-[#F7F3EB] disabled:opacity-60"
          >
            {isSelf ? "Change password" : "Reset password"}
          </button>
        ) : null}

        {canManage && !isSelf ? (
          <>
            <button
              type="button"
              onClick={() =>
                runAction(() =>
                  updateStaffStatusAction(userId, isActive ? "deactivated" : "active"),
                )
              }
              disabled={isPending}
              className="rounded-lg border border-[#A79C89]/40 bg-white px-3 py-1.5 text-xs font-semibold text-[#3B0F14] hover:bg-[#F7F3EB] disabled:opacity-60"
            >
              {isActive ? "Deactivate" : "Activate"}
            </button>

            {canDelete ? (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm((value) => !value)}
                disabled={isPending}
                className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
              >
                Delete
              </button>
            ) : null}
          </>
        ) : null}
      </div>

      {showReset ? (
        <div className="space-y-2 rounded-xl border border-[#A79C89]/30 bg-[#F7F3EB]/60 p-3">
          <p className="text-xs text-[#5C5348]">
            {isSelf
              ? "Enter a new password for your account."
              : `Set a new password for ${userName || userEmail}.`}
          </p>
          <input
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            placeholder="New password"
            minLength={8}
            autoComplete="new-password"
            className="w-full rounded-lg border border-[#A79C89]/40 px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={() => runAction(() => resetStaffPasswordAction(userId, newPassword))}
            disabled={isPending || newPassword.length < 8}
            className="rounded-lg bg-[#3B0F14] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
          >
            {isPending ? "Saving…" : "Save password"}
          </button>
        </div>
      ) : null}

      {showDeleteConfirm ? (
        <div className="space-y-2 rounded-xl border border-red-200 bg-red-50/60 p-3">
          <p className="text-xs text-red-800">
            Permanently delete <strong>{userName || userEmail}</strong> ({userRole.replaceAll("_", " ")})?
            This cannot be undone.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => runAction(() => deleteStaffUserAction(userId))}
              disabled={isPending}
              className="rounded-lg bg-red-700 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
            >
              {isPending ? "Deleting…" : "Confirm delete"}
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isPending}
              className="rounded-lg border border-[#A79C89]/40 bg-white px-3 py-1.5 text-xs font-semibold text-[#3B0F14] disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
