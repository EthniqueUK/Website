export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) {
    throw new Error("Missing environment variable: NEXT_PUBLIC_SUPABASE_URL");
  }

  if (!publishableKey) {
    throw new Error(
      "Missing environment variable: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY "
      + "(Settings → API Keys → Publishable key, format sb_publishable_...)",
    );
  }

  return {
    NEXT_PUBLIC_SUPABASE_URL: url,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: publishableKey,
  };
}

export function getSupabaseServiceEnv() {
  const secretKey =
    process.env.SUPABASE_SECRET_KEY
    ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!secretKey) {
    throw new Error(
      "Missing environment variable: SUPABASE_SECRET_KEY "
      + "(Settings → API Keys → Secret key, format sb_secret_...)",
    );
  }

  return {
    ...getSupabaseEnv(),
    SUPABASE_SECRET_KEY: secretKey,
  };
}

export function getAppUrl() {
  const url = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3005";
  return url.replace(/\/$/, "");
}

export function getResendEnv() {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? process.env.ADMIN_FROM_EMAIL;
  const notifyEmail =
    process.env.ADMIN_NOTIFICATION_EMAIL ?? process.env.RESEND_FROM_EMAIL ?? fromEmail;

  if (!apiKey) {
    throw new Error("Missing environment variable: RESEND_API_KEY");
  }

  if (!fromEmail) {
    throw new Error(
      "Missing environment variable: RESEND_FROM_EMAIL (or ADMIN_FROM_EMAIL)",
    );
  }

  return {
    RESEND_API_KEY: apiKey,
    RESEND_FROM_EMAIL: fromEmail,
    ADMIN_NOTIFICATION_EMAIL: notifyEmail ?? fromEmail,
  };
}
