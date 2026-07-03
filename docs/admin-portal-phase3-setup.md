# Phase 3 — Supabase Auth & MFA Setup

## 1. Supabase project settings

In the Supabase Dashboard for your Ethnique project:

1. **Authentication → Providers → Email** — ensure Email provider is enabled.
2. **Authentication → Multi-Factor Authentication** — enable **TOTP (App Authenticator)**.
3. **Authentication → URL Configuration** — add site URL:
   - Dev: `http://localhost:3005`
   - Production: your deployed domain
4. Copy **Project URL** and **Publishable key** (`sb_publishable_...`, Settings → API Keys) into `.env.local`.
5. Copy **Secret key** (`sb_secret_...`) into `.env.local` as `SUPABASE_SECRET_KEY` (server-only, never expose to browser).

## 2. Local environment

```bash
cp .env.example .env.local
# Fill in Supabase values
npm run dev
```

Admin portal: [http://localhost:3005/admin/login](http://localhost:3005/admin/login)

## 3. Bootstrap first Super Admin

Run in Supabase SQL Editor **after** migrations are applied.

### Step A — Create auth user (Dashboard)

**Authentication → Users → Add user**

- Email: your super admin email
- Password: strong temporary password
- Auto-confirm user: **Yes**

Note the user's **UUID** from the users list.

### Step B — Promote profile to Super Admin

Replace placeholders and run:

```sql
update public.profiles
set
  role = 'super_admin',
  status = 'active',
  market_id = null,
  email = 'YOUR_EMAIL@example.com',
  display_name = 'Super Admin',
  totp_required = true,
  updated_at = timezone('utc', now())
where id = 'YOUR_AUTH_USER_UUID';
```

If no profile row exists (trigger may not have fired for pre-migration users):

```sql
insert into public.profiles (
  id,
  email,
  role,
  status,
  display_name,
  totp_required
)
values (
  'YOUR_AUTH_USER_UUID',
  'YOUR_EMAIL@example.com',
  'super_admin',
  'active',
  'Super Admin',
  true
);
```

## 4. Verification checklist

| Step | Expected result |
|------|-----------------|
| Visit `/admin` while logged out | Redirect to `/admin/login` |
| Sign in as non-staff customer | "That account does not have admin access" |
| Sign in as Super Admin | Redirect to MFA enroll (first time) |
| Scan QR in Microsoft Authenticator | Account shows as "Ethnique Admin" |
| Complete MFA setup | Dashboard loads at `/admin` |
| Sign out and sign in again | MFA verify screen, then dashboard |
| Manager (optional MFA) | Can sign in without MFA enrollment |

## 5. MFA notes

- **Super Admin & Vendor:** mandatory TOTP; blocked from dashboard until enrolled and verified (AAL2).
- **Manager:** optional; session established on login without MFA.
- Authenticator label: **Ethnique Admin** (issuer: **Ethnique**).
- Admin session cookie expires after **7 days**; user must sign in again.

## 6. Troubleshooting

| Issue | Fix |
|-------|-----|
| `Missing environment variable` on startup | Fill `.env.local` from `.env.example` |
| Login works but instant redirect to login | Check profile `role` and `status = 'active'` |
| MFA enroll shows duplicate friendly name | Use "Show new QR code" or call `/api/admin/auth/mfa-cleanup` |
| Audit log insert fails on login | Ensure `SUPABASE_SECRET_KEY` is set |

## Next phase

**Phase 4–5:** Admin shell refinements and formal Super Admin bootstrap script (optional). **Phase 6:** User management CRUD.
