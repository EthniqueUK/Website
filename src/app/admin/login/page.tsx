import { redirect } from "next/navigation";

import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { getStaffAuthState, normalizeAdminNextPath } from "@/lib/auth/admin";

type AdminLoginPageProps = {
  searchParams: Promise<{
    next?: string;
    reason?: string;
  }>;
};

export default async function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
  const params = await searchParams;
  const nextPath = normalizeAdminNextPath(params.next);
  const staff = await getStaffAuthState();

  if (staff) {
    redirect(nextPath);
  }

  return (
    <main className="min-h-screen bg-[#F7F3EB] px-6 py-16">
      <div className="mx-auto max-w-md">
        <AdminLoginForm nextPath={nextPath} reason={params.reason} />
      </div>
    </main>
  );
}
