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
