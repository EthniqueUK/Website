import type { StaffRole } from "@/lib/auth/admin";

export const STAFF_ROLES: StaffRole[] = ["super_admin", "vendor", "manager"];

export function isStaffRole(role: string | null | undefined): role is StaffRole {
  return role === "super_admin" || role === "vendor" || role === "manager";
}

export function requiresMandatoryMfa(role: StaffRole): boolean {
  return role === "super_admin";
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

/**
 * Icon keys map to SVG components in
 * `app/admin/(protected)/_components/admin-icons.tsx`.
 * Kept as strings here so this module stays free of React/JSX.
 */
export type AdminNavIcon =
  | "box"
  | "tag"
  | "cart"
  | "bag"
  | "users"
  | "card"
  | "calculator"
  | "clipboard"
  | "shield";

export type AdminTab = {
  href: string;
  label: string;
  description: string;
  icon: AdminNavIcon;
  roles: StaffRole[];
};

export type AdminGroup = {
  key: string;
  label: string;
  description: string;
  icon: AdminNavIcon;
  accent: string;
  tabs: AdminTab[];
};

const ADMIN_GROUPS: AdminGroup[] = [
  {
    key: "products",
    label: "Products Management",
    description: "Catalogue, listings and categories",
    icon: "box",
    accent: "#3B0F14",
    tabs: [
      {
        href: "/admin/products",
        label: "Products",
        description: "Create, edit and publish products",
        icon: "box",
        roles: ["super_admin", "vendor", "manager"],
      },
      {
        href: "/admin/categories",
        label: "Categories",
        description: "Organise the catalogue",
        icon: "tag",
        roles: ["super_admin", "vendor"],
      },
    ],
  },
  {
    key: "orders",
    label: "Orders Management",
    description: "Orders, customers and checkout",
    icon: "bag",
    accent: "#7A2030",
    tabs: [
      {
        href: "/admin/orders",
        label: "Orders",
        description: "View and fulfil orders",
        icon: "cart",
        roles: ["super_admin", "vendor"],
      },
      {
        href: "/admin/customers",
        label: "Customers",
        description: "Customer records",
        icon: "users",
        roles: ["super_admin", "vendor"],
      },
      {
        href: "/admin/checkout",
        label: "Checkout",
        description: "Checkout settings",
        icon: "card",
        roles: ["super_admin"],
      },
    ],
  },
  {
    key: "pos",
    label: "POS",
    description: "Point of sale",
    icon: "calculator",
    accent: "#5C1520",
    tabs: [
      {
        href: "/admin/pos",
        label: "POS",
        description: "In-person sales terminal",
        icon: "calculator",
        roles: ["super_admin", "vendor"],
      },
    ],
  },
  {
    key: "users",
    label: "Users Management",
    description: "Staff, vendors and audit trail",
    icon: "users",
    accent: "#9A7B4F",
    tabs: [
      {
        href: "/admin/users",
        label: "Users",
        description: "Manage staff accounts",
        icon: "users",
        roles: ["super_admin", "vendor"],
      },
      {
        href: "/admin/vendors/approvals",
        label: "Vendor Requests",
        description: "Onboarding invites and approvals",
        icon: "shield",
        roles: ["super_admin"],
      },
      {
        href: "/admin/audit",
        label: "Audit",
        description: "Activity and audit log",
        icon: "clipboard",
        roles: ["super_admin", "vendor"],
      },
    ],
  },
];

export function getAdminGroupsForStaff(staff: { role: StaffRole }): AdminGroup[] {
  return ADMIN_GROUPS.map((group) => ({
    ...group,
    tabs: group.tabs.filter((tab) => tab.roles.includes(staff.role)),
  })).filter((group) => group.tabs.length > 0);
}
