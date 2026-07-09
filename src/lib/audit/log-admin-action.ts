import { createAdminClient } from "@/lib/supabase/admin";
import type { StaffAuthState } from "@/lib/auth/admin";

export type AuditAction =
  | "auth.login"
  | "auth.logout"
  | "auth.mfa_enroll"
  | "user.create"
  | "user.update"
  | "user.delete"
  | "vendor.invite"
  | "vendor.approve"
  | "vendor.reject"
  | "vendor.delete_request"
  | "product.create"
  | "product.update"
  | "product.delete"
  | "product.activate";

type LogAdminActionInput = {
  actor: Pick<StaffAuthState, "userId" | "email" | "role" | "marketId">;
  action: AuditAction;
  entityType: string;
  entityId?: string | null;
  summary: string;
  metadata?: Record<string, unknown>;
};

export async function logAdminAction(input: LogAdminActionInput) {
  const admin = createAdminClient();

  const { error } = await admin.from("admin_audit_log").insert({
    actor_id: input.actor.userId,
    actor_email: input.actor.email,
    actor_role: input.actor.role,
    market_id: input.actor.marketId,
    action: input.action,
    entity_type: input.entityType,
    entity_id: input.entityId ?? null,
    summary: input.summary,
    metadata: input.metadata ?? {},
  });

  if (error) {
    console.error("Failed to write admin audit log:", error);
  }
}
