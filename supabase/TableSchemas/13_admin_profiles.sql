-- Staff profiles linked to Supabase Auth users.
-- Roles: super_admin | vendor | manager | customer
-- Run after 01_markets.sql

create table public.profiles (
  id uuid not null,
  email text not null,
  role text not null default 'customer'::text,
  market_id uuid null,
  vendor_id uuid null,
  display_name text null,
  legal_name text null,
  phone text null,
  address_line1 text null,
  address_line2 text null,
  city text null,
  state_region text null,
  postal_code text null,
  country_code text null,
  status text not null default 'active'::text,
  totp_required boolean not null default false,
  totp_enrolled_at timestamp with time zone null,
  created_by uuid null,
  approved_by uuid null,
  approved_at timestamp with time zone null,
  last_login_at timestamp with time zone null,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone('utc'::text, now()),
  constraint profiles_pkey primary key (id),
  constraint profiles_id_fkey foreign key (id) references auth.users (id) on delete cascade,
  constraint profiles_market_id_fkey foreign key (market_id) references public.markets (id) on delete restrict,
  constraint profiles_vendor_id_fkey foreign key (vendor_id) references public.profiles (id) on delete restrict,
  constraint profiles_created_by_fkey foreign key (created_by) references public.profiles (id) on delete set null,
  constraint profiles_approved_by_fkey foreign key (approved_by) references public.profiles (id) on delete set null,
  constraint profiles_email_not_blank check (length(trim(email)) > 0),
  constraint profiles_role_check check (
    role = any (array['super_admin'::text, 'vendor'::text, 'manager'::text, 'customer'::text])
  ),
  constraint profiles_status_check check (
    status = any (
      array[
        'invited'::text,
        'onboarding'::text,
        'pending_approval'::text,
        'active'::text,
        'suspended'::text,
        'rejected'::text,
        'deactivated'::text
      ]
    )
  ),
  constraint profiles_staff_email_required check (
    role = 'customer'::text
    or length(trim(email)) > 0
  ),
  constraint profiles_market_scope check (
    (role = 'super_admin'::text and market_id is null)
    or (role in ('vendor'::text, 'manager'::text) and market_id is not null)
    or (role = 'customer'::text)
  ),
  constraint profiles_vendor_scope check (
    (role = 'manager'::text and vendor_id is not null)
    or (role <> 'manager'::text and vendor_id is null)
  ),
  constraint profiles_country_code_uppercase check (
    country_code is null
    or country_code = upper(country_code)
  )
);

create unique index if not exists ux_profiles_email_lower
on public.profiles (lower(trim(email)))
where role <> 'customer'::text;

create index if not exists idx_profiles_role on public.profiles using btree (role);
create index if not exists idx_profiles_market_id on public.profiles using btree (market_id) where market_id is not null;
create index if not exists idx_profiles_vendor_id on public.profiles using btree (vendor_id) where vendor_id is not null;
create index if not exists idx_profiles_status on public.profiles using btree (status);
create index if not exists idx_profiles_email_lower on public.profiles using btree (lower(trim(email)));
create index if not exists idx_profiles_created_at on public.profiles using btree (created_at desc);

create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

comment on table public.profiles is 'Application profiles for customers and admin staff. Staff roles enforce market and vendor scoping.';
comment on column public.profiles.totp_required is 'True for super_admin and vendor; optional for manager unless explicitly set.';
comment on column public.profiles.status is 'Lifecycle state; vendors progress invited → onboarding → pending_approval → active.';
