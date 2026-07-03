import { redirect } from "next/navigation";

import { MfaEnrollForm } from "@/components/admin/mfa-enroll-form";
import { getStaffAuthState, normalizeAdminNextPath, requireStaff } from "@/lib/auth/admin";
import { requiresMandatoryMfa } from "@/lib/auth/permissions";

type MfaEnrollPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function MfaEnrollPage({ searchParams }: MfaEnrollPageProps) {
  const params = await searchParams;
  const nextPath = normalizeAdminNextPath(params.next);

  await requireStaff(nextPath);

  const staff = await getStaffAuthState();
  if (!staff) {
    redirect("/admin/login");
  }

  if (!requiresMandatoryMfa(staff.role)) {
    redirect(nextPath);
  }

  return (
    <main className="min-h-screen bg-[#F7F3EB] px-6 py-16">
      <div className="mx-auto max-w-md">
        <MfaEnrollForm nextPath={nextPath} />
      </div>
    </main>
  );
}
