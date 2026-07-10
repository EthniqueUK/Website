import { CreateManagerForm } from "@/components/admin/create-manager-form";
import { InviteSellerForm } from "@/components/admin/invite-seller-form";
import { StaffUserActions } from "@/components/admin/staff-user-actions";
import { requireVendorOrAbove, type StaffAuthState, type StaffRole } from "@/lib/auth/admin";
import {
  canDeleteUser,
  canEditUser,
  roleLabel,
} from "@/lib/auth/permissions";
import { genderLabel } from "@/lib/vendors/constants";
import { createAdminClient } from "@/lib/supabase/admin";

type StaffRow = {
  id: string;
  email: string;
  role: StaffRole;
  status: string;
  display_name: string | null;
  gender: string | null;
  phone: string | null;
  market_id: string | null;
  vendor_id: string | null;
  markets: { name: string; code: string } | { name: string; code: string }[] | null;
};

type InviteRow = {
  id: string;
  email: string;
  display_name: string | null;
  status: string;
  expires_at: string;
  created_at: string;
  markets: { name: string; code: string } | { name: string; code: string }[] | null;
  submission:
    | { status: string }
    | { status: string }[]
    | null;
};

function marketLabel(
  markets: { name: string; code: string } | { name: string; code: string }[] | null,
) {
  const market = Array.isArray(markets) ? markets[0] : markets;
  return market ? `${market.name} (${market.code.toUpperCase()})` : "—";
}

function staffStatusBadge(status: string) {
  const styles: Record<string, string> = {
    active: "bg-emerald-50 text-emerald-800 border-emerald-200",
    invited: "bg-amber-50 text-amber-800 border-amber-200",
    pending: "bg-amber-50 text-amber-800 border-amber-200",
    pending_approval: "bg-sky-50 text-sky-800 border-sky-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
    expired: "bg-stone-100 text-stone-600 border-stone-200",
    revoked: "bg-stone-100 text-stone-600 border-stone-200",
    deactivated: "bg-stone-100 text-stone-600 border-stone-200",
    suspended: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${
        styles[status] ?? "bg-[#F7F3EB] text-[#3B0F14] border-[#A79C89]/40"
      }`}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}

/** Vendor invite lifecycle: Pending | Expired | Approved | Rejected. */
function vendorInviteStatusBadge(invite: InviteRow) {
  const submission = Array.isArray(invite.submission)
    ? invite.submission[0]
    : invite.submission;

  let label: "Pending" | "Expired" | "Approved" | "Rejected" = "Pending";
  let tone = "bg-amber-50 text-amber-800 border-amber-200";

  if (submission?.status === "approved") {
    label = "Approved";
    tone = "bg-emerald-50 text-emerald-800 border-emerald-200";
  } else if (submission?.status === "rejected") {
    label = "Rejected";
    tone = "bg-red-50 text-red-700 border-red-200";
  } else if (
    invite.status === "expired"
    || (invite.status === "pending" && new Date(invite.expires_at).getTime() < Date.now())
  ) {
    label = "Expired";
    tone = "bg-stone-100 text-stone-600 border-stone-200";
  }

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${tone}`}
    >
      {label}
    </span>
  );
}

function filterVisibleStaff(staff: StaffAuthState, users: StaffRow[]) {
  if (staff.role === "super_admin") {
    return users;
  }

  return users.filter(
    (user) =>
      user.role === "manager"
      && user.market_id === staff.marketId
      && user.vendor_id === staff.userId,
  );
}

