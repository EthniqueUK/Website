import { NextResponse } from "next/server";

import { logAdminAction } from "@/lib/audit/log-admin-action";
import { assertMfaVerified, getStaffAuthState } from "@/lib/auth/admin";

export async function POST(request: Request) {
  try {
    const staff = await getStaffAuthState();

    if (!staff) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as { action?: string };

    if (body.action === "auth.login") {
      await logAdminAction({
        actor: staff,
        action: "auth.login",
        entityType: "auth",
        summary: `${staff.email} signed in`,
      });
    } else if (body.action === "auth.mfa_enroll") {
      await assertMfaVerified();
      await logAdminAction({
        actor: staff,
        action: "auth.mfa_enroll",
        entityType: "auth",
        summary: `${staff.email} enrolled TOTP MFA`,
      });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
