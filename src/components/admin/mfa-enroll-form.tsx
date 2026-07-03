"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { MFA_TOTP_FRIENDLY_NAME, MFA_TOTP_ISSUER } from "@/lib/auth/admin-session";
import { supabase } from "@/lib/supabase/browser";

async function establishAdminSession() {
  await fetch("/api/admin/auth/session", { method: "POST" });
}

async function cleanupStaleMfaFactors() {
  const response = await fetch("/api/admin/auth/mfa-cleanup", { method: "POST" });
  const payload = (await response.json()) as { error?: string };

  if (!response.ok) {
    throw new Error(payload.error ?? "Unable to clear stale MFA factors.");
  }
}

function isDuplicateFriendlyNameError(message: string) {
  return message.toLowerCase().includes("friendly name") && message.toLowerCase().includes("already exists");
}

async function enrollTotpFactor() {
  let result = await supabase.auth.mfa.enroll({
    factorType: "totp",
    friendlyName: MFA_TOTP_FRIENDLY_NAME,
    issuer: MFA_TOTP_ISSUER,
  });

  if (result.error && isDuplicateFriendlyNameError(result.error.message)) {
    await cleanupStaleMfaFactors();
    result = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: MFA_TOTP_FRIENDLY_NAME,
      issuer: MFA_TOTP_ISSUER,
    });
  }

  return result;
}

type MfaEnrollFormProps = {
  nextPath: string;
};

export function MfaEnrollForm({ nextPath }: MfaEnrollFormProps) {
  const router = useRouter();
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function enroll() {
      setIsLoading(true);
      setErrorMessage(null);

      const { data: factors, error: listError } = await supabase.auth.mfa.listFactors();

      if (listError) {
        setErrorMessage(listError.message);
        setIsLoading(false);
        return;
      }

      const verified = factors?.totp?.find((factor) => factor.status === "verified");

      if (verified) {
        router.replace(nextPath);
        return;
      }

      const unverified = factors?.totp?.filter((factor) => factor.status !== "verified") ?? [];

      if (unverified.length > 0) {
        setFactorId(unverified[0].id);
        setIsLoading(false);
        return;
      }

      const { data, error } = await enrollTotpFactor();

      if (error || !data) {
        setErrorMessage(error?.message ?? "Unable to start MFA enrollment.");
        setIsLoading(false);
        return;
      }

      setQrCode(data.totp.qr_code.trim());
      setFactorId(data.id);
      setIsLoading(false);
    }

    void enroll();
  }, [nextPath, router]);

  async function startOver() {
    setIsLoading(true);
    setErrorMessage(null);
    setQrCode(null);
    setFactorId(null);
    setVerifyCode("");

    try {
      await cleanupStaleMfaFactors();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Unable to clear MFA factors.");
      setIsLoading(false);
      return;
    }

    const { data, error } = await enrollTotpFactor();

    if (error || !data) {
      setErrorMessage(error?.message ?? "Unable to start MFA enrollment.");
      setIsLoading(false);
      return;
    }

    setQrCode(data.totp.qr_code.trim());
    setFactorId(data.id);
    setIsLoading(false);
  }

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

    await fetch("/api/admin/auth/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "auth.mfa_enroll" }),
    });

    await establishAdminSession();

    router.replace(nextPath);
    router.refresh();
  }

  return (
    <div className="space-y-6 rounded-2xl border border-[#A79C89]/40 bg-white p-8 shadow-sm">
      <div className="space-y-2 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#C8A86A]">Security</p>
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[#3B0F14]">
          Set up authenticator
        </h1>
        <p className="text-sm text-[#A79C89]">
          Super Admins and Vendors must use TOTP MFA. Scan the QR code with Microsoft Authenticator
          — it will appear as &ldquo;{MFA_TOTP_FRIENDLY_NAME}&rdquo;.
        </p>
      </div>

      {errorMessage ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      {isLoading ? (
        <p className="text-center text-sm text-[#A79C89]">Preparing enrollment...</p>
      ) : (
        <>
          {qrCode ? (
            <div className="flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element -- Supabase returns a dynamic data URI */}
              <img
                src={qrCode}
                alt="MFA QR code"
                width={200}
                height={200}
                className="h-[200px] w-[200px] rounded-xl border border-[#A79C89]/40"
              />
            </div>
          ) : factorId ? (
            <div className="rounded-xl border border-[#C8A86A]/40 bg-[#FAF0DC] px-4 py-3 text-sm text-[#3B0F14]">
              An enrollment was already started. Open your authenticator app
              (&ldquo;{MFA_TOTP_FRIENDLY_NAME}&rdquo;) and enter the 6-digit code below, or show a
              new QR code to start again.
            </div>
          ) : null}

          {factorId && !qrCode ? (
            <button
              type="button"
              onClick={() => void startOver()}
              className="w-full rounded-xl border border-[#A79C89]/40 px-4 py-2.5 text-sm font-medium text-[#3B0F14] transition hover:border-[#C8A86A]"
            >
              Show new QR code
            </button>
          ) : null}

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
              {isSubmitting ? "Verifying..." : "Complete setup"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
