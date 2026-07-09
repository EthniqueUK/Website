import {
  sendResendEmail,
  vendorSubmittedAdminEmailHtml,
  vendorSubmittedSellerEmailHtml,
} from "@/lib/email/vendor-emails";
import { getResendEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  ADDRESS_DOC_TYPES,
  GENDER_OPTIONS,
  IDENTITY_DOC_TYPES,
  type GenderValue,
} from "@/lib/vendors/constants";
import { hashInviteToken } from "@/lib/vendors/invite-token";

type SubmitOnboardingResult =
  | { ok: true; submissionId: string; emailWarning?: string }
  | { ok: false; error: string };

type UploadedProof = {
  storagePath: string;
  documentType: string;
  originalFilename: string;
  mimeType: string | null;
  fileSizeBytes: number;
};

export type SubmitOnboardingPayload = {
  token: string;
  displayName: string;
  gender: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  stateRegion?: string;
  postalCode: string;
  countryCode: string;
  identityDeferred: boolean;
  addressDeferred: boolean;
  termsAccepted: boolean;
  signatureDataUrl: string;
  identityProof?: UploadedProof | null;
  addressProof?: UploadedProof | null;
};

const MAX_SIGNATURE_CHARS = 350_000;

function isGender(value: string): value is GenderValue {
  return GENDER_OPTIONS.some((option) => option.value === value);
}

function textValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function boolValue(value: unknown) {
  return value === true || value === "true" || value === "1" || value === 1;
}

function isUploadedProof(value: unknown): value is UploadedProof {
  if (!value || typeof value !== "object") return false;
  const proof = value as UploadedProof;
  return (
    typeof proof.storagePath === "string"
    && proof.storagePath.length > 0
    && typeof proof.documentType === "string"
    && typeof proof.originalFilename === "string"
    && typeof proof.fileSizeBytes === "number"
  );
}

function assertProofBelongsToInvite(storagePath: string, tokenHash: string) {
  const expectedPrefix = `pending/${tokenHash}/`;
  if (!storagePath.startsWith(expectedPrefix)) {
    throw new Error("Uploaded document does not match this invite.");
  }
}

async function getValidInvite(token: string) {
  const admin = createAdminClient();
  const tokenHash = hashInviteToken(token);

  const { data: invite, error } = await admin
    .from("vendor_onboarding_invites")
    .select(
      "id, email, market_id, display_name, gender, phone, status, expires_at, markets:market_id (id, name, code, country_code)",
    )
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (error || !invite) {
    return { error: "This invite link is invalid." } as const;
  }

  if (invite.status === "revoked") {
    return {
      error: "This invite has been cancelled. Please contact Ethnique if you need assistance.",
    } as const;
  }

  if (invite.status !== "pending") {
    return { error: "This invite link has already been used or revoked." } as const;
  }

  if (new Date(invite.expires_at).getTime() < Date.now()) {
    await admin
      .from("vendor_onboarding_invites")
      .update({ status: "expired" })
      .eq("id", invite.id);
    return {
      error: "This invite link has expired. Please ask Ethnique to send a new invite.",
    } as const;
  }

  const markets = Array.isArray(invite.markets) ? invite.markets[0] : invite.markets;

  return {
    invite: {
      id: invite.id,
      email: invite.email,
      market_id: invite.market_id,
      display_name: invite.display_name,
      gender: invite.gender,
      phone: invite.phone,
      status: invite.status,
      expires_at: invite.expires_at,
      markets: markets
        ? {
            id: markets.id,
            name: markets.name,
            code: markets.code,
            country_code: markets.country_code,
          }
        : null,
    },
  } as const;
}

