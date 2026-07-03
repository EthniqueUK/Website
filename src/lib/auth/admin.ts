import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import {
  ADMIN_SESSION_COOKIE_NAME,
  isAdminSessionExpired,
} from "@/lib/auth/admin-session";
import { isStaffRole, requiresMandatoryMfa } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";

export type StaffRole = "super_admin" | "vendor" | "manager";
export type AppRole = StaffRole | "customer";

export type StaffAuthState = {
  userId: string;
  email: string;
  role: StaffRole;
  marketId: string | null;
  marketCode: string | null;
  vendorId: string | null;
  displayName: string | null;
  status: string;
};

type AuthState = {
  role: AppRole | null;
  userId: string | null;
};

export function normalizeAdminNextPath(value?: string | null) {
  if (!value || !value.startsWith("/admin")) {
    return "/admin";
  }

  if (
    value.startsWith("/admin/login")
    || value.startsWith("/admin/mfa")
    || value.startsWith("/admin/onboard")
  ) {
    return "/admin";
  }

  return value;
}

export function getAdminLoginPath(
  nextPath = "/admin",
  reason?: "auth" | "forbidden" | "mfa" | "session_expired" | "inactive",
) {
  const params = new URLSearchParams();
  const normalizedNextPath = normalizeAdminNextPath(nextPath);

  if (normalizedNextPath !== "/admin") {
    params.set("next", normalizedNextPath);
  }

  if (reason) {
    params.set("reason", reason);
  }

  const query = params.toString();

  return query ? `/admin/login?${query}` : "/admin/login";
}

export function getMfaEnrollPath(nextPath = "/admin") {
  const params = new URLSearchParams();
  const normalizedNextPath = normalizeAdminNextPath(nextPath);

  if (normalizedNextPath !== "/admin") {
    params.set("next", normalizedNextPath);
  }

  const query = params.toString();
  return query ? `/admin/mfa/enroll?${query}` : "/admin/mfa/enroll";
}

export function getMfaVerifyPath(nextPath = "/admin") {
  const params = new URLSearchParams();
  const normalizedNextPath = normalizeAdminNextPath(nextPath);

  if (normalizedNextPath !== "/admin") {
    params.set("next", normalizedNextPath);
  }

  const query = params.toString();
  return query ? `/admin/mfa/verify?${query}` : "/admin/mfa/verify";
}

async function fetchProfile(userId: string) {
  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role, email, market_id, vendor_id, display_name, status, markets:market_id (code)")
    .eq("id", userId)
    .maybeSingle<{
      role: AppRole;
      email: string | null;
      market_id: string | null;
      vendor_id: string | null;
      display_name: string | null;
      status: string;
      markets: { code: string } | null;
    }>();

  if (error) {
    throw new Error("Unable to verify admin access.");
  }

  return profile;
}

export async function getAdminAuthState(): Promise<AuthState> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { role: null, userId: null };
  }

  const profile = await fetchProfile(user.id);

  return {
    role: profile?.role ?? null,
    userId: user.id,
  };
}

export async function getStaffAuthState(): Promise<StaffAuthState | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const profile = await fetchProfile(user.id);

  if (!profile || !isStaffRole(profile.role)) {
    return null;
  }

  if (profile.status !== "active") {
    return null;
  }

  return {
    userId: user.id,
    email: profile.email ?? user.email ?? "",
    role: profile.role,
    marketId: profile.market_id,
    marketCode: profile.markets?.code ?? null,
    vendorId: profile.vendor_id,
    displayName: profile.display_name,
    status: profile.status,
  };
}

export async function assertMfaVerified() {
  const staff = await getStaffAuthState();

  if (!staff) {
    throw new Error("Authentication required.");
  }

  if (!requiresMandatoryMfa(staff.role)) {
    return staff;
  }

  const supabase = await createClient();
  const { data: aal, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

  if (error) {
    throw new Error("Unable to verify MFA status.");
  }

  if (aal.currentLevel !== "aal2") {
    throw new Error("MFA verification required.");
  }

  return staff;
}

export async function assertVendorOrAbove() {
  const staff = await assertMfaVerified();

  if (staff.role === "manager") {
    throw new Error("Forbidden");
  }

  return staff;
}

export async function assertSuperAdmin() {
  const staff = await assertMfaVerified();

  if (staff.role !== "super_admin") {
    throw new Error("Forbidden");
  }

  return staff;
}

export async function requireStaff(nextPath = "/admin"): Promise<StaffAuthState> {
  const staff = await getStaffAuthState();

  if (!staff) {
    redirect(getAdminLoginPath(nextPath, "auth"));
  }

  return staff;
}

export async function requireRole(roles: StaffRole[], nextPath = "/admin"): Promise<StaffAuthState> {
  const staff = await requireStaff(nextPath);

  if (!roles.includes(staff.role)) {
    redirect(getAdminLoginPath(nextPath, "forbidden"));
  }

  return staff;
}

export async function requireSuperAdmin(nextPath = "/admin"): Promise<StaffAuthState> {
  return requireRole(["super_admin"], nextPath);
}

export async function requireVendorOrAbove(nextPath = "/admin"): Promise<StaffAuthState> {
  return requireRole(["super_admin", "vendor"], nextPath);
}

export async function requireProductAccess(nextPath = "/admin"): Promise<StaffAuthState> {
  return requireRole(["super_admin", "vendor", "manager"], nextPath);
}

export async function requireMfa(nextPath = "/admin") {
  const staff = await requireStaff(nextPath);

  if (!requiresMandatoryMfa(staff.role)) {
    return staff;
  }

  const supabase = await createClient();
  const [{ data: factors, error: factorsError }, { data: aal, error: aalError }] = await Promise.all([
    supabase.auth.mfa.listFactors(),
    supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
  ]);

  if (factorsError || aalError) {
    throw new Error("Unable to verify MFA status.");
  }

  const verifiedTotp = (factors?.totp ?? []).some((factor) => factor.status === "verified");

  if (!verifiedTotp) {
    redirect(getMfaEnrollPath(nextPath));
  }

  if (aal.currentLevel === "aal1" && aal.nextLevel === "aal2") {
    redirect(getMfaVerifyPath(nextPath));
  }

  return staff;
}

export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE_NAME);
}

export async function requireFreshAdminSession(nextPath = "/admin") {
  const cookieStore = await cookies();
  const raw = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;

  const expiredParams = new URLSearchParams();
  const normalizedNext = normalizeAdminNextPath(nextPath);
  if (normalizedNext !== "/admin") {
    expiredParams.set("next", normalizedNext);
  }

  const expiredQuery = expiredParams.toString();
  const expiredPath = expiredQuery
    ? `/api/admin/auth/session-expired?${expiredQuery}`
    : "/api/admin/auth/session-expired";

  if (!raw) {
    redirect(expiredPath);
  }

  const startedAt = Number.parseInt(raw, 10);

  if (!Number.isFinite(startedAt) || isAdminSessionExpired(startedAt)) {
    redirect(expiredPath);
  }
}

export function filterMarketsForStaff<T extends { id: string; code: string }>(
  markets: T[],
  staff: StaffAuthState,
): T[] {
  if (staff.role === "super_admin") {
    return markets;
  }

  if (!staff.marketId) {
    return [];
  }

  return markets.filter((market) => market.id === staff.marketId);
}
