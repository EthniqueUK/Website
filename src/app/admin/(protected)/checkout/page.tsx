import { requireSuperAdmin } from "@/lib/auth/admin";

import { ComingSoon } from "../_components/coming-soon";

export default async function AdminCheckoutPage() {
  await requireSuperAdmin("/admin/checkout");
  return (
    <ComingSoon
      title="Checkout"
      description="Configure checkout and payment settings."
      icon="card"
      phase="Coming soon"
    />
  );
}
