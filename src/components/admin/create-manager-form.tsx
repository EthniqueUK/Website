"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { createManagerAction } from "@/lib/actions/user-actions";

export function CreateManagerForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        await createManagerAction(formData);
        setSuccessMessage("Manager account created. They can sign in with their email and password.");
        (event.target as HTMLFormElement).reset();
        router.refresh();
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Failed to create manager.");
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-[#A79C89]/40 bg-white p-6 shadow-sm"
    >
      <div>
        <h2 className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-[#3B0F14]">
          Add Manager
        </h2>
        <p className="mt-1 text-sm text-[#A79C89]">
          Create a manager account for your market. Passwords are stored securely by Supabase Auth.
        </p>
      </div>

      {errorMessage ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      {successMessage ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {successMessage}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5 sm:col-span-2">
          <span className="text-sm font-medium text-[#1F1F1F]">Name *</span>
          <input
            name="display_name"
            required
            className="w-full rounded-xl border border-[#A79C89]/40 px-4 py-3 text-sm outline-none focus:border-[#C8A86A]"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-[#1F1F1F]">Email *</span>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-xl border border-[#A79C89]/40 px-4 py-3 text-sm outline-none focus:border-[#C8A86A]"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-[#1F1F1F]">Phone *</span>
          <input
            name="phone"
            required
            className="w-full rounded-xl border border-[#A79C89]/40 px-4 py-3 text-sm outline-none focus:border-[#C8A86A]"
          />
        </label>

        <label className="block space-y-1.5 sm:col-span-2">
          <span className="text-sm font-medium text-[#1F1F1F]">Password *</span>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full rounded-xl border border-[#A79C89]/40 px-4 py-3 text-sm outline-none focus:border-[#C8A86A]"
          />
          <span className="text-xs text-[#5C5348]">At least 8 characters with letters and numbers.</span>
        </label>

        <label className="block space-y-1.5 sm:col-span-2">
          <span className="text-sm font-medium text-[#1F1F1F]">Address line 1</span>
          <input
            name="address_line1"
            className="w-full rounded-xl border border-[#A79C89]/40 px-4 py-3 text-sm outline-none focus:border-[#C8A86A]"
          />
        </label>

        <label className="block space-y-1.5 sm:col-span-2">
          <span className="text-sm font-medium text-[#1F1F1F]">Address line 2</span>
          <input
            name="address_line2"
            className="w-full rounded-xl border border-[#A79C89]/40 px-4 py-3 text-sm outline-none focus:border-[#C8A86A]"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-[#1F1F1F]">City</span>
          <input
            name="city"
            className="w-full rounded-xl border border-[#A79C89]/40 px-4 py-3 text-sm outline-none focus:border-[#C8A86A]"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-[#1F1F1F]">County / Region</span>
          <input
            name="state_region"
            className="w-full rounded-xl border border-[#A79C89]/40 px-4 py-3 text-sm outline-none focus:border-[#C8A86A]"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-[#1F1F1F]">Postal code</span>
          <input
            name="postal_code"
            className="w-full rounded-xl border border-[#A79C89]/40 px-4 py-3 text-sm outline-none focus:border-[#C8A86A]"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-[#1F1F1F]">Country code</span>
          <input
            name="country_code"
            placeholder="GB"
            maxLength={2}
            className="w-full rounded-xl border border-[#A79C89]/40 px-4 py-3 text-sm uppercase outline-none focus:border-[#C8A86A]"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-xl bg-[#3B0F14] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#5C1520] disabled:opacity-60"
      >
        {isPending ? "Creating…" : "Create manager"}
      </button>
    </form>
  );
}
