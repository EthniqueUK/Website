# Supabase Migrations

Versioned SQL migrations for the Ethnique Supabase project.

## Prerequisites

Before admin portal migrations, the ecommerce foundation must exist. If starting from a fresh Supabase project, run **TableSchemas `00`–`12`** in order via the SQL Editor (or add a future ecommerce foundation migration).

## Admin portal migrations (Phase 2)

Run in this order:

| Order | Migration | Purpose |
|-------|-----------|---------|
| **1** | `20260703_ecommerce_foundation.sql` | Markets, catalog, orders, email events, storage buckets |
| **2** | `20260703_admin_portal_schema.sql` | Profiles, vendor onboarding, audit log, RBAC functions, product extensions |
| **3** | `20260703_admin_rls_policies.sql` | Row Level Security for admin portal + catalog staff access + public storefront reads |

> **Important:** If you see `relation "public.markets" does not exist`, you skipped step 1. Run the ecommerce foundation migration first.

## How to apply

### Option A — Supabase CLI

```bash
supabase db push
```

### Option B — Supabase SQL Editor

Run each migration file **in order**:

1. `20260703_ecommerce_foundation.sql`
2. `20260703_admin_portal_schema.sql`
3. `20260703_admin_rls_policies.sql`

## TableSchemas parity

Canonical schema definitions live in `supabase/TableSchemas/`:

| Range | Domain |
|-------|--------|
| `00`–`12` | Ecommerce |
| `13`–`19` | Admin portal tables and functions |
| `20` | RLS policies |

Migrations are generated from TableSchemas for deployment. When changing schema, update TableSchemas first, then regenerate or hand-sync migrations.

## Verification checklist (Phase 2)

After applying migrations, confirm in the SQL Editor:

1. Tables exist: `profiles`, `vendor_onboarding_invites`, `vendor_onboarding_submissions`, `vendor_identity_documents`, `admin_audit_log`
2. `products` has columns: `market_id`, `vendor_id`, `created_by`, `updated_by`
3. RLS enabled on admin tables and catalog tables
4. Helper functions exist: `is_super_admin()`, `is_vendor()`, `staff_can_access_market()`, `staff_can_access_product()`
5. Storage bucket `vendor-identity-documents` exists (private)

## Service role note

Vendor public onboarding (token-based form, KYC upload) uses the **service role** in Next.js Server Actions — not authenticated RLS. Dashboard operations use authenticated staff sessions with RLS.

## Next phase

Phase 3: Supabase Auth clients, MFA configuration, and `/admin` route protection. See `docs/admin-portal-implementation-plan.md`.
