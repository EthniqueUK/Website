import type { StaffRole } from "@/lib/auth/admin";

export const STAFF_ROLES: StaffRole[] = ["super_admin", "vendor", "manager"];

export function isStaffRole(role: string | null | undefined): role is StaffRole {
  return role === "super_admin" || role === "vendor" || role === "manager";
}

export function requiresMandatoryMfa(role: StaffRole): boolean {
  return role === "super_admin" || role === "vendor";
}

export function canManageUsers(role: StaffRole): boolean {
  return role === "super_admin" || role === "vendor";
}

export function canCreateRole(actorRole: StaffRole, targetRole: StaffRole): boolean {
  if (actorRole === "super_admin") {
    return targetRole === "super_admin" || targetRole === "vendor" || targetRole === "manager";
  }

  if (actorRole === "vendor") {
    return targetRole === "manager";
  }

  return false;
}

export function canEditUser(
  actorRole: StaffRole,
  actorMarketId: string | null,
  actorUserId: string,
  targetRole: StaffRole,
  targetMarketId: string | null,
  targetVendorId: string | null,
): boolean {
  if (actorRole === "super_admin") {
    return true;
  }

  if (actorRole === "vendor") {
    return (
      targetRole === "manager"
      && actorMarketId === targetMarketId
      && targetVendorId === actorUserId
    );
  }

  return false;
}

export function canDeleteUser(
  actorRole: StaffRole,
  actorMarketId: string | null,
  actorUserId: string,
  targetRole: StaffRole,
  targetMarketId: string | null,
  targetVendorId: string | null,
): boolean {
  return canEditUser(
    actorRole,
    actorMarketId,
    actorUserId,
    targetRole,
    targetMarketId,
    targetVendorId,
  );
}

export function canDeleteProducts(role: StaffRole): boolean {
  return role === "super_admin" || role === "vendor";
}

export function canActivateProducts(role: StaffRole): boolean {
  return role === "super_admin" || role === "vendor";
}

export function roleLabel(role: StaffRole): string {
  switch (role) {
    case "super_admin":
      return "Super Admin";
    case "vendor":
      return "Vendor";
    case "manager":
      return "Manager";
  }
}

export type NavItem = {
  href: string;
  label: string;
  exact?: boolean;
};

export function getNavItemsForStaff(staff: { role: StaffRole }): NavItem[] {
  const items: NavItem[] = [
    { href: "/admin", label: "Overview", exact: true },
  ];

  if (staff.role !== "manager") {
    items.push({ href: "/admin/users", label: "Users" });
  }

  if (staff.role === "super_admin") {
    items.push({ href: "/admin/vendors/approvals", label: "Vendor Approvals" });
  }

  items.push({ href: "/admin/products", label: "Products" });

  if (staff.role === "super_admin" || staff.role === "vendor") {
    items.push({ href: "/admin/audit", label: "Audit" });
  }

  return items;
}
