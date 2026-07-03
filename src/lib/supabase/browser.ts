"use client";

import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !publishableKey) {
  throw new Error(
    "Missing Supabase env: NEXT_PUBLIC_SUPABASE_URL and "
    + "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (sb_publishable_...)",
  );
}

export const supabase = createBrowserClient(supabaseUrl, publishableKey);
