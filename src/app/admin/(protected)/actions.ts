"use server";

import { redirect } from "next/navigation";

import { logAdminAction } from "@/lib/audit/log-admin-action";
import { clearAdminSessionCookie, getStaffAuthState } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

export async function signOutAdmin() {
  const staff = await getStaffAuthState();
  const supabase = await createClient();

  if (staff) {
    await logAdminAction({
      actor: staff,
      action: "auth.logout",
      entityType: "auth",
      summary: `${staff.email} signed out`,
    });
  }

  await clearAdminSessionCookie();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
