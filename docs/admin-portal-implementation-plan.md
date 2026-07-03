# Ethnique Admin Portal — Implementation Plan

## 1. Overview

Build an Admin Portal at `/admin` for Ethnique staff to manage users, vendor onboarding, products, and operational activity across markets (UK first, India reserved).

This document is the master plan. Development proceeds **one verified step at a time**. Do not skip ahead without review.

### Business roles

| Role | Description | Market scope |
|------|-------------|--------------|
| **Super Admin** | Ethnique company owners | All markets |
| **Vendor** | Third-party sellers onboarded onto the platform | Single assigned market |
| **Manager** | Vendor-assigned assistant with limited responsibility | Same market as their vendor |

Terminology in code and database uses `vendor` (not `admin`) to match Ethnique business language.

---

## 2. Requirements Summary

### 2.1 User management (RBAC)

| Actor | Create | Edit | Delete |
|-------|--------|------|--------|
| Super Admin | Super Admin, Vendor, Manager | All staff types | All staff types |
| Vendor | Manager only | Managers they own | Managers they own |
| Manager | — | — | — |

- Every staff user must have an email address.
- Managers are scoped to a single vendor (`vendor_id`) and market.

### 2.2 Vendor onboarding

1. Super Admin creates a Vendor invite: email + market (UK / India).
2. System sends onboarding email with a secure link valid for **7 calendar days**.
3. Vendor completes form: legal name, address, phone, identity documents.
   - **UK:** passport, driving licence, or utility bill.
   - **India:** Aadhar card copy (extensible for future doc types).
4. On submit: email to Ethnique Super Admin + confirmation email to Vendor.
5. Super Admin reviews in **Approval** tab → approve or reject.
6. On approval: completion email + vendor receives market access for product creation.

### 2.3 Product management

| Actor | Create | Read | Update | Delete | Activate (go live) |
|-------|--------|------|--------|--------|---------------------|
| Super Admin | ✓ all markets | ✓ all | ✓ all | ✓ all | ✓ |
| Vendor | ✓ own market | ✓ own market | ✓ own market | ✓ own market | ✓ |
| Manager | ✓ own market (inactive by default) | ✓ own market | ✓ own market | ✗ | ✗ |

- Vendors and Managers must not access product pages for other markets.
- Products created by Managers start as `is_active = false` until Vendor or Super Admin activates them.

### 2.4 Two-factor authentication (TOTP)

- **Mandatory** for Super Admin and Vendor (Microsoft Authenticator / any TOTP app).
- **Optional** for Manager.
- Enforced at login and before sensitive actions (user management, approvals).

Implementation uses **Supabase Auth MFA** (`auth.mfa_factors`) with application-level gates tracked on `profiles`.

### 2.5 Audit trail

- Log meaningful admin actions (not field-level noise).
- Store all timestamps in **UTC (GMT)**; UI converts to browser local timezone.
- Index on `actor_email`, `created_at`, and `market_id`.

**Log these events:**

- User created / updated / deleted / status changed
- Vendor invite sent / expired / revoked
- Vendor onboarding submitted / approved / rejected
- Login success / failed MFA / lockout (security events)
- Product created / updated / deleted / activated / deactivated
- Market access granted or revoked

**Do not log:**

- Read-only page views
- Autosave drafts
- Individual keystrokes or trivial field edits (batch into one “product updated” with changed fields in metadata)

---

## 3. Architecture Decisions

### 3.1 Stack (aligned with existing project)

- **Next.js App Router** — `/admin` route group
- **Supabase Auth** — email/password + TOTP MFA
- **Supabase Postgres** — RBAC, onboarding, audit
- **Supabase Storage** — private vendor identity documents
- **Resend** — transactional emails (extend existing `email_events` pattern)

### 3.2 Security model

```
┌─────────────────────────────────────────────────────────────┐
│  Next.js /admin (Server Components + Server Actions)        │
│  ├── Session from Supabase Auth                             │
│  ├── Role + market checks in server layer                     │
│  └── Service role for invite token validation (onboarding)  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Supabase Postgres                                          │
│  ├── profiles (role, market, vendor_id, status)             │
│  ├── vendor_onboarding_* tables                             │
│  ├── admin_audit_log                                        │
│  ├── RLS policies (market + role isolation)                 │
│  └── Triggers (manager product activation block)            │
└─────────────────────────────────────────────────────────────┘
```

