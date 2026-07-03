type AdminDashboardContentProps = {
  roleLabel: string;
  marketCode: string | null;
  email: string;
};

export function AdminDashboardContent({
  roleLabel,
  marketCode,
  email,
}: AdminDashboardContentProps) {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[#A79C89]/40 bg-white p-6 shadow-sm">
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-semibold text-[#3B0F14]">
          Welcome to the Ethnique Admin Portal
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#A79C89]">
          Authentication, MFA, and route protection are active. Signed in as{" "}
          <span className="font-medium text-[#1F1F1F]">{email}</span> ({roleLabel}
          {marketCode ? ` · ${marketCode.toUpperCase()} market` : " · all markets"}).
        </p>
      </section>

      <section className="rounded-2xl border border-[#A79C89]/40 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#C8A86A]">
          Phase 3 complete
        </h3>
        <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-[#A79C89]">
          <li>Supabase Auth login at /admin/login</li>
          <li>TOTP MFA for Super Admin and Vendor roles</li>
          <li>Protected admin routes with session expiry (7 days)</li>
        </ul>
        <p className="mt-4 text-sm text-[#A79C89]">
          User management, vendor onboarding, and product admin will be added in upcoming phases.
        </p>
      </section>
    </div>
  );
}
