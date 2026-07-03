import { createClient } from "@supabase/supabase-js";

import { getSupabaseServiceEnv } from "@/lib/env";

export function createAdminClient() {
  const env = getSupabaseServiceEnv();

  return createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
