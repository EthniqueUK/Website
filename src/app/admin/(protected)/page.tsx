import { AdminDashboardContent } from "./_components/admin-dashboard-content";
import { getStaffAuthState } from "@/lib/auth/admin";
import { getAdminGroupsForStaff, roleLabel } from "@/lib/auth/permissions";

export default async function AdminDashboardPage() {
  const staff = await getStaffAuthState();

  const groups = staff ? getAdminGroupsForStaff(staff) : [];

  return (
    <AdminDashboardContent
      roleLabel={staff ? roleLabel(staff.role) : "Staff"}
      marketCode={staff?.marketCode ?? null}
      displayName={staff?.displayName ?? null}
      email={staff?.email ?? ""}
      groups={groups}
    />
  );
}
