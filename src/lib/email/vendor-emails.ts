import { Resend } from "resend";

import {
  brandEthnique,
  buildEthniqueEmailHtml,
  emailButton,
  emailInfoBox,
  emailMutedNote,
  escapeHtml,
} from "@/lib/email/email-layout";
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

  return buildEthniqueEmailHtml({
    title: "Welcome to Ethnique",
    preheader: `Complete your seller onboarding for ${input.marketName}`,
    bodyHtml: `
      <p style="margin:0 0 16px;">Hi ${escapeHtml(input.name)},</p>
      <p style="margin:0 0 16px;">
        You have been invited to join ${brandEthnique()} as a Seller for the
        <strong>${escapeHtml(input.marketName)}</strong> market.
      </p>
      <p style="margin:0 0 16px;">
        Please complete your onboarding form using the secure link below. This link expires on
        <strong>${escapeHtml(expires)}</strong> (7 calendar days).
      </p>
      ${emailButton(link, "Complete Seller Onboarding")}
      ${emailMutedNote(
        `If the button does not work, copy and paste this URL into your browser:<br /><a href="${link}" style="color:#3B0F14;word-break:break-all;">${escapeHtml(link)}</a>`,
      )}
    `,
  });
}

export function vendorSubmittedSellerEmailHtml(input: { name: string }) {
  return buildEthniqueEmailHtml({
    title: "Onboarding received",
    preheader: "We have received your seller onboarding form",
    bodyHtml: `
      <p style="margin:0 0 16px;">Hi ${escapeHtml(input.name)},</p>
      <p style="margin:0 0 16px;">
        Thank you — we have received your seller onboarding form. Our team will review your
        details and notify you once your account is approved.
      </p>
      ${emailInfoBox(
        "You do not need to take any further action right now. We will email you when your application has been reviewed.",
      )}
    `,
  });
}

export function vendorSubmittedAdminEmailHtml(input: {
  name: string;
  email: string;
  marketName: string;
}) {
  const approvalsLink = `${getAppUrl()}/admin/vendors/approvals`;

  return buildEthniqueEmailHtml({
    title: "Seller awaiting approval",
    preheader: `${input.name} submitted seller onboarding`,
    signOff: "Ethnique Admin Portal",
    bodyHtml: `
      <p style="margin:0 0 16px;">A new seller onboarding submission requires your review.</p>
      ${emailInfoBox(`
        <strong style="color:#3B0F14;">${escapeHtml(input.name)}</strong><br />
        ${escapeHtml(input.email)}<br />
        Market: <strong>${escapeHtml(input.marketName)}</strong>
      `)}
      ${emailButton(approvalsLink, "Review in Vendor Requests")}
    `,
  });
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

  return buildEthniqueEmailHtml({
    title: "Your account is approved",
    preheader: `Your Ethnique seller account for ${input.marketName} is ready`,
    bodyHtml: `
      <p style="margin:0 0 16px;">Hi ${escapeHtml(input.name)},</p>
      <p style="margin:0 0 16px;">
        Your seller account for the <strong>${escapeHtml(input.marketName)}</strong> market has been
        approved.
      </p>
      <p style="margin:0 0 16px;">
        Set your password using the button below, then sign in. You will be asked to set up
        authenticator MFA on first login.
      </p>
      ${emailButton(actionLink, actionLabel)}
      ${emailMutedNote(
        `After setting your password, sign in at <a href="${loginLink}" style="color:#3B0F14;">${escapeHtml(loginLink)}</a>`,
      )}
    `,
  });
}

export function vendorRejectedEmailHtml(input: { name: string; reason: string }) {
  return buildEthniqueEmailHtml({
    title: "Onboarding update",
    preheader: "An update on your Ethnique seller application",
    bodyHtml: `
      <p style="margin:0 0 16px;">Hi ${escapeHtml(input.name)},</p>
      <p style="margin:0 0 16px;">
        Unfortunately we could not approve your seller onboarding at this time.
      </p>
      ${emailInfoBox(`<strong>Reason:</strong> ${escapeHtml(input.reason)}`)}
      <p style="margin:16px 0 0;">
        If you have questions, reply to this email or contact
        <a href="mailto:hello@ethnique.co.uk" style="color:#3B0F14;">hello@ethnique.co.uk</a>.
      </p>
    `,
  });
}
