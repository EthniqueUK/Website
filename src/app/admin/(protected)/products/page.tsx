import { requireProductAccess } from "@/lib/auth/admin";

import { ComingSoon } from "../_components/coming-soon";

export default async function AdminProductsPage() {
  await requireProductAccess("/admin/products");
  return (
    <ComingSoon
      title="Product Management"
      description="Create, edit and publish products for your market."
      icon="box"
      phase="Phase 10"
    />
  );
}
