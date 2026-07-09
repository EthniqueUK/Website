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

type InviteSellerResult =
  | { ok: true; inviteId: string; emailWarning?: string }
  | { ok: false; error: string };

export async function inviteSellerAction(formData: FormData): Promise<InviteSellerResult> {
  try {
    const staff = await assertSuperAdmin();

    const displayName = parseRequired(formData.get("display_name"), "Name");
    const genderRaw = parseRequired(formData.get("gender"), "Gender");
    const email = parseRequired(formData.get("email"), "Email").toLowerCase();
    const phone = parseRequired(formData.get("phone"), "Phone number");
    const marketId = parseRequired(formData.get("market_id"), "Market");

    if (!isGender(genderRaw)) {
      return { ok: false, error: "Invalid gender selection." };
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { ok: false, error: "Enter a valid email address." };
    }

    const admin = createAdminClient();

    const { data: market, error: marketError } = await admin
      .from("markets")
      .select("id, name, code")
      .eq("id", marketId)
      .maybeSingle();

    if (marketError || !market) {
      return { ok: false, error: "Selected market was not found." };
    }

    const { data: existingInvite } = await admin
      .from("vendor_onboarding_invites")
      .select("id")
      .eq("status", "pending")
      .ilike("email", email)
      .maybeSingle();

    if (existingInvite) {
      return { ok: false, error: "A pending invite already exists for this email." };
    }

    const { data: existingStaff } = await admin
      .from("profiles")
      .select("id, role")
      .neq("role", "customer")
      .ilike("email", email)
      .maybeSingle();

    if (existingStaff) {
      return { ok: false, error: "A staff account already exists with this email." };
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
      console.error("Failed to create seller invite:", inviteError);
      return {
        ok: false,
        error:
          inviteError?.message
          ?? "Failed to create seller invite. Check that seller-field migrations are applied in production.",
      };
    }

    let emailWarning: string | undefined;

    try {
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
    } catch (emailError) {
      console.error("Seller invite email failed:", emailError);
      emailWarning =
        emailError instanceof Error
          ? `Invite was created, but the email could not be sent: ${emailError.message}`
          : "Invite was created, but the email could not be sent. Check RESEND_API_KEY and RESEND_FROM_EMAIL in production.";
    }

    await logAdminAction({
      actor: staff,
      action: "vendor.invite",
      entityType: "vendor_invite",
      entityId: invite.id,
      summary: `Invited seller ${email} for ${market.code.toUpperCase()} market`,
      metadata: {
        email,
        marketId,
        displayName,
        emailSent: !emailWarning,
      },
    });

    revalidatePath("/admin/users");
    revalidatePath("/admin/vendors/approvals");
    return { ok: true, inviteId: invite.id, emailWarning };
  } catch (error) {
    console.error("inviteSellerAction failed:", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to send invite.",
    };
  }
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
