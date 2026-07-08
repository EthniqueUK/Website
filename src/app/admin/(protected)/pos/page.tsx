import { requireVendorOrAbove } from "@/lib/auth/admin";

import { ComingSoon } from "../_components/coming-soon";

export default async function AdminPosPage() {
  await requireVendorOrAbove("/admin/pos");
  return (
    <ComingSoon
      title="Point of Sale"
      description="Process in-person sales from the POS terminal."
      icon="calculator"
      phase="Coming soon"
    />
  );
}
