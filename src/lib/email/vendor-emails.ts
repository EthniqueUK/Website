import { Resend } from "resend";

import { getAppUrl, getResendEnv } from "@/lib/env";
import { createAdminClient } from "@/lib/supabase/admin";

type EmailType =
  | "vendor_onboarding_invite"
  | "vendor_onboarding_submitted_admin"
  | "vendor_onboarding_submitted_vendor"
  | "vendor_onboarding_approved"
  | "vendor_onboarding_rejected";

type SendEmailInput = {
  type: EmailType;
  to: string | string[];
  subject: string;
  html: string;
  inviteId?: string | null;
  submissionId?: string | null;
  profileId?: string | null;
};

async function logEmailEvent(input: {
  type: EmailType;
  to: string;
  status: "pending" | "sent" | "failed";
  providerMessageId?: string | null;
  errorMessage?: string | null;
  inviteId?: string | null;
  submissionId?: string | null;
  profileId?: string | null;
}) {
  try {
    const admin = createAdminClient();
    await admin.from("email_events").insert({
      recipient_email: input.to,
      email_type: input.type,
      provider: "resend",
      provider_message_id: input.providerMessageId ?? null,
      status: input.status,
      error_message: input.errorMessage ?? null,
      sent_at: input.status === "sent" ? new Date().toISOString() : null,
      invite_id: input.inviteId ?? null,
      submission_id: input.submissionId ?? null,
      profile_id: input.profileId ?? null,
    });
  } catch (error) {
    console.error("Failed to log email event:", error);
  }
}

export async function sendResendEmail(input: SendEmailInput) {
  const env = getResendEnv();
  const resend = new Resend(env.RESEND_API_KEY);
  const recipients = Array.isArray(input.to) ? input.to : [input.to];

  const { data, error } = await resend.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to: recipients,
    subject: input.subject,
    html: input.html,
  });

  for (const recipient of recipients) {
    await logEmailEvent({
      type: input.type,
      to: recipient,
      status: error ? "failed" : "sent",
      providerMessageId: data?.id ?? null,
      errorMessage: error?.message ?? null,
      inviteId: input.inviteId,
      submissionId: input.submissionId,
      profileId: input.profileId,
    });
  }

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export function vendorInviteEmailHtml(input: {
  name: string;
  marketName: string;
  token: string;
  expiresAt: Date;
}) {
  const link = `${getAppUrl()}/admin/onboard/${input.token}`;
  const expires = input.expiresAt.toUTCString();

  return `
    <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#1F1F1F;">
      <h1 style="color:#3B0F14;font-size:28px;">Welcome to Ethnique</h1>
      <p>Hi ${escapeHtml(input.name)},</p>
      <p>
        You have been invited to join Ethnique as a Seller for the
        <strong>${escapeHtml(input.marketName)}</strong> market.
      </p>
      <p>Please complete your onboarding form using the secure link below. This link expires on <strong>${expires}</strong> (7 calendar days).</p>
      <p style="margin:28px 0;">
        <a href="${link}" style="background:#3B0F14;color:#F7F3EB;padding:14px 22px;text-decoration:none;border-radius:8px;display:inline-block;">
          Complete Seller Onboarding
        </a>
      </p>
      <p style="font-size:13px;color:#6B5D4E;">If the button does not work, copy and paste this URL into your browser:<br>${link}</p>
      <p style="color:#A79C89;font-size:12px;">— Ethnique Admin</p>
    </div>
  `;
}

export function vendorSubmittedSellerEmailHtml(input: { name: string }) {
  return `
    <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#1F1F1F;">
      <h1 style="color:#3B0F14;font-size:24px;">Onboarding submitted</h1>
      <p>Hi ${escapeHtml(input.name)},</p>
      <p>Thank you — we have received your seller onboarding form. Our team will review your details and notify you once your account is approved.</p>
      <p style="color:#A79C89;font-size:12px;">— Ethnique Admin</p>
    </div>
  `;
}

export function vendorSubmittedAdminEmailHtml(input: {
  name: string;
  email: string;
  marketName: string;
}) {
  const approvalsLink = `${getAppUrl()}/admin/vendors/approvals`;
  return `
    <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#1F1F1F;">
      <h1 style="color:#3B0F14;font-size:24px;">Seller onboarding awaiting approval</h1>
      <p><strong>${escapeHtml(input.name)}</strong> (${escapeHtml(input.email)}) has submitted onboarding for <strong>${escapeHtml(input.marketName)}</strong>.</p>
      <p style="margin:28px 0;">
        <a href="${approvalsLink}" style="background:#3B0F14;color:#F7F3EB;padding:14px 22px;text-decoration:none;border-radius:8px;display:inline-block;">
          Review in Vendor Approvals
        </a>
      </p>
    </div>
  `;
}

export function vendorApprovedEmailHtml(input: {
  name: string;
  marketName: string;
  setPasswordLink?: string | null;
}) {
  const loginLink = `${getAppUrl()}/admin/login`;
  const actionLink = input.setPasswordLink || loginLink;
  const actionLabel = input.setPasswordLink
    ? "Set your password & continue"
    : "Sign in to Admin Portal";

  return `
    <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#1F1F1F;">
      <h1 style="color:#3B0F14;font-size:24px;">Welcome to Ethnique</h1>
      <p>Hi ${escapeHtml(input.name)},</p>
      <p>Your seller account for the <strong>${escapeHtml(input.marketName)}</strong> market has been approved.</p>
      <p>Set your password using the button below, then sign in. You will be asked to set up authenticator MFA on first login.</p>
      <p style="margin:28px 0;">
        <a href="${actionLink}" style="background:#3B0F14;color:#F7F3EB;padding:14px 22px;text-decoration:none;border-radius:8px;display:inline-block;">
          ${actionLabel}
        </a>
      </p>
      <p style="font-size:13px;color:#6B5D4E;">After setting your password, sign in at ${loginLink}</p>
    </div>
  `;
}

export function vendorRejectedEmailHtml(input: { name: string; reason: string }) {
  return `
    <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#1F1F1F;">
      <h1 style="color:#3B0F14;font-size:24px;">Onboarding update</h1>
      <p>Hi ${escapeHtml(input.name)},</p>
      <p>Unfortunately we could not approve your seller onboarding at this time.</p>
      <p><strong>Reason:</strong> ${escapeHtml(input.reason)}</p>
      <p>If you have questions, reply to this email or contact hello@ethnique.co.uk.</p>
    </div>
  `;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
