import { AdminDashboardContent } from "./_components/admin-dashboard-content";
import { getStaffAuthState } from "@/lib/auth/admin";
import { roleLabel } from "@/lib/auth/permissions";

export default async function AdminDashboardPage() {
  const staff = await getStaffAuthState();

  return (
    <AdminDashboardContent
      roleLabel={staff ? roleLabel(staff.role) : "Staff"}
      marketCode={staff?.marketCode ?? null}
      email={staff?.email ?? ""}
    />
  );
}
