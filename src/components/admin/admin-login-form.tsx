"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { StaffRole } from "@/lib/auth/admin";
import { isStaffRole, requiresMandatoryMfa } from "@/lib/auth/permissions";
import { supabase } from "@/lib/supabase/browser";

type AdminLoginFormProps = {
  nextPath: string;
  reason?: string;
};

function getReasonMessage(reason?: string) {
  if (reason === "forbidden") {
    return "That account does not have admin access.";
  }

  if (reason === "auth") {
    return "Please sign in to continue.";
  }

  if (reason === "session_expired") {
    return "Your admin session has expired. Please sign in again.";
  }

  if (reason === "inactive") {
    return "This account is not active yet. Contact your administrator.";
  }

  return null;
}

export function AdminLoginForm({ nextPath, reason }: AdminLoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const helperMessage = useMemo(() => getReasonMessage(reason), [reason]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    const profileResponse = await fetch("/api/admin/auth/profile");
    const profileData = (await profileResponse.json()) as {
      role?: StaffRole | null;
      status?: string | null;
    };
    const role = profileData.role;

    if (!role || !isStaffRole(role)) {
      await supabase.auth.signOut();
      setErrorMessage("That account does not have admin access.");
      setIsSubmitting(false);
      return;
    }

    if (profileData.status && profileData.status !== "active") {
      await supabase.auth.signOut();
      setErrorMessage("This account is not active yet. Contact your administrator.");
      setIsSubmitting(false);
      return;
    }

    await fetch("/api/admin/auth/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "auth.login" }),
    });

    if (!requiresMandatoryMfa(role)) {
      await fetch("/api/admin/auth/session", { method: "POST" });
    }

    router.replace(nextPath);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border border-[#A79C89]/40 bg-white p-8 shadow-sm"
    >
      <div className="space-y-2 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#C8A86A]">
          Ethnique Admin
        </p>
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[#3B0F14]">
          Sign in
        </h1>
        <p className="text-sm text-[#A79C89]">
          Use your staff email and password to access the admin portal.
        </p>
      </div>

      {helperMessage ? (
        <div className="rounded-xl border border-[#C8A86A]/40 bg-[#FAF0DC] px-4 py-3 text-sm text-[#3B0F14]">
          {helperMessage}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <label className="block space-y-2">
        <span className="text-sm font-medium text-[#1F1F1F]">Email</span>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
          className="w-full rounded-xl border border-[#A79C89]/40 bg-white px-4 py-3 text-sm text-[#1F1F1F] outline-none transition focus:border-[#C8A86A] focus:ring-2 focus:ring-[#C8A86A]/20"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-[#1F1F1F]">Password</span>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
          className="w-full rounded-xl border border-[#A79C89]/40 bg-white px-4 py-3 text-sm text-[#1F1F1F] outline-none transition focus:border-[#C8A86A] focus:ring-2 focus:ring-[#C8A86A]/20"
        />
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center rounded-xl bg-[#3B0F14] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#5C1520] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
