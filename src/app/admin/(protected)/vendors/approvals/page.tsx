import { requireSuperAdmin } from "@/lib/auth/admin";
import { genderLabel } from "@/lib/vendors/constants";
import { createAdminClient } from "@/lib/supabase/admin";

import { ApprovalActions } from "./_components/approval-actions";

type SubmissionRow = {
  id: string;
  legal_name: string;
  display_name: string | null;
  phone: string;
  gender: string | null;
  address_line1: string;
  city: string;
  postal_code: string;
  country_code: string;
  status: string;
  submitted_at: string;
  identity_proof_deferred: boolean;
  address_proof_deferred: boolean;
  signature_data_url: string | null;
  invite:
    | {
        email: string;
        markets: { name: string; code: string } | { name: string; code: string }[] | null;
      }
    | {
        email: string;
        markets: { name: string; code: string } | { name: string; code: string }[] | null;
      }[];
  documents:
    | {
        id: string;
        document_type: string;
        proof_category: string | null;
        storage_path: string;
        original_filename: string | null;
      }[]
    | null;
};

function marketName(
  markets: { name: string; code: string } | { name: string; code: string }[] | null,
) {
  const market = Array.isArray(markets) ? markets[0] : markets;
  return market ? market.name : "—";
}

export default async function VendorApprovalsPage() {
  await requireSuperAdmin("/admin/vendors/approvals");
  const admin = createAdminClient();

  const { data: submissions } = await admin
    .from("vendor_onboarding_submissions")
    .select(
      `
      id,
      legal_name,
      display_name,
      phone,
      gender,
      address_line1,
      city,
      postal_code,
      country_code,
      status,
      submitted_at,
      identity_proof_deferred,
      address_proof_deferred,
      signature_data_url,
      invite:vendor_onboarding_invites!inner(email, markets:market_id(name, code)),
      documents:vendor_identity_documents(id, document_type, proof_category, storage_path, original_filename)
    `,
    )
    .eq("status", "submitted")
    .order("submitted_at", { ascending: false });

  const rows = (submissions as SubmissionRow[] | null) ?? [];

  const signedUrls = new Map<string, string>();
  for (const row of rows) {
    for (const doc of row.documents ?? []) {
      const { data } = await admin.storage
        .from("vendor-identity-documents")
        .createSignedUrl(doc.storage_path, 60 * 30);
      if (data?.signedUrl) {
        signedUrls.set(doc.id, data.signedUrl);
      }
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[#A79C89]/40 bg-white p-6 shadow-sm">
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-semibold text-[#3B0F14]">
          Vendor Approvals
        </h1>
        <p className="mt-2 text-sm text-[#A79C89]">
          Review seller onboarding submissions and approve market access.
        </p>
      </section>

      {rows.length === 0 ? (
        <section className="rounded-2xl border border-[#A79C89]/40 bg-white p-8 text-center text-sm text-[#A79C89] shadow-sm">
          No pending seller submissions.
        </section>
      ) : (
        <div className="space-y-4">
          {rows.map((row) => {
            const invite = Array.isArray(row.invite) ? row.invite[0] : row.invite;

            return (
              <article
                key={row.id}
                className="rounded-2xl border border-[#A79C89]/40 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="font-[family-name:var(--font-playfair)] text-xl text-[#3B0F14]">
                      {row.display_name ?? row.legal_name}
                    </h2>
                    <p className="mt-1 text-sm text-[#A79C89]">
                      {invite.email} · {marketName(invite.markets)} · {genderLabel(row.gender)}
                    </p>
                    <p className="mt-1 text-xs text-[#A79C89]">
                      Submitted {new Date(row.submitted_at).toLocaleString()}
                    </p>
                  </div>
                  <ApprovalActions submissionId={row.id} />
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-[#A79C89]/25 bg-[#F7F3EB]/50 p-4 text-sm">
                    <p className="font-medium text-[#3B0F14]">Contact & address</p>
                    <p className="mt-2 text-[#1F1F1F]">{row.phone}</p>
                    <p className="text-[#1F1F1F]">
                      {row.address_line1}, {row.city}, {row.postal_code}, {row.country_code}
                    </p>
                  </div>

                  <div className="rounded-xl border border-[#A79C89]/25 bg-[#F7F3EB]/50 p-4 text-sm">
                    <p className="font-medium text-[#3B0F14]">Documents</p>
                    <ul className="mt-2 space-y-1 text-[#1F1F1F]">
                      {(row.documents ?? []).map((doc) => (
                        <li key={doc.id}>
                          <a
                            href={signedUrls.get(doc.id)}
                            target="_blank"
                            rel="noreferrer"
                            className="underline"
                          >
                            {(doc.proof_category ?? "document").toUpperCase()} ·{" "}
                            {doc.document_type.replaceAll("_", " ")}
                          </a>
                        </li>
                      ))}
                      {row.identity_proof_deferred ? (
                        <li className="text-amber-700">Identity proof deferred</li>
                      ) : null}
                      {row.address_proof_deferred ? (
                        <li className="text-amber-700">Address proof deferred</li>
                      ) : null}
                      {!row.documents?.length
                      && !row.identity_proof_deferred
                      && !row.address_proof_deferred ? (
                        <li className="text-[#A79C89]">No documents uploaded</li>
                      ) : null}
                    </ul>
                  </div>
                </div>

                {row.signature_data_url ? (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-[#3B0F14]">Signature</p>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={row.signature_data_url}
                      alt="Seller signature"
                      className="mt-2 h-24 max-w-xs rounded-xl border border-[#A79C89]/30 bg-white object-contain"
                    />
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
