import { NextResponse } from "next/server";

import { submitSellerOnboardingPayload } from "@/lib/vendors/submit-onboarding";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await submitSellerOnboardingPayload(body);

    if (!result.ok) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Onboarding submit route failed:", error);
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to submit onboarding form.",
      },
      { status: 500 },
    );
  }
}
