import { requireSuperAdmin } from "@/lib/auth/admin";

function ComingSoon() {
  return (
    <section className="rounded-2xl border border-[#A79C89]/40 bg-white p-6 shadow-sm">
      <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-semibold text-[#3B0F14]">
        Vendor Approvals
      </h2>
      <p className="mt-3 text-sm text-[#A79C89]">
        Review and approve vendor onboarding submissions. Coming in Phase 9.
      </p>
    </section>
  );
}

export default async function VendorApprovalsPage() {
  await requireSuperAdmin("/admin/vendors/approvals");
  return <ComingSoon />;
}
