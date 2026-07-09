"use client";

import { FormEvent, useState, useTransition } from "react";

import { FileUploadField } from "@/components/admin/file-upload-field";
import { SignaturePad } from "@/components/admin/signature-pad";
import { submitSellerOnboardingAction } from "@/lib/actions/vendor-actions";
import {
  ADDRESS_DOC_TYPES,
  GENDER_OPTIONS,
  IDENTITY_DOC_TYPES,
} from "@/lib/vendors/constants";

type InvitePrefill = {
  displayName: string;
  gender: string | null;
  email: string;
  phone: string | null;
  marketName: string;
  marketCode: string;
  countryCode: string;
};

type SellerOnboardingFormProps = {
  token: string;
  invite: InvitePrefill;
};

export function SellerOnboardingForm({ token, invite }: SellerOnboardingFormProps) {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [successNote, setSuccessNote] = useState<string | null>(null);
  const [identityDeferred, setIdentityDeferred] = useState(false);
  const [addressDeferred, setAddressDeferred] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage(null);

    const form = event.currentTarget;

    const formData = new FormData(form);
    formData.set("token", token);
    formData.set("identity_deferred", identityDeferred ? "1" : "0");
    formData.set("address_deferred", addressDeferred ? "1" : "0");
    formData.set("terms_accepted", termsAccepted ? "1" : "0");
    formData.set("signature_data_url", signatureDataUrl ?? "");
    formData.set("country_code", invite.countryCode);

    if (identityDeferred) {
      formData.delete("identity_file");
    }

    if (addressDeferred) {
      formData.delete("address_file");
    }

    startTransition(async () => {
      try {
        const result = await submitSellerOnboardingAction(formData);

        if (!result.ok) {
          setErrorMessage(result.error);
          return;
        }

        setSuccessNote(result.emailWarning ?? null);
        setSuccess(true);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Failed to submit onboarding form.",
        );
      }
    });
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <h1 className="font-[family-name:var(--font-playfair)] text-3xl text-[#3B0F14]">
          Thank you
        </h1>
        <p className="mt-3 text-sm text-[#2A5548]">
          Your onboarding form has been submitted. Ethnique will review your application.
          {successNote ? null : " You will receive a confirmation email shortly."}
        </p>
        {successNote ? (
          <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {successNote}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 rounded-2xl border border-[#A79C89]/40 bg-white p-6 shadow-sm sm:p-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#C8A86A]">
          Seller onboarding · {invite.marketName}
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-playfair)] text-3xl text-[#3B0F14]">
          Complete your seller profile
        </h1>
        <p className="mt-2 text-sm text-[#A79C89]">
          Review the details from your invite and complete the remaining required fields.
        </p>
      </div>

      {errorMessage ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-[#1F1F1F]">Name</span>
          <input
            name="display_name"
            defaultValue={invite.displayName}
            required
            className="w-full rounded-xl border border-[#A79C89]/40 px-4 py-3 text-sm outline-none focus:border-[#C8A86A]"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-[#1F1F1F]">Gender</span>
          <select
            name="gender"
            defaultValue={invite.gender ?? ""}
            required
            className="w-full rounded-xl border border-[#A79C89]/40 bg-white px-4 py-3 text-sm outline-none focus:border-[#C8A86A]"
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
          <input
            value={invite.marketName}
            readOnly
            className="w-full rounded-xl border border-[#A79C89]/30 bg-[#F7F3EB] px-4 py-3 text-sm text-[#A79C89]"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-[#1F1F1F]">Email</span>
          <input
            value={invite.email}
            readOnly
            className="w-full rounded-xl border border-[#A79C89]/30 bg-[#F7F3EB] px-4 py-3 text-sm text-[#A79C89]"
          />
        </label>

        <label className="block space-y-1.5 sm:col-span-2">
          <span className="text-sm font-medium text-[#1F1F1F]">Phone number</span>
          <input
            value={invite.phone ?? ""}
            readOnly
            className="w-full rounded-xl border border-[#A79C89]/30 bg-[#F7F3EB] px-4 py-3 text-sm text-[#A79C89]"
          />
        </label>
      </section>

      <section className="space-y-4 border-t border-[#A79C89]/20 pt-6">
        <h2 className="font-[family-name:var(--font-playfair)] text-xl text-[#3B0F14]">
          Address
        </h2>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-[#1F1F1F]">Address line 1 *</span>
          <input
            name="address_line1"
            required
            className="w-full rounded-xl border border-[#A79C89]/40 px-4 py-3 text-sm outline-none focus:border-[#C8A86A]"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-[#1F1F1F]">Address line 2</span>
          <input
            name="address_line2"
            className="w-full rounded-xl border border-[#A79C89]/40 px-4 py-3 text-sm outline-none focus:border-[#C8A86A]"
          />
        </label>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-[#1F1F1F]">City *</span>
            <input
              name="city"
              required
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
            <span className="text-sm font-medium text-[#1F1F1F]">Postal code *</span>
            <input
              name="postal_code"
              required
              className="w-full rounded-xl border border-[#A79C89]/40 px-4 py-3 text-sm outline-none focus:border-[#C8A86A]"
            />
          </label>
        </div>
        <input type="hidden" name="country_code" value={invite.countryCode || "GB"} />
      </section>

      <section className="space-y-4 border-t border-[#A79C89]/20 pt-6">
        <h2 className="font-[family-name:var(--font-playfair)] text-xl text-[#3B0F14]">
          Identity proof *
        </h2>
        <p className="text-sm text-[#A79C89]">
          Upload Passport or Driving Licence. Or choose to send later by email / WhatsApp.
        </p>
        <label className="flex items-center gap-2 text-sm text-[#1F1F1F]">
          <input
            type="checkbox"
            checked={identityDeferred}
            onChange={(event) => setIdentityDeferred(event.target.checked)}
          />
          I will send identity proof later by email or WhatsApp
        </label>
        {!identityDeferred ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-[#1F1F1F]">Document type</span>
              <select
                name="identity_doc_type"
                required={!identityDeferred}
                defaultValue=""
                className="w-full rounded-xl border border-[#A79C89]/40 bg-white px-4 py-3 text-sm"
              >
                <option value="" disabled>
                  Select type
                </option>
                {IDENTITY_DOC_TYPES.map((doc) => (
                  <option key={doc.value} value={doc.value}>
                    {doc.label}
                  </option>
                ))}
              </select>
            </label>
            <FileUploadField
              name="identity_file"
              required={!identityDeferred}
            />
          </div>
        ) : null}
      </section>

      <section className="space-y-4 border-t border-[#A79C89]/20 pt-6">
        <h2 className="font-[family-name:var(--font-playfair)] text-xl text-[#3B0F14]">
          Address proof *
        </h2>
        <p className="text-sm text-[#A79C89]">
          Upload Driving Licence or Utility Bill. Or choose to send later by email / WhatsApp.
        </p>
        <label className="flex items-center gap-2 text-sm text-[#1F1F1F]">
          <input
            type="checkbox"
            checked={addressDeferred}
            onChange={(event) => setAddressDeferred(event.target.checked)}
          />
          I will send address proof later by email or WhatsApp
        </label>
        {!addressDeferred ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-[#1F1F1F]">Document type</span>
              <select
                name="address_doc_type"
                required={!addressDeferred}
                defaultValue=""
                className="w-full rounded-xl border border-[#A79C89]/40 bg-white px-4 py-3 text-sm"
              >
                <option value="" disabled>
                  Select type
                </option>
                {ADDRESS_DOC_TYPES.map((doc) => (
                  <option key={doc.value} value={doc.value}>
                    {doc.label}
                  </option>
                ))}
              </select>
            </label>
            <FileUploadField
              name="address_file"
              required={!addressDeferred}
            />
          </div>
        ) : null}
      </section>

      <section className="space-y-4 border-t border-[#A79C89]/20 pt-6">
        <h2 className="font-[family-name:var(--font-playfair)] text-xl text-[#3B0F14]">
          Terms & digital signature
        </h2>
        <label className="flex items-start gap-3 text-sm text-[#1F1F1F]">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(event) => setTermsAccepted(event.target.checked)}
            className="mt-1"
            required
          />
          <span>
            I accept the{" "}
            <a href="/terms" target="_blank" rel="noreferrer" className="text-[#3B0F14] underline">
              Terms and Conditions
            </a>
            .
          </span>
        </label>
        <div>
          <p className="mb-2 text-sm font-medium text-[#1F1F1F]">Digital signature *</p>
          <SignaturePad onChange={setSignatureDataUrl} />
        </div>
      </section>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-[#3B0F14] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[#5C1520] disabled:opacity-60 sm:w-auto"
      >
        {isPending ? "Submitting…" : "Submit onboarding"}
      </button>
    </form>
  );
}
