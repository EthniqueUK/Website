"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { MFA_TOTP_FRIENDLY_NAME } from "@/lib/auth/admin-session";
import { supabase } from "@/lib/supabase/browser";

async function establishAdminSession() {
  await fetch("/api/admin/auth/session", { method: "POST" });
}

type MfaVerifyFormProps = {
  nextPath: string;
};

export function MfaVerifyForm({ nextPath }: MfaVerifyFormProps) {
  const router = useRouter();
  const [factorId, setFactorId] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadFactor() {
      const { data: factors, error } = await supabase.auth.mfa.listFactors();

      if (error) {
        setErrorMessage(error.message);
        setIsLoading(false);
        return;
      }

      const verified = factors?.totp?.find((factor) => factor.status === "verified");

      if (!verified) {
        router.replace(`/admin/mfa/enroll?next=${encodeURIComponent(nextPath)}`);
        return;
      }

      setFactorId(verified.id);
      setIsLoading(false);
    }

    void loadFactor();
  }, [nextPath, router]);

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!factorId) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId,
    });

    if (challengeError || !challenge) {
      setErrorMessage(challengeError?.message ?? "Unable to start MFA challenge.");
      setIsSubmitting(false);
      return;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code: verifyCode.trim(),
    });

    if (verifyError) {
      setErrorMessage(verifyError.message);
      setIsSubmitting(false);
      return;
    }

    await establishAdminSession();

    router.replace(nextPath);
    router.refresh();
  }

  return (
    <div className="space-y-5 rounded-2xl border border-[#A79C89]/40 bg-white p-8 shadow-sm">
      <div className="space-y-2 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#C8A86A]">Security</p>
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[#3B0F14]">
          Verify authenticator
        </h1>
        <p className="text-sm text-[#A79C89]">
          Enter the 6-digit code from &ldquo;{MFA_TOTP_FRIENDLY_NAME}&rdquo; in your authenticator app.
        </p>
      </div>

      {errorMessage ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      {isLoading ? (
        <p className="text-center text-sm text-[#A79C89]">Loading...</p>
      ) : (
        <>
          <form onSubmit={handleVerify} className="space-y-4">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-[#1F1F1F]">Verification code</span>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={verifyCode}
                onChange={(event) => setVerifyCode(event.target.value)}
                required
                className="w-full rounded-xl border border-[#A79C89]/40 bg-white px-4 py-3 text-sm text-[#1F1F1F] outline-none transition focus:border-[#C8A86A] focus:ring-2 focus:ring-[#C8A86A]/20"
                placeholder="6-digit code"
              />
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center rounded-xl bg-[#3B0F14] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#5C1520] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Verifying..." : "Continue"}
            </button>
          </form>

          <p className="border-t border-[#A79C89]/20 pt-4 text-center text-sm text-[#A79C89]">
            Lost access to your authenticator? Contact a Super Admin to reset MFA for your account.
          </p>
        </>
      )}
    </div>
  );
}
