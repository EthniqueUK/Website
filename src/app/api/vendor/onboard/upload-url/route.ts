import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { hashInviteToken } from "@/lib/vendors/invite-token";

export const runtime = "nodejs";

type UploadUrlBody = {
  token?: string;
  category?: "identity" | "address";
  filename?: string;
  contentType?: string;
};

function safeExtension(filename: string) {
  const extension = filename.split(".").pop()?.toLowerCase() ?? "bin";
  if (!/^[a-z0-9]{1,8}$/.test(extension)) {
    return "bin";
  }
  return extension;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as UploadUrlBody;
    const token = body.token?.trim() ?? "";
    const category = body.category;
    const filename = body.filename?.trim() ?? "document.bin";

    if (!token) {
      return NextResponse.json({ error: "Invalid onboarding link." }, { status: 400 });
    }

    if (category !== "identity" && category !== "address") {
      return NextResponse.json({ error: "Invalid upload category." }, { status: 400 });
    }

    const admin = createAdminClient();
    const tokenHash = hashInviteToken(token);

    const { data: invite, error: inviteError } = await admin
      .from("vendor_onboarding_invites")
      .select("id, status, expires_at")
      .eq("token_hash", tokenHash)
      .maybeSingle();

    if (inviteError || !invite) {
      return NextResponse.json({ error: "This invite link is invalid." }, { status: 400 });
    }

    if (invite.status === "revoked") {
      return NextResponse.json(
        { error: "This invite has been cancelled. Please contact Ethnique if you need assistance." },
        { status: 400 },
      );
    }

    if (invite.status !== "pending") {
      return NextResponse.json(
        { error: "This invite link has already been used or revoked." },
        { status: 400 },
      );
    }

    if (new Date(invite.expires_at).getTime() < Date.now()) {
      return NextResponse.json(
        { error: "This invite link has expired. Please ask Ethnique to send a new invite." },
        { status: 400 },
      );
    }

    const extension = safeExtension(filename);
    const path = `pending/${tokenHash}/${category}-${Date.now()}.${extension}`;

    const { data, error } = await admin.storage
      .from("vendor-identity-documents")
      .createSignedUploadUrl(path);

    if (error || !data) {
      console.error("Failed to create signed upload URL:", error);
      return NextResponse.json(
        { error: error?.message ?? "Unable to prepare document upload." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      path: data.path,
      token: data.token,
      signedUrl: data.signedUrl,
      contentType: body.contentType ?? "application/octet-stream",
    });
  } catch (error) {
    console.error("Upload URL route failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to prepare document upload.",
      },
      { status: 500 },
    );
  }
}