- **Defence in depth:** UI checks + Server Actions + RLS + DB triggers.
- Onboarding public page uses **hashed tokens**; raw token only in email URL.
- Identity documents in a **private** storage bucket with signed URLs.

### 3.3 Product ↔ market model

Existing schema uses global `products` + `product_market_data` for pricing/stock per market.

Admin extensions add:

- `products.market_id` — primary market ownership (required for vendor-scoped products)
- `products.vendor_id` — owning vendor profile
- `products.created_by` / `updated_by` — audit attribution

Super Admins may manage products in any market. Vendors/Managers are constrained to their `profiles.market_id`.

### 3.4 Vendor onboarding state machine

```
[Super Admin creates invite]
        │
        ▼
   pending ──(7 days)──► expired
        │
        ▼ (vendor opens link)
   onboarding
        │
        ▼ (form submitted)
 pending_approval
        │
   ┌────┴────┐
   ▼         ▼
approved   rejected
   │
   ▼
 active (market access granted, MFA required before dashboard)
```

---

## 4. Database Schema (Step 1 — this deliverable)

New files in `supabase/TableSchemas/` (run after existing `00`–`12` files):

| File | Purpose |
|------|---------|
| `13_admin_profiles.sql` | Staff profiles linked to `auth.users` |
| `14_vendor_onboarding.sql` | Invites, submissions, identity documents |
| `15_admin_audit_log.sql` | Audit trail with indexes |
| `16_admin_rbac_functions.sql` | RBAC helpers, triggers, profile sync |
| `17_admin_product_extensions.sql` | Market/vendor attribution on products |
| `18_admin_email_extensions.sql` | Admin email types on `email_events` |
| `19_admin_storage_buckets.sql` | Private bucket for vendor KYC documents |
| `20_admin_rls_policies.sql` | RLS policies for admin portal and catalog |

Existing tables reused: `markets`, `products`, `product_market_data`, `email_events`.

Migrations: `supabase/migrations/20260703_admin_portal_schema.sql`, `20260703_admin_rls_policies.sql`.

---

## 5. Phased Implementation Steps

Each phase ends with **your verification** before the next begins.

### Phase 1 — Database schemas ✅

- [x] Define TableSchemas for admin RBAC, onboarding, audit, product extensions
- [x] Review schemas together
- [ ] Apply to Supabase (dev project) in numeric order
- [ ] Confirm seed data: UK + India markets exist (`01_markets.sql`)

### Phase 2 — RLS policies & migrations ✅

- [x] Create `supabase/migrations/` versioned migration files from TableSchemas
- [x] RLS on `profiles`, `vendor_onboarding_*`, `admin_audit_log`, `products`
- [x] Helper function `staff_can_access_product()` for market/vendor product isolation
- [x] Public storefront read policies (catalog remains browsable)
- [x] Apply migrations to Supabase dev project
- [ ] Verify: test queries as each role using Supabase SQL editor / JWT claims

### Phase 3 — Supabase Auth & MFA configuration ✅ (verify locally)

- [x] Add `@supabase/ssr` clients (`browser`, `server`, `admin/service`)
- [x] `proxy.ts` route protection for `/admin/*`
- [x] Login, MFA enroll, MFA verify pages
- [x] Mandatory TOTP for Super Admin and Vendor; optional for Manager
- [x] Admin session cookie (7-day expiry)
- [ ] Enable TOTP in Supabase Dashboard (manual step)
- [ ] Bootstrap first Super Admin (see `docs/admin-portal-phase3-setup.md`)
- [ ] Verify: login, enroll TOTP, blocked access without MFA when required

### Phase 4 — Admin shell & routing

Merged into Phase 3 (dashboard shell, header, nav placeholders).

### Phase 5 — Super Admin bootstrap

- One-time script or manual SQL to create first Super Admin in Supabase Auth + `profiles`
- Document env vars: `SUPABASE_SECRET_KEY`, `RESEND_API_KEY`, etc.
- **Verify:** first Super Admin can log in with MFA

### Phase 6 — Staff user management

- Super Admin: CRUD all staff types
- Vendor: CRUD Managers (same vendor + market)
- List/filter users by role, market, status
- Audit log entries on create/update/delete
- **Verify:** permission matrix from section 2.1

### Phase 7 — Vendor invite & email

