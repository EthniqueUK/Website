import { createAdminClient } from "@/lib/supabase/admin";

type AdminMfaFactor = {
  id: string;
};

export async function adminResetAllMfaFactors(userId: string) {
  const admin = createAdminClient();

  const { data, error } = await admin.auth.admin.mfa.listFactors({ userId });

  if (error) {
    throw new Error(error.message);
  }

  const factors = (data?.factors ?? []) as AdminMfaFactor[];

  for (const factor of factors) {
    const { error: deleteError } = await admin.auth.admin.mfa.deleteFactor({
      id: factor.id,
      userId,
    });

    if (deleteError) {
      throw new Error(deleteError.message);
    }
  }
}
