"use server";

import { revalidatePath } from "next/cache";

import { logAdminAction } from "@/lib/audit/log-admin-action";
import { assertSuperAdmin, assertMfaVerified } from "@/lib/auth/admin";
import {
  sendResendEmail,
  vendorApprovedEmailHtml,
  vendorInviteEmailHtml,
  vendorRejectedEmailHtml,
  vendorSubmittedAdminEmailHtml,
  vendorSubmittedSellerEmailHtml,
} from "@/lib/email/vendor-emails";
import { getResendEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  ADDRESS_DOC_TYPES,
  GENDER_OPTIONS,
  IDENTITY_DOC_TYPES,
  ONBOARDING_INVITE_DAYS,
  type GenderValue,
} from "@/lib/vendors/constants";
import { createInviteToken, hashInviteToken } from "@/lib/vendors/invite-token";

function randomBytesPassword() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}A1!`;
}

function isGender(value: string): value is GenderValue {
  return GENDER_OPTIONS.some((option) => option.value === value);
}

function parseRequired(value: FormDataEntryValue | null, label: string) {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) {
    throw new Error(`${label} is required.`);
  }
  return text;
}

export async function inviteSellerAction(formData: FormData) {
  const staff = await assertSuperAdmin();

  const displayName = parseRequired(formData.get("display_name"), "Name");
  const genderRaw = parseRequired(formData.get("gender"), "Gender");
  const email = parseRequired(formData.get("email"), "Email").toLowerCase();
  const phone = parseRequired(formData.get("phone"), "Phone number");
  const marketId = parseRequired(formData.get("market_id"), "Market");

  if (!isGender(genderRaw)) {
    throw new Error("Invalid gender selection.");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Enter a valid email address.");
  }

  const admin = createAdminClient();

  const { data: market, error: marketError } = await admin
    .from("markets")
    .select("id, name, code")
    .eq("id", marketId)
    .maybeSingle();

  if (marketError || !market) {
    throw new Error("Selected market was not found.");
  }

  const { data: existingInvite } = await admin
    .from("vendor_onboarding_invites")
    .select("id")
    .eq("status", "pending")
    .ilike("email", email)
    .maybeSingle();

  if (existingInvite) {
    throw new Error("A pending invite already exists for this email.");
  }

  const { data: existingStaff } = await admin
    .from("profiles")
    .select("id, role")
    .neq("role", "customer")
    .ilike("email", email)
    .maybeSingle();

  if (existingStaff) {
    throw new Error("A staff account already exists with this email.");
  }

  const token = createInviteToken();
  const tokenHash = hashInviteToken(token);
  const expiresAt = new Date();
  expiresAt.setUTCDate(expiresAt.getUTCDate() + ONBOARDING_INVITE_DAYS);

  const { data: invite, error: inviteError } = await admin
    .from("vendor_onboarding_invites")
    .insert({
      email,
      market_id: marketId,
      token_hash: tokenHash,
      invited_by: staff.userId,
      expires_at: expiresAt.toISOString(),
      status: "pending",
      display_name: displayName,
      gender: genderRaw,
      phone,
    })
    .select("id")
    .single();

  if (inviteError || !invite) {
    throw new Error(inviteError?.message ?? "Failed to create seller invite.");
  }

  await sendResendEmail({
    type: "vendor_onboarding_invite",
    to: email,
    subject: "Complete your Ethnique seller onboarding",
    html: vendorInviteEmailHtml({
      name: displayName,
      marketName: market.name,
      token,
      expiresAt,
    }),
    inviteId: invite.id,
  });

  await logAdminAction({
    actor: staff,
    action: "vendor.invite",
    entityType: "vendor_invite",
    entityId: invite.id,
    summary: `Invited seller ${email} for ${market.code.toUpperCase()} market`,
    metadata: { email, marketId, displayName },
  });

  revalidatePath("/admin/users");
  return { ok: true as const, inviteId: invite.id };
}

export type VendorInviteView = {
  id: string;
  email: string;
  market_id: string;
  display_name: string | null;
  gender: string | null;
  phone: string | null;
  status: string;
  expires_at: string;
  markets: {
    id: string;
    name: string;
    code: string;
    country_code: string;
  } | null;
};

export async function getInviteByToken(
  token: string,
): Promise<{ invite: VendorInviteView } | { error: string }> {
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
    return { error: "This invite link is invalid." };
  }

  if (invite.status === "revoked") {
    return { error: "This invite has been cancelled. Please contact Ethnique if you need assistance." };
  }

  if (invite.status !== "pending") {
    return { error: "This invite link has already been used or revoked." };
  }

  if (new Date(invite.expires_at).getTime() < Date.now()) {
    await admin
      .from("vendor_onboarding_invites")
      .update({ status: "expired" })
      .eq("id", invite.id);
    return {
      error: "This invite link has expired. Please ask Ethnique to send a new invite.",
    };
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
  };
}

type SubmitOnboardingResult =
  | { ok: true; submissionId: string; emailWarning?: string }
  | { ok: false; error: string };

const MAX_PROOF_BYTES = 10 * 1024 * 1024;

function formText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function formBool(value: FormDataEntryValue | null) {
  return value === "true" || value === "1";
}

function formFile(value: FormDataEntryValue | null): File | null {
  if (value instanceof File && value.size > 0) {
    return value;
  }
  return null;
}

function validateProofFile(file: File, label: string) {
  if (file.size > MAX_PROOF_BYTES) {
    throw new Error(`${label} must be 10 MB or smaller.`);
  }
}

export async function submitSellerOnboardingAction(
  formData: FormData,
): Promise<SubmitOnboardingResult> {
  try {
    const token = formText(formData.get("token"));
    if (!token) {
      return { ok: false, error: "Invalid onboarding link." };
    }

    const inviteResult = await getInviteByToken(token);
    if ("error" in inviteResult) {
      return { ok: false, error: inviteResult.error };
    }

    const invite = inviteResult.invite;
    const market = invite.markets;

    if (!market) {
      return { ok: false, error: "Invite market is missing." };
    }

    const displayName = formText(formData.get("display_name"));
    const gender = formText(formData.get("gender"));
    const addressLine1 = formText(formData.get("address_line1"));
    const addressLine2 = formText(formData.get("address_line2"));
    const city = formText(formData.get("city"));
    const stateRegion = formText(formData.get("state_region"));
    const postalCode = formText(formData.get("postal_code"));
    const countryCode = formText(formData.get("country_code")) || invite.markets?.country_code || "GB";
    const identityDeferred = formBool(formData.get("identity_deferred"));
    const addressDeferred = formBool(formData.get("address_deferred"));
    const identityDocType = formText(formData.get("identity_doc_type")) || null;
    const addressDocType = formText(formData.get("address_doc_type")) || null;
    const identityFile = identityDeferred ? null : formFile(formData.get("identity_file"));
    const addressFile = addressDeferred ? null : formFile(formData.get("address_file"));
    const termsAccepted = formBool(formData.get("terms_accepted"));
    const signatureDataUrl = formText(formData.get("signature_data_url"));

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

    if (!identityDeferred) {
      if (!identityFile) {
        return { ok: false, error: "Identity proof is required, or choose to send later." };
      }
      validateProofFile(identityFile, "Identity proof");
      if (!IDENTITY_DOC_TYPES.some((doc) => doc.value === identityDocType)) {
        return { ok: false, error: "Select a valid identity document type." };
      }
    }

    if (!addressDeferred) {
      if (!addressFile) {
        return { ok: false, error: "Address proof is required, or choose to send later." };
      }
      validateProofFile(addressFile, "Address proof");
      if (!ADDRESS_DOC_TYPES.some((doc) => doc.value === addressDocType)) {
        return { ok: false, error: "Select a valid address document type." };
      }
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

    async function uploadProof(file: File, category: "identity" | "address", docType: string) {
      const extension = file.name.split(".").pop()?.toLowerCase() || "bin";
      const path = `${submission!.id}/${category}-${Date.now()}.${extension}`;

      const bytes = Buffer.from(await file.arrayBuffer());
      const { error: uploadError } = await admin.storage
        .from("vendor-identity-documents")
        .upload(path, bytes, {
          contentType: file.type || "application/octet-stream",
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Failed to upload ${category} proof: ${uploadError.message}`);
      }

      const { error: docError } = await admin.from("vendor_identity_documents").insert({
        submission_id: submission!.id,
        document_type: docType,
        proof_category: category,
        storage_path: path,
        original_filename: file.name,
        mime_type: file.type || null,
        file_size_bytes: file.size,
      });

      if (docError) {
        throw new Error(docError.message);
      }
    }

    if (!identityDeferred && identityFile && identityDocType) {
      await uploadProof(identityFile, "identity", identityDocType);
    }

    if (!addressDeferred && addressFile && addressDocType) {
      await uploadProof(addressFile, "address", addressDocType);
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

export async function approveSellerSubmissionAction(submissionId: string) {
  const staff = await assertMfaVerified();
  if (staff.role !== "super_admin") {
    throw new Error("Forbidden");
  }

  const admin = createAdminClient();

  const { data: submission, error } = await admin
    .from("vendor_onboarding_submissions")
    .select(
      "*, invite:vendor_onboarding_invites!inner(id, email, market_id, phone, markets:market_id(name, code))",
    )
    .eq("id", submissionId)
    .maybeSingle();

  if (error || !submission) {
    throw new Error("Submission not found.");
  }

  if (submission.status !== "submitted") {
    throw new Error("This submission has already been reviewed.");
  }

  const invite = Array.isArray(submission.invite) ? submission.invite[0] : submission.invite;
  const market = Array.isArray(invite.markets) ? invite.markets[0] : invite.markets;

  const temporaryPassword = `Eth-${randomBytesPassword()}`;

  const { data: createdUser, error: createUserError } = await admin.auth.admin.createUser({
    email: invite.email,
    password: temporaryPassword,
    email_confirm: true,
    user_metadata: {
      display_name: submission.display_name ?? submission.legal_name,
      role: "vendor",
    },
  });

  if (createUserError || !createdUser.user) {
    throw new Error(createUserError?.message ?? "Failed to create seller account.");
  }

  const userId = createdUser.user.id;

  const { error: profileError } = await admin.from("profiles").upsert({
    id: userId,
    email: invite.email,
    role: "vendor",
    status: "active",
    market_id: invite.market_id,
    display_name: submission.display_name ?? submission.legal_name,
    legal_name: submission.legal_name,
    gender: submission.gender,
    phone: submission.phone ?? invite.phone,
    address_line1: submission.address_line1,
    address_line2: submission.address_line2,
    city: submission.city,
    state_region: submission.state_region,
    postal_code: submission.postal_code,
    country_code: submission.country_code,
    totp_required: false,
    created_by: staff.userId,
    approved_by: staff.userId,
    approved_at: new Date().toISOString(),
  });

  if (profileError) {
    throw new Error(profileError.message);
  }

  await admin
    .from("vendor_onboarding_submissions")
    .update({
      status: "approved",
      profile_id: userId,
      reviewed_by: staff.userId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", submissionId);

  const { data: recoveryLink } = await admin.auth.admin.generateLink({
    type: "recovery",
    email: invite.email,
  });

  await sendResendEmail({
    type: "vendor_onboarding_approved",
    to: invite.email,
    subject: "Your Ethnique seller account is approved",
    html: vendorApprovedEmailHtml({
      name: submission.display_name ?? submission.legal_name,
      marketName: market?.name ?? "your",
      setPasswordLink: recoveryLink?.properties?.action_link ?? null,
    }),
    inviteId: invite.id,
    submissionId,
    profileId: userId,
  });

  await logAdminAction({
    actor: staff,
    action: "vendor.approve",
    entityType: "vendor_submission",
    entityId: submissionId,
    summary: `Approved seller ${invite.email}`,
    metadata: { profileId: userId, marketId: invite.market_id },
  });

  revalidatePath("/admin/vendors/approvals");
  revalidatePath("/admin/users");

  return { ok: true as const, userId };
}

export async function rejectSellerSubmissionAction(submissionId: string, reason: string) {
  const staff = await assertMfaVerified();
  if (staff.role !== "super_admin") {
    throw new Error("Forbidden");
  }

  const trimmedReason = reason.trim();
  if (!trimmedReason) {
    throw new Error("A rejection reason is required.");
  }

  const admin = createAdminClient();

  const { data: submission, error } = await admin
    .from("vendor_onboarding_submissions")
    .select("*, invite:vendor_onboarding_invites!inner(id, email)")
    .eq("id", submissionId)
    .maybeSingle();

  if (error || !submission) {
    throw new Error("Submission not found.");
  }

  if (submission.status !== "submitted") {
    throw new Error("This submission has already been reviewed.");
  }

  const invite = Array.isArray(submission.invite) ? submission.invite[0] : submission.invite;

  await admin
    .from("vendor_onboarding_submissions")
    .update({
      status: "rejected",
      rejection_reason: trimmedReason,
      reviewed_by: staff.userId,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", submissionId);

  await sendResendEmail({
    type: "vendor_onboarding_rejected",
    to: invite.email,
    subject: "Update on your Ethnique seller onboarding",
    html: vendorRejectedEmailHtml({
      name: submission.display_name ?? submission.legal_name,
      reason: trimmedReason,
    }),
    inviteId: invite.id,
    submissionId,
  });

  await logAdminAction({
    actor: staff,
    action: "vendor.reject",
    entityType: "vendor_submission",
    entityId: submissionId,
    summary: `Rejected seller ${invite.email}`,
    metadata: { reason: trimmedReason },
  });

  revalidatePath("/admin/vendors/approvals");
  return { ok: true as const };
}

export async function deleteOnboardingRequestAction(inviteId: string) {
  const staff = await assertMfaVerified();
  if (staff.role !== "super_admin") {
    throw new Error("Forbidden");
  }

  const admin = createAdminClient();

  const { data: invite, error: inviteError } = await admin
    .from("vendor_onboarding_invites")
    .select("id, email, status, display_name, markets:market_id(name, code)")
    .eq("id", inviteId)
    .maybeSingle();

  if (inviteError || !invite) {
    throw new Error("Onboarding request not found.");
  }

  if (invite.status === "revoked") {
    throw new Error("This request has already been deleted.");
  }

  const { data: submission } = await admin
    .from("vendor_onboarding_submissions")
    .select(
      "id, status, documents:vendor_identity_documents(storage_path)",
    )
    .eq("invite_id", inviteId)
    .maybeSingle();

  if (submission && submission.status !== "submitted") {
    throw new Error("Only open onboarding requests can be deleted.");
  }

  if (invite.status !== "pending" && !submission) {
    throw new Error("This request cannot be deleted.");
  }

  if (submission) {
    const documents = submission.documents ?? [];
    const paths = documents
      .map((doc) => doc.storage_path)
      .filter((path): path is string => Boolean(path));

    if (paths.length > 0) {
      const { error: storageError } = await admin.storage
        .from("vendor-identity-documents")
        .remove(paths);

      if (storageError) {
        throw new Error(`Failed to remove uploaded documents: ${storageError.message}`);
      }
    }

    const { error: deleteSubmissionError } = await admin
      .from("vendor_onboarding_submissions")
      .delete()
      .eq("id", submission.id);

    if (deleteSubmissionError) {
      throw new Error(deleteSubmissionError.message);
    }
  }

  const { error: revokeError } = await admin
    .from("vendor_onboarding_invites")
    .update({
      status: "revoked",
      revoked_at: new Date().toISOString(),
      revoked_by: staff.userId,
    })
    .eq("id", inviteId);

  if (revokeError) {
    throw new Error(revokeError.message);
  }

  const market = Array.isArray(invite.markets) ? invite.markets[0] : invite.markets;

  await logAdminAction({
    actor: staff,
    action: "vendor.delete_request",
    entityType: "vendor_invite",
    entityId: inviteId,
    summary: `Deleted onboarding request for ${invite.email}`,
    metadata: {
      email: invite.email,
      submissionId: submission?.id ?? null,
      marketCode: market?.code ?? null,
    },
  });

  revalidatePath("/admin/vendors/approvals");
  revalidatePath("/admin/users");

  return { ok: true as const };
}