- Super Admin form: email + market → create invite + send email
- 7-day expiry job (pg_cron or scheduled Edge Function)
- Resend templates: vendor onboarding invitation
- Extend `email_events` logging
- **Verify:** email received, link works, expired link rejected

### Phase 8 — Public vendor onboarding form

- Route: `/admin/onboard/[token]` (or `/onboard/vendor/[token]` — decide at implementation)
- Multi-step form: legal name, address, phone, document upload
- Market-specific document validation
- Creates `vendor_onboarding_submissions` + uploads to private bucket
- Emails: admin notification + vendor confirmation
- **Verify:** full happy path + invalid token + wrong document type for market

### Phase 9 — Vendor approval workflow

- Super Admin **Approval** tab: pending submissions queue
- Review submission + documents (signed URLs)
- Approve → create/activate auth user + profile, grant market access
- Reject → email vendor with reason
- **Verify:** approved vendor can log in; rejected vendor cannot

### Phase 10 — Product management (admin)

- Product list scoped by market
- CRUD with role permissions from section 2.3
- Manager creates inactive products; activation UI for Vendor/Super Admin
- Link products to `vendor_id` and `market_id`
- **Verify:** India vendor cannot see UK products; manager cannot delete or activate

### Phase 11 — Audit trail UI

- Paginated audit log with filters: email, date range, market, action, entity type
- Display timestamps in browser timezone (store UTC)
- Export CSV (optional, later)
- **Verify:** actions from phases 6–10 appear correctly

### Phase 12 — Hardening & QA

- TypeScript, lint, production build
- E2E checklist for all roles
- Security review: RLS bypass attempts, token reuse, document access
- Performance: audit log indexes under load

---

## 6. Route Map (planned)

| Route | Access |
|-------|--------|
| `/admin/login` | Public |
| `/admin/onboard/[token]` | Public (valid invite token) |
| `/admin` | Staff (redirect to dashboard) |
| `/admin/dashboard` | All staff |
| `/admin/users` | Super Admin, Vendor (scoped) |
| `/admin/vendors/invites` | Super Admin |
| `/admin/vendors/approvals` | Super Admin |
| `/admin/products` | All staff (market-scoped) |
| `/admin/products/new` | Super Admin, Vendor, Manager |
| `/admin/audit-log` | Super Admin (all), Vendor (own market) |
| `/admin/settings/mfa` | All staff |

---

## 7. Email Templates (planned)

| Template | Trigger |
|----------|---------|
| `vendor_onboarding_invite` | Super Admin creates vendor invite |
| `vendor_onboarding_submitted_admin` | Vendor submits onboarding form |
| `vendor_onboarding_submitted_vendor` | Vendor submits onboarding form |
| `vendor_onboarding_approved` | Super Admin approves |
| `vendor_onboarding_rejected` | Super Admin rejects |
| `staff_user_invite` | Direct staff user creation (non-onboarding path, if used) |
| `staff_mfa_reminder` | Vendor approved but MFA not enrolled |

---

## 8. Environment Variables (planned)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
RESEND_API_KEY=
ADMIN_FROM_EMAIL=
ADMIN_NOTIFICATION_EMAIL=
NEXT_PUBLIC_APP_URL=          # for onboarding link generation
```

---

## 9. Open Questions (resolve before relevant phase)

1. **Onboarding URL path** — `/admin/onboard/[token]` vs standalone `/onboard/vendor/[token]`?
2. **Categories** — global or per-market? (Not specified; default: global for now, revisit in Phase 10.)
3. **Vendor legal entity** — single profile per vendor company, or multiple vendor users per company later?
4. **Manager permissions** — any future granular permissions (orders only, products only), or role-level only for v1?
5. **Invite expiry job** — Supabase pg_cron vs Vercel cron vs Edge Function?

---

## 10. Reference

- Existing ecommerce schemas: `supabase/TableSchemas/01`–`12`
- Similar RBAC patterns: Aakruti `profiles`, `admin_audit_log`, RBAC migrations
- Website architecture: `docs/uk-first-ecommerce-website-architecture-plan.md`

---

## 11. Next Action

Complete Phase 3 verification: enable TOTP in Supabase, configure `.env.local`, bootstrap Super Admin, test login flow. See `docs/admin-portal-phase3-setup.md`. Then proceed to **Phase 6** (User management).
