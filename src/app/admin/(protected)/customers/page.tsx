import { requireVendorOrAbove } from "@/lib/auth/admin";

import { ComingSoon } from "../_components/coming-soon";

export default async function AdminCustomersPage() {
  await requireVendorOrAbove("/admin/customers");
  return (
    <ComingSoon
      title="Customers"
      description="Browse customer records and order history."
      icon="users"
      phase="Coming soon"
    />
  );
}
