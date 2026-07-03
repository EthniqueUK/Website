import { NextResponse } from "next/server";

import { getStaffAuthState } from "@/lib/auth/admin";

export async function GET() {
  const staff = await getStaffAuthState();

  return NextResponse.json({
    role: staff?.role ?? null,
    status: staff?.status ?? null,
  });
}
