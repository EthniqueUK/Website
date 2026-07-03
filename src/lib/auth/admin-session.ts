/** Absolute admin session lifetime — 7 days. */
export const ADMIN_SESSION_MAX_AGE_DAYS = 7;

export const ADMIN_SESSION_MAX_AGE_MS = ADMIN_SESSION_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

export const ADMIN_SESSION_MAX_AGE_SECONDS = ADMIN_SESSION_MAX_AGE_DAYS * 24 * 60 * 60;

export const ADMIN_SESSION_COOKIE_NAME = "ethnique_admin_session_at";

/** TOTP factor label stored in Supabase (internal uniqueness). */
export const MFA_TOTP_FRIENDLY_NAME = "Ethnique Admin";

/** Service name shown in authenticator apps (Microsoft Authenticator, etc.). */
export const MFA_TOTP_ISSUER = "Ethnique";

export function isAdminSessionExpired(sessionStartedAtMs: number) {
  return Date.now() - sessionStartedAtMs >= ADMIN_SESSION_MAX_AGE_MS;
}