export async function submitSellerOnboardingPayload(
  raw: unknown,
): Promise<SubmitOnboardingResult> {
  try {
    const input = (raw ?? {}) as Partial<SubmitOnboardingPayload>;
    const token = textValue(input.token);
    if (!token) {
      return { ok: false, error: "Invalid onboarding link." };
    }

    const inviteResult = await getValidInvite(token);
    if ("error" in inviteResult) {
      return { ok: false, error: inviteResult.error ?? "Invalid onboarding link." };
    }

    const invite = inviteResult.invite;
    const market = invite.markets;

    if (!market) {
      return { ok: false, error: "Invite market is missing." };
    }

    const displayName = textValue(input.displayName);
    const gender = textValue(input.gender);
    const addressLine1 = textValue(input.addressLine1);
    const addressLine2 = textValue(input.addressLine2);
    const city = textValue(input.city);
    const stateRegion = textValue(input.stateRegion);
    const postalCode = textValue(input.postalCode);
    const countryCode =
      textValue(input.countryCode) || invite.markets?.country_code || "GB";
    const identityDeferred = boolValue(input.identityDeferred);
    const addressDeferred = boolValue(input.addressDeferred);
    const termsAccepted = boolValue(input.termsAccepted);
    const signatureDataUrl = textValue(input.signatureDataUrl);
    const identityProof = isUploadedProof(input.identityProof) ? input.identityProof : null;
    const addressProof = isUploadedProof(input.addressProof) ? input.addressProof : null;
    const tokenHash = hashInviteToken(token);

    if (!displayName) return { ok: false, error: "Name is required." };
    if (!isGender(gender)) return { ok: false, error: "Invalid gender selection." };
    if (!addressLine1) return { ok: false, error: "Address is required." };
    if (!city) return { ok: false, error: "City is required." };
    if (!postalCode) return { ok: false, error: "Postal code is required." };
    if (!countryCode) return { ok: false, error: "Country is required." };
    if (!termsAccepted) {
      return { ok: false, error: "You must accept the Terms and Conditions." };
    }
    if (!signatureDataUrl.startsWith("data:image/")) {
      return { ok: false, error: "A digital signature is required." };
    }
    if (signatureDataUrl.length > MAX_SIGNATURE_CHARS) {
      return {
        ok: false,
        error: "Signature image is too large. Please clear and sign again with a simpler stroke.",
      };
    }

    if (!identityDeferred) {
      if (!identityProof) {
        return { ok: false, error: "Identity proof is required, or choose to send later." };
      }
      if (!IDENTITY_DOC_TYPES.some((doc) => doc.value === identityProof.documentType)) {
        return { ok: false, error: "Select a valid identity document type." };
      }
      assertProofBelongsToInvite(identityProof.storagePath, tokenHash);
    }

    if (!addressDeferred) {
      if (!addressProof) {
        return { ok: false, error: "Address proof is required, or choose to send later." };
      }
      if (!ADDRESS_DOC_TYPES.some((doc) => doc.value === addressProof.documentType)) {
        return { ok: false, error: "Select a valid address document type." };
      }
      assertProofBelongsToInvite(addressProof.storagePath, tokenHash);
    }

    const admin = createAdminClient();

    const { data: submission, error: submissionError } = await admin
      .from("vendor_onboarding_submissions")
      .insert({
        invite_id: invite.id,
        legal_name: displayName,
        display_name: displayName,
        phone: invite.phone ?? "",
        gender,
        address_line1: addressLine1,
        address_line2: addressLine2 || null,
        city,
        state_region: stateRegion || null,
        postal_code: postalCode,
        country_code: countryCode.toUpperCase(),
        status: "submitted",
        terms_accepted_at: new Date().toISOString(),
        signature_data_url: signatureDataUrl,
        identity_proof_deferred: identityDeferred,
        address_proof_deferred: addressDeferred,
      })
      .select("id")
      .single();

    if (submissionError || !submission) {
      return {
        ok: false,
        error: submissionError?.message ?? "Failed to save onboarding submission.",
      };
    }

    async function attachProof(proof: UploadedProof, category: "identity" | "address") {
      const destination = `${submission!.id}/${category}-${Date.now()}-${proof.originalFilename
        .replace(/[^a-zA-Z0-9._-]/g, "_")
        .slice(0, 80)}`;

      const { error: moveError } = await admin.storage
        .from("vendor-identity-documents")
        .move(proof.storagePath, destination);

      const finalPath = moveError ? proof.storagePath : destination;
      if (moveError) {
        console.error(`Could not move ${category} proof; keeping pending path:`, moveError);
      }

      const { error: docError } = await admin.from("vendor_identity_documents").insert({
        submission_id: submission!.id,
        document_type: proof.documentType,
        proof_category: category,
        storage_path: finalPath,
        original_filename: proof.originalFilename,
        mime_type: proof.mimeType,
        file_size_bytes: proof.fileSizeBytes,
      });

      if (docError) {
        throw new Error(docError.message);
      }
    }

    if (!identityDeferred && identityProof) {
      await attachProof(identityProof, "identity");
    }

    if (!addressDeferred && addressProof) {
      await attachProof(addressProof, "address");
    }

    await admin
      .from("vendor_onboarding_invites")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", invite.id);

    let emailWarning: string | undefined;

    try {
      const notifyEmail = getResendEnv().ADMIN_NOTIFICATION_EMAIL;

      await Promise.all([
        sendResendEmail({
          type: "vendor_onboarding_submitted_vendor",
          to: invite.email,
          subject: "We received your Ethnique seller onboarding",
          html: vendorSubmittedSellerEmailHtml({ name: displayName }),
          inviteId: invite.id,
          submissionId: submission.id,
        }),
        sendResendEmail({
          type: "vendor_onboarding_submitted_admin",
          to: notifyEmail,
          subject: `Seller onboarding submitted: ${displayName}`,
          html: vendorSubmittedAdminEmailHtml({
            name: displayName,
            email: invite.email,
            marketName: market.name,
          }),
          inviteId: invite.id,
          submissionId: submission.id,
        }),
      ]);
    } catch (emailError) {
      console.error("Onboarding confirmation emails failed:", emailError);
      emailWarning =
        emailError instanceof Error
          ? `Your form was saved, but confirmation emails could not be sent: ${emailError.message}`
          : "Your form was saved, but confirmation emails could not be sent.";
    }

    return { ok: true, submissionId: submission.id, emailWarning };
  } catch (error) {
    console.error("Seller onboarding submission failed:", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to submit onboarding form.",
    };
  }
}
