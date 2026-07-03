# Supabase Table Schemas

These files define the Supabase schema for Ethnique: public Website ecommerce plus Admin Portal RBAC.

Guiding rules:

- UK is the default launch market with GBP pricing.
- India and INR are reserved for future market expansion.
- Checkout and orders are online-only.
- Stripe is the payment provider.
- Resend is used for order and admin emails.
- POS, SumUp, POS device concepts, and POS source filters are intentionally excluded.

## Execution order

Run files in numeric prefix order:

| Range | Domain |
|-------|--------|
| `00`–`12` | Ecommerce catalog, orders, email events, storage |
| `13`–`19` | Admin Portal: profiles, vendor onboarding, audit, RBAC, product extensions |
| `20` | Admin Portal RLS policies (catalog + staff + public read) |

Admin Portal implementation plan: `docs/admin-portal-implementation-plan.md`

Versioned migrations: `supabase/migrations/` (Phase 2).
