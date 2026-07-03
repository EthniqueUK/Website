import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getStaffAuthState } from "@/lib/auth/admin";
import {
  ADMIN_SESSION_COOKIE_NAME,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  isAdminSessionExpired,
} from "@/lib/auth/admin-session";
import { requiresMandatoryMfa } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";

function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
    path: "/",
  };
}

export async function POST() {
  try {
    const staff = await getStaffAuthState();

    if (!staff) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (requiresMandatoryMfa(staff.role)) {
      const supabase = await createClient();
      const { data: aal, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

      if (error || aal.currentLevel !== "aal2") {
        return NextResponse.json({ error: "MFA verification required." }, { status: 403 });
      }
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_SESSION_COOKIE_NAME, String(Date.now()), sessionCookieOptions());

    return response;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE_NAME, "", {
    ...sessionCookieOptions(),
    maxAge: 0,
  });

  return response;
}

export async function GET() {
  const cookieStore = await cookies();
  const raw = cookieStore.get(ADMIN_SESSION_COOKIE_NAME)?.value;

  if (!raw) {
    return NextResponse.json({ valid: false, reason: "missing" });
  }

  const startedAt = Number.parseInt(raw, 10);

  if (!Number.isFinite(startedAt) || isAdminSessionExpired(startedAt)) {
    return NextResponse.json({ valid: false, reason: "expired" });
  }

  return NextResponse.json({
    valid: true,
    expiresAt: startedAt + ADMIN_SESSION_MAX_AGE_SECONDS * 1000,
  });
}
