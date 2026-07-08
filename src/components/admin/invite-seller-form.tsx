"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { inviteSellerAction } from "@/lib/actions/vendor-actions";
import { GENDER_OPTIONS } from "@/lib/vendors/constants";

type MarketOption = {
  id: string;
  name: string;
  code: string;
};

type InviteSellerFormProps = {
  markets: MarketOption[];
  defaultMarketId: string | null;
};

export function InviteSellerForm({ markets, defaultMarketId }: InviteSellerFormProps) {
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
        await inviteSellerAction(formData);
        setSuccessMessage("Invite sent. The seller will receive an onboarding email.");
        (event.target as HTMLFormElement).reset();
        router.refresh();
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Failed to send invite.");
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
          Add Seller / Vendor
        </h2>
        <p className="mt-1 text-sm text-[#A79C89]">
          Creates an invite and emails a 7-day onboarding link to the seller.
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
          <span className="text-sm font-medium text-[#1F1F1F]">Name</span>
          <input
            name="display_name"
            required
            className="w-full rounded-xl border border-[#A79C89]/40 px-4 py-3 text-sm outline-none focus:border-[#C8A86A] focus:ring-2 focus:ring-[#C8A86A]/20"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-[#1F1F1F]">Gender</span>
          <select
            name="gender"
            required
            defaultValue=""
            className="w-full rounded-xl border border-[#A79C89]/40 bg-white px-4 py-3 text-sm outline-none focus:border-[#C8A86A] focus:ring-2 focus:ring-[#C8A86A]/20"
          >
            <option value="" disabled>
              Select gender
            </option>
            {GENDER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-[#1F1F1F]">Market</span>
          <select
            name="market_id"
            required
            defaultValue={defaultMarketId ?? ""}
            className="w-full rounded-xl border border-[#A79C89]/40 bg-white px-4 py-3 text-sm outline-none focus:border-[#C8A86A] focus:ring-2 focus:ring-[#C8A86A]/20"
          >
            {markets.map((market) => (
              <option key={market.id} value={market.id}>
                {market.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-[#1F1F1F]">Email address</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            className="w-full rounded-xl border border-[#A79C89]/40 px-4 py-3 text-sm outline-none focus:border-[#C8A86A] focus:ring-2 focus:ring-[#C8A86A]/20"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-[#1F1F1F]">Phone number</span>
          <input
            type="tel"
            name="phone"
            required
            className="w-full rounded-xl border border-[#A79C89]/40 px-4 py-3 text-sm outline-none focus:border-[#C8A86A] focus:ring-2 focus:ring-[#C8A86A]/20"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-xl bg-[#3B0F14] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#5C1520] disabled:opacity-60"
      >
        {isPending ? "Sending invite…" : "Send onboarding invite"}
      </button>
    </form>
  );
}