export default async function AdminUsersPage() {
  const staff = await requireVendorOrAbove("/admin/users");
  const admin = createAdminClient();

  const [{ data: markets }, { data: staffUsers }, { data: invites }] = await Promise.all([
    admin
      .from("markets")
      .select("id, name, code, is_default, is_active")
      .order("sort_order", { ascending: true }),
    admin
      .from("profiles")
      .select(
        "id, email, role, status, display_name, gender, phone, market_id, vendor_id, markets:market_id(name, code)",
      )
      .in("role", ["super_admin", "vendor", "manager"])
      .order("created_at", { ascending: false }),
    staff.role === "super_admin"
      ? admin
          .from("vendor_onboarding_invites")
          .select(
            "id, email, display_name, status, expires_at, created_at, markets:market_id(name, code), submission:vendor_onboarding_submissions(status)",
          )
          .order("created_at", { ascending: false })
          .limit(25)
      : Promise.resolve({ data: [] as InviteRow[] }),
  ]);

  const marketRows = markets ?? [];
  const defaultMarketId =
    marketRows.find((market) => market.is_default)?.id
    ?? marketRows.find((market) => market.code === "uk")?.id
    ?? marketRows[0]?.id
    ?? null;

  const allStaff = (staffUsers as StaffRow[] | null) ?? [];
  const visibleStaff = filterVisibleStaff(staff, allStaff);

  const pageDescription =
    staff.role === "super_admin"
      ? "Manage all staff accounts, invite sellers, activate or deactivate users, and reset passwords."
      : "Create and manage manager accounts for your market, and update your own password.";

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[#A79C89]/40 bg-white p-6 shadow-sm">
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-semibold text-[#3B0F14]">
          User Management
        </h1>
        <p className="mt-2 text-sm text-[#A79C89]">{pageDescription}</p>
      </section>

      {staff.role === "super_admin" ? (
        <InviteSellerForm markets={marketRows} defaultMarketId={defaultMarketId} />
      ) : (
        <CreateManagerForm />
      )}

      <section className="rounded-2xl border border-[#A79C89]/40 bg-white p-6 shadow-sm overflow-x-auto">
        <h2 className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-[#3B0F14]">
          {staff.role === "super_admin" ? "All staff users" : "Your managers"}
        </h2>
        <table className="mt-4 w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-[#A79C89]/30 text-xs uppercase tracking-wide text-[#A79C89]">
            <tr>
              <th className="py-2 pr-3 font-medium">Name</th>
              <th className="py-2 pr-3 font-medium">Email</th>
              <th className="py-2 pr-3 font-medium">Role</th>
              <th className="py-2 pr-3 font-medium">Market</th>
              <th className="py-2 pr-3 font-medium">Status</th>
              <th className="py-2 pr-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleStaff.map((user) => {
              const isSelf = user.id === staff.userId;
              const canManage =
                isSelf
                || canEditUser(
                  staff.role,
                  staff.marketId,
                  staff.userId,
                  user.role,
                  user.market_id,
                  user.vendor_id,
                );
              const canDelete =
                !isSelf
                && canDeleteUser(
                  staff.role,
                  staff.marketId,
                  staff.userId,
                  user.role,
                  user.market_id,
                  user.vendor_id,
                );

              return (
                <tr key={user.id} className="border-b border-[#A79C89]/15 align-top">
                  <td className="py-3 pr-3 text-[#3B0F14]">
                    {user.display_name ?? "—"}
                    {user.phone ? (
                      <span className="block text-xs text-[#A79C89]">{user.phone}</span>
                    ) : null}
                    {staff.role === "super_admin" && user.gender ? (
                      <span className="block text-xs text-[#A79C89]">{genderLabel(user.gender)}</span>
                    ) : null}
                  </td>
                  <td className="py-3 pr-3 text-[#1F1F1F]">{user.email}</td>
                  <td className="py-3 pr-3 text-[#1F1F1F]">{roleLabel(user.role)}</td>
                  <td className="py-3 pr-3 text-[#1F1F1F]">{marketLabel(user.markets)}</td>
                  <td className="py-3 pr-3">{staffStatusBadge(user.status)}</td>
                  <td className="py-3 pr-3 min-w-[220px]">
                    <StaffUserActions
                      userId={user.id}
                      userEmail={user.email}
                      userName={user.display_name ?? user.email}
                      userRole={user.role}
                      userStatus={user.status}
                      canManage={canManage}
                      canDelete={canDelete}
                      isSelf={isSelf}
                    />
                  </td>
                </tr>
              );
            })}

            {staff.role === "vendor" ? (
              <tr className="border-b border-[#A79C89]/15 align-top">
                <td className="py-3 pr-3 text-[#3B0F14]">
                  {staff.displayName ?? "—"}
                  <span className="block text-xs text-[#A79C89]">Your account</span>
                </td>
                <td className="py-3 pr-3 text-[#1F1F1F]">{staff.email}</td>
                <td className="py-3 pr-3 text-[#1F1F1F]">Vendor</td>
                <td className="py-3 pr-3 text-[#1F1F1F]">
                  {marketLabel(
                    allStaff.find((user) => user.id === staff.userId)?.markets ?? null,
                  )}
                </td>
                <td className="py-3 pr-3">{staffStatusBadge(staff.status)}</td>
                <td className="py-3 pr-3 min-w-[220px]">
                  <StaffUserActions
                    userId={staff.userId}
                    userEmail={staff.email}
                    userName={staff.displayName ?? staff.email}
                    userRole="vendor"
                    userStatus={staff.status}
                    canManage={false}
                    canDelete={false}
                    isSelf
                  />
                </td>
              </tr>
            ) : null}

            {visibleStaff.length === 0 && staff.role !== "vendor" ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-[#A79C89]">
                  No staff users found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>

      {staff.role === "super_admin" ? (
        <section className="rounded-2xl border border-[#A79C89]/40 bg-white p-6 shadow-sm overflow-x-auto">
          <h2 className="font-[family-name:var(--font-playfair)] text-xl font-semibold text-[#3B0F14]">
            Recent seller invites
          </h2>
          <table className="mt-4 w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-[#A79C89]/30 text-xs uppercase tracking-wide text-[#A79C89]">
              <tr>
                <th className="py-2 pr-3 font-medium">Name</th>
                <th className="py-2 pr-3 font-medium">Email</th>
                <th className="py-2 pr-3 font-medium">Market</th>
                <th className="py-2 pr-3 font-medium">Status</th>
                <th className="py-2 pr-3 font-medium">Expires</th>
              </tr>
            </thead>
            <tbody>
              {(invites as InviteRow[] | null)?.map((invite) => (
                <tr key={invite.id} className="border-b border-[#A79C89]/15">
                  <td className="py-3 pr-3 text-[#3B0F14]">{invite.display_name ?? "—"}</td>
                  <td className="py-3 pr-3 text-[#1F1F1F]">{invite.email}</td>
                  <td className="py-3 pr-3 text-[#1F1F1F]">{marketLabel(invite.markets)}</td>
                  <td className="py-3 pr-3">{vendorInviteStatusBadge(invite)}</td>
                  <td className="py-3 pr-3 text-[#A79C89]">
                    {new Date(invite.expires_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {!invites?.length ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-[#A79C89]">
                    No seller invites yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </section>
      ) : null}
    </div>
  );
}
