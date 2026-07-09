"use server";

import { revalidatePath } from "next/cache";

import { logAdminAction } from "@/lib/audit/log-admin-action";
import { getStaffAuthState, type StaffAuthState, type StaffRole } from "@/lib/auth/admin";
import {
  canCreateRole,
  canDeleteUser,
  canEditUser,
  isStaffRole,
} from "@/lib/auth/permissions";
import { createAdminClient } from "@/lib/supabase/admin";

type TargetProfile = {
  id: string;
  email: string;
  role: StaffRole;
  status: string;
  market_id: string | null;
  vendor_id: string | null;
  display_name: string | null;
};

const STAFF_STATUSES = ["active", "deactivated", "suspended"] as const;
type StaffStatus = (typeof STAFF_STATUSES)[number];

function parseRequired(value: FormDataEntryValue | null, label: string) {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) {
    throw new Error(`${label} is required.`);
  }
  return text;
}

function parseOptional(value: FormDataEntryValue | null) {
  const text = typeof value === "string" ? value.trim() : "";
  return text || null;
}

function validatePassword(password: string) {
  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }

  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    throw new Error("Password must include at least one letter and one number.");
  }
}

function validateEmail(email: string) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Enter a valid email address.");
  }
}

async function requireStaffActor(): Promise<StaffAuthState> {
  const staff = await getStaffAuthState();

  if (!staff) {
    throw new Error("Authentication required.");
  }

  return staff;
}

async function loadTargetProfile(userId: string): Promise<TargetProfile> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("profiles")
    .select("id, email, role, status, market_id, vendor_id, display_name")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data || !isStaffRole(data.role)) {
    throw new Error("User not found.");
  }

  return {
    id: data.id,
    email: data.email,
    role: data.role,
    status: data.status,
    market_id: data.market_id,
    vendor_id: data.vendor_id,
    display_name: data.display_name,
  };
}

function assertCanManageTarget(
  actor: StaffAuthState,
  target: TargetProfile,
  mode: "edit" | "delete",
) {
  const allowed =
    mode === "delete"
      ? canDeleteUser(
          actor.role,
          actor.marketId,
          actor.userId,
          target.role,
          target.market_id,
          target.vendor_id,
        )
      : canEditUser(
          actor.role,
          actor.marketId,
          actor.userId,
          target.role,
          target.market_id,
          target.vendor_id,
        );

  if (!allowed) {
    throw new Error("You do not have permission to manage this user.");
  }

  if (mode === "delete" && actor.userId === target.id) {
    throw new Error("You cannot delete your own account.");
  }
}

function assertCanResetPassword(actor: StaffAuthState, target: TargetProfile) {
  if (actor.userId === target.id) {
    return;
  }

  assertCanManageTarget(actor, target, "edit");
}

async function assertEmailAvailable(email: string, excludeUserId?: string) {
  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("profiles")
    .select("id")
    .neq("role", "customer")
    .ilike("email", email)
    .maybeSingle();

  if (existing && existing.id !== excludeUserId) {
    throw new Error("A staff account already exists with this email.");
  }
}

export async function createManagerAction(formData: FormData) {
  const actor = await requireStaffActor();

  if (!canCreateRole(actor.role, "manager")) {
    throw new Error("Forbidden");
  }

  if (!actor.marketId) {
    throw new Error("Your vendor market is not configured.");
  }

  const displayName = parseRequired(formData.get("display_name"), "Name");
  const email = parseRequired(formData.get("email"), "Email").toLowerCase();
  const phone = parseRequired(formData.get("phone"), "Phone number");
  const password = parseRequired(formData.get("password"), "Password");
  const addressLine1 = parseOptional(formData.get("address_line1"));
  const addressLine2 = parseOptional(formData.get("address_line2"));
  const city = parseOptional(formData.get("city"));
  const stateRegion = parseOptional(formData.get("state_region"));
  const postalCode = parseOptional(formData.get("postal_code"));
  const countryCode = parseOptional(formData.get("country_code"));

  validateEmail(email);
  validatePassword(password);
  await assertEmailAvailable(email);

  const admin = createAdminClient();

  const { data: createdUser, error: createUserError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      display_name: displayName,
      role: "manager",
    },
  });

  if (createUserError || !createdUser.user) {
    throw new Error(createUserError?.message ?? "Failed to create manager account.");
  }

  const userId = createdUser.user.id;

  const { error: profileError } = await admin.from("profiles").upsert({
    id: userId,
    email,
    role: "manager",
    status: "active",
    market_id: actor.marketId,
    vendor_id: actor.userId,
    display_name: displayName,
    phone,
    address_line1: addressLine1,
    address_line2: addressLine2,
    city,
    state_region: stateRegion,
    postal_code: postalCode,
    country_code: countryCode?.toUpperCase() ?? null,
    totp_required: false,
    created_by: actor.userId,
  });

  if (profileError) {
    await admin.auth.admin.deleteUser(userId);
    throw new Error(profileError.message);
  }

  await logAdminAction({
    actor,
    action: "user.create",
    entityType: "profile",
    entityId: userId,
    summary: `Created manager ${email}`,
    metadata: { role: "manager", vendorId: actor.userId },
  });

  revalidatePath("/admin/users");
  return { ok: true as const, userId };
}

