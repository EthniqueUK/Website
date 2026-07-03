import { NextResponse } from "next/server";

import { getStaffAuthState } from "@/lib/auth/admin";
import { adminResetAllMfaFactors } from "@/lib/auth/mfa-reset.server";
import { requiresMandatoryMfa } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";

/** Clears stale MFA factors during enrollment (not allowed at AAL2). */
export async function POST() {
  try {
    const staff = await getStaffAuthState();

    if (!staff || !requiresMandatoryMfa(staff.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const supabase = await createClient();
    const { data: aal, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

    if (aalError) {
      return NextResponse.json({ error: "Unable to verify MFA status." }, { status: 500 });
    }

    if (aal.currentLevel === "aal2") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await adminResetAllMfaFactors(staff.userId);

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to clear MFA factors.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
