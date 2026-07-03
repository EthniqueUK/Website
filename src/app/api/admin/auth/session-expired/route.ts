import { NextResponse } from "next/server";

import { getAdminLoginPath, normalizeAdminNextPath } from "@/lib/auth/admin";
import { ADMIN_SESSION_COOKIE_NAME } from "@/lib/auth/admin-session";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const nextPath = normalizeAdminNextPath(searchParams.get("next"));

  const supabase = await createClient();
  await supabase.auth.signOut();

  const loginUrl = new URL(getAdminLoginPath(nextPath, "session_expired"), request.url);
  const response = NextResponse.redirect(loginUrl);

  response.cookies.set(ADMIN_SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  return response;
}
