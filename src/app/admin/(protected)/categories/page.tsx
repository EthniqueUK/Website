import { requireVendorOrAbove } from "@/lib/auth/admin";

import { ComingSoon } from "../_components/coming-soon";

export default async function AdminCategoriesPage() {
  await requireVendorOrAbove("/admin/categories");
  return (
    <ComingSoon
      title="Categories"
      description="Organise the catalogue into categories for each market."
      icon="tag"
      phase="Coming soon"
    />
  );
}
