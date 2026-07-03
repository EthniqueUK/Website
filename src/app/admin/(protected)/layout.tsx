import { requireFreshAdminSession, requireMfa, requireStaff } from "@/lib/auth/admin";

import { AdminHeader } from "./_components/admin-header";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const staff = await requireStaff();
  await requireMfa();
  await requireFreshAdminSession();

  return (
    <main className="min-h-screen bg-[#F7F3EB] px-3 py-4 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl space-y-5 sm:space-y-7">
        <AdminHeader staff={staff} />
        {children}
      </div>
    </main>
  );
}
