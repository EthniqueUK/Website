import { requireVendorOrAbove } from "@/lib/auth/admin";

import { ComingSoon } from "../_components/coming-soon";

export default async function AdminOrdersPage() {
  await requireVendorOrAbove("/admin/orders");
  return (
    <ComingSoon
      title="Orders"
      description="View, track and fulfil customer orders."
      icon="cart"
      phase="Coming soon"
    />
  );
}
