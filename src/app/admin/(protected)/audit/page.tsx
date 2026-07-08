import { requireVendorOrAbove } from "@/lib/auth/admin";

import { ComingSoon } from "../_components/coming-soon";

export default async function AdminAuditPage() {
  await requireVendorOrAbove("/admin/audit");
  return (
    <ComingSoon
      title="Audit Trail"
      description="Review admin activity with timestamps and filters."
      icon="clipboard"
      phase="Phase 11"
    />
  );
}