export async function updateStaffStatusAction(userId: string, status: StaffStatus) {
  const actor = await requireStaffActor();
  const target = await loadTargetProfile(userId);

  if (!STAFF_STATUSES.includes(status)) {
    throw new Error("Invalid status.");
  }

  assertCanManageTarget(actor, target, "edit");

  if (actor.userId === target.id && status !== "active") {
    throw new Error("You cannot deactivate your own account.");
  }

  const admin = createAdminClient();

  const { error } = await admin
    .from("profiles")
    .update({ status })
    .eq("id", userId);

  if (error) {
    throw new Error(error.message);
  }

  await logAdminAction({
    actor,
    action: "user.update",
    entityType: "profile",
    entityId: userId,
    summary: `Set ${target.email} status to ${status}`,
    metadata: { status, previousStatus: target.status },
  });

  revalidatePath("/admin/users");
  return { ok: true as const };
}

export async function deleteStaffUserAction(userId: string) {
  const actor = await requireStaffActor();
  const target = await loadTargetProfile(userId);

  assertCanManageTarget(actor, target, "delete");

  const admin = createAdminClient();

  const { error: authError } = await admin.auth.admin.deleteUser(userId);

  if (authError) {
    throw new Error(authError.message);
  }

  await logAdminAction({
    actor,
    action: "user.delete",
    entityType: "profile",
    entityId: userId,
    summary: `Deleted ${target.role} account ${target.email}`,
    metadata: { role: target.role },
  });

  revalidatePath("/admin/users");
  return { ok: true as const };
}

export async function resetStaffPasswordAction(userId: string, newPassword: string) {
  const actor = await requireStaffActor();
  const target = await loadTargetProfile(userId);

  assertCanResetPassword(actor, target);
  validatePassword(newPassword);

  const admin = createAdminClient();

  const { error } = await admin.auth.admin.updateUserById(userId, {
    password: newPassword,
  });

  if (error) {
    throw new Error(error.message);
  }

  await logAdminAction({
    actor,
    action: "user.password_reset",
    entityType: "profile",
    entityId: userId,
    summary:
      actor.userId === target.id
        ? `${target.email} changed their password`
        : `Reset password for ${target.email}`,
    metadata: { targetRole: target.role },
  });

  revalidatePath("/admin/users");
  return { ok: true as const };
}

export async function updateManagerProfileAction(formData: FormData) {
  const actor = await requireStaffActor();
  const userId = parseRequired(formData.get("user_id"), "User");
  const target = await loadTargetProfile(userId);

  if (target.role !== "manager") {
    throw new Error("Only manager profiles can be updated with this form.");
  }

  assertCanManageTarget(actor, target, "edit");

  const displayName = parseRequired(formData.get("display_name"), "Name");
  const phone = parseRequired(formData.get("phone"), "Phone number");
  const addressLine1 = parseOptional(formData.get("address_line1"));
  const addressLine2 = parseOptional(formData.get("address_line2"));
  const city = parseOptional(formData.get("city"));
  const stateRegion = parseOptional(formData.get("state_region"));
  const postalCode = parseOptional(formData.get("postal_code"));
  const countryCode = parseOptional(formData.get("country_code"));

  const admin = createAdminClient();

  const { error } = await admin
    .from("profiles")
    .update({
      display_name: displayName,
      phone,
      address_line1: addressLine1,
      address_line2: addressLine2,
      city,
      state_region: stateRegion,
      postal_code: postalCode,
      country_code: countryCode?.toUpperCase() ?? null,
    })
    .eq("id", userId);

  if (error) {
    throw new Error(error.message);
  }

  await admin.auth.admin.updateUserById(userId, {
    user_metadata: { display_name: displayName },
  });

  await logAdminAction({
    actor,
    action: "user.update",
    entityType: "profile",
    entityId: userId,
    summary: `Updated manager profile ${target.email}`,
  });

  revalidatePath("/admin/users");
  return { ok: true as const };
}
