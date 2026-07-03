-- =========================================
-- Admin Portal schema (TableSchemas 13-19)
-- Prerequisite: run 20260703_ecommerce_foundation.sql (or TableSchemas 00-12) first
-- =========================================

begin;

-- ---- from 13_admin_profiles.sql ----
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


-- ---- from 14_vendor_onboarding.sql ----
-- Vendor onboarding: invites, submissions, and identity documents.
-- Run after 13_admin_profiles.sql

create table public.vendor_onboarding_invites (
  id uuid not null default gen_random_uuid(),
  email text not null,
  market_id uuid not null,
  token_hash text not null,
  invited_by uuid not null,
  expires_at timestamp with time zone not null,
  status text not null default 'pending'::text,
  completed_at timestamp with time zone null,
  revoked_at timestamp with time zone null,
  revoked_by uuid null,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone('utc'::text, now()),
  constraint vendor_onboarding_invites_pkey primary key (id),
  constraint vendor_onboarding_invites_market_id_fkey foreign key (market_id) references public.markets (id) on delete restrict,
  constraint vendor_onboarding_invites_invited_by_fkey foreign key (invited_by) references public.profiles (id) on delete restrict,
  constraint vendor_onboarding_invites_revoked_by_fkey foreign key (revoked_by) references public.profiles (id) on delete set null,
  constraint vendor_onboarding_invites_email_not_blank check (length(trim(email)) > 0),
  constraint vendor_onboarding_invites_token_hash_not_blank check (length(trim(token_hash)) > 0),
  constraint vendor_onboarding_invites_status_check check (
    status = any (array['pending'::text, 'completed'::text, 'expired'::text, 'revoked'::text])
  ),
  constraint vendor_onboarding_invites_expires_after_created check (expires_at > created_at)
);

create unique index if not exists ux_vendor_invites_token_hash
on public.vendor_onboarding_invites (token_hash);

create index if not exists idx_vendor_invites_email_lower
on public.vendor_onboarding_invites (lower(trim(email)));

create index if not exists idx_vendor_invites_market_id
on public.vendor_onboarding_invites (market_id);

create index if not exists idx_vendor_invites_status
on public.vendor_onboarding_invites (status);

create index if not exists idx_vendor_invites_expires_at
on public.vendor_onboarding_invites (expires_at)
where status = 'pending'::text;

create trigger trg_vendor_onboarding_invites_updated_at
before update on public.vendor_onboarding_invites
for each row execute function public.set_updated_at();

create table public.vendor_onboarding_submissions (
  id uuid not null default gen_random_uuid(),
  invite_id uuid not null,
  profile_id uuid null,
  legal_name text not null,
  phone text not null,
  address_line1 text not null,
  address_line2 text null,
  city text not null,
  state_region text null,
  postal_code text not null,
  country_code text not null,
  status text not null default 'submitted'::text,
  submitted_at timestamp with time zone not null default timezone('utc'::text, now()),
  reviewed_by uuid null,
  reviewed_at timestamp with time zone null,
  rejection_reason text null,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone('utc'::text, now()),
  constraint vendor_onboarding_submissions_pkey primary key (id),
  constraint vendor_onboarding_submissions_invite_id_key unique (invite_id),
  constraint vendor_onboarding_submissions_invite_id_fkey foreign key (invite_id) references public.vendor_onboarding_invites (id) on delete restrict,
  constraint vendor_onboarding_submissions_profile_id_fkey foreign key (profile_id) references public.profiles (id) on delete set null,
  constraint vendor_onboarding_submissions_reviewed_by_fkey foreign key (reviewed_by) references public.profiles (id) on delete set null,
  constraint vendor_onboarding_submissions_legal_name_not_blank check (length(trim(legal_name)) > 0),
  constraint vendor_onboarding_submissions_phone_not_blank check (length(trim(phone)) > 0),
  constraint vendor_onboarding_submissions_address_not_blank check (length(trim(address_line1)) > 0),
  constraint vendor_onboarding_submissions_city_not_blank check (length(trim(city)) > 0),
  constraint vendor_onboarding_submissions_postal_code_not_blank check (length(trim(postal_code)) > 0),
  constraint vendor_onboarding_submissions_country_code_not_blank check (length(trim(country_code)) > 0),
  constraint vendor_onboarding_submissions_country_code_uppercase check (country_code = upper(country_code)),
  constraint vendor_onboarding_submissions_status_check check (
    status = any (array['submitted'::text, 'approved'::text, 'rejected'::text])
  ),
  constraint vendor_onboarding_submissions_rejection_reason_when_rejected check (
    status <> 'rejected'::text
    or (rejection_reason is not null and length(trim(rejection_reason)) > 0)
  )
);

create index if not exists idx_vendor_submissions_status
on public.vendor_onboarding_submissions (status);

create index if not exists idx_vendor_submissions_submitted_at
on public.vendor_onboarding_submissions (submitted_at desc);

create index if not exists idx_vendor_submissions_profile_id
on public.vendor_onboarding_submissions (profile_id)
where profile_id is not null;

create trigger trg_vendor_onboarding_submissions_updated_at
before update on public.vendor_onboarding_submissions
for each row execute function public.set_updated_at();

create table public.vendor_identity_documents (
  id uuid not null default gen_random_uuid(),
  submission_id uuid not null,
  document_type text not null,
  storage_path text not null,
  original_filename text null,
  mime_type text null,
  file_size_bytes integer null,
  uploaded_at timestamp with time zone not null default timezone('utc'::text, now()),
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  constraint vendor_identity_documents_pkey primary key (id),
  constraint vendor_identity_documents_submission_id_fkey foreign key (submission_id) references public.vendor_onboarding_submissions (id) on delete cascade,
  constraint vendor_identity_documents_storage_path_not_blank check (length(trim(storage_path)) > 0),
  constraint vendor_identity_documents_document_type_check check (
    document_type = any (
      array[
        'passport'::text,
        'driving_licence'::text,
        'utility_bill'::text,
        'aadhar'::text
      ]
    )
  ),
  constraint vendor_identity_documents_file_size_non_negative check (
    file_size_bytes is null
    or file_size_bytes >= 0
  )
);

create index if not exists idx_vendor_identity_documents_submission_id
on public.vendor_identity_documents (submission_id);

create index if not exists idx_vendor_identity_documents_document_type
on public.vendor_identity_documents (document_type);

comment on table public.vendor_onboarding_invites is 'Single-use onboarding links sent to prospective vendors. Token stored as hash only.';
comment on column public.vendor_onboarding_invites.expires_at is 'Invite expiry (7 calendar days from creation, set by application layer).';
comment on table public.vendor_identity_documents is 'KYC uploads. UK: passport, driving_licence, utility_bill. India: aadhar. Validated in application layer by market.';


-- ---- from 15_admin_audit_log.sql ----
-- Admin activity audit trail. All timestamps stored in UTC.
-- Run after 13_admin_profiles.sql

create table public.admin_audit_log (
  id uuid not null default gen_random_uuid(),
  actor_id uuid null,
  actor_email text not null,
  actor_role text not null,
  market_id uuid null,
  action text not null,
  entity_type text not null,
  entity_id text null,
  summary text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  constraint admin_audit_log_pkey primary key (id),
  constraint admin_audit_log_actor_id_fkey foreign key (actor_id) references public.profiles (id) on delete set null,
  constraint admin_audit_log_market_id_fkey foreign key (market_id) references public.markets (id) on delete set null,
  constraint admin_audit_log_actor_email_not_blank check (length(trim(actor_email)) > 0),
  constraint admin_audit_log_actor_role_not_blank check (length(trim(actor_role)) > 0),
  constraint admin_audit_log_action_not_blank check (length(trim(action)) > 0),
  constraint admin_audit_log_entity_type_not_blank check (length(trim(entity_type)) > 0),
  constraint admin_audit_log_summary_not_blank check (length(trim(summary)) > 0),
  constraint admin_audit_log_metadata_object check (jsonb_typeof(metadata) = 'object')
);

create index if not exists idx_audit_actor_email
on public.admin_audit_log using btree (lower(trim(actor_email)));

create index if not exists idx_audit_created_at
on public.admin_audit_log using btree (created_at desc);

create index if not exists idx_audit_market_id
on public.admin_audit_log using btree (market_id)
where market_id is not null;

create index if not exists idx_audit_market_created_at
on public.admin_audit_log using btree (market_id, created_at desc)
where market_id is not null;

create index if not exists idx_audit_action
on public.admin_audit_log using btree (action);

create index if not exists idx_audit_entity
on public.admin_audit_log using btree (entity_type, entity_id);

comment on table public.admin_audit_log is 'Meaningful admin actions only. Display layer converts created_at from UTC to browser timezone.';
comment on column public.admin_audit_log.metadata is 'Optional structured context, e.g. changed_fields, previous_status, invite_id.';


-- ---- from 16_admin_rbac_functions.sql ----
-- RBAC helper functions, profile defaults, and product activation guard.
-- Run after 13_admin_profiles.sql, 15_admin_audit_log.sql, 03_products.sql

create or replace function public.current_profile_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.current_profile_market_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select market_id from public.profiles where id = auth.uid();
$$;

create or replace function public.current_profile_vendor_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select vendor_id from public.profiles where id = auth.uid();
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_profile_role() = 'super_admin', false);
$$;

create or replace function public.is_vendor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_profile_role() = 'vendor', false);
$$;

create or replace function public.is_manager()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_profile_role() = 'manager', false);
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    public.current_profile_role() in ('super_admin', 'vendor', 'manager'),
    false
  );
$$;

create or replace function public.is_vendor_or_above()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    public.current_profile_role() in ('super_admin', 'vendor'),
    false
  );
$$;

create or replace function public.staff_can_access_market(target_market_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_super_admin()
    or public.current_profile_market_id() = target_market_id;
$$;

create or replace function public.staff_can_manage_role(target_role text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case public.current_profile_role()
    when 'super_admin' then target_role in ('super_admin', 'vendor', 'manager')
    when 'vendor' then target_role = 'manager'
    else false
  end;
$$;

create or replace function public.staff_can_manage_profile(target_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles target
    where target.id = target_profile_id
      and (
        public.is_super_admin()
        or (
          public.is_vendor()
          and target.role = 'manager'
          and target.vendor_id = auth.uid()
          and target.market_id = public.current_profile_market_id()
        )
      )
  );
$$;

create or replace function public.staff_can_access_product(
  target_market_id uuid,
  target_vendor_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_super_admin()
    or (
      public.is_staff()
      and target_market_id is not null
      and public.staff_can_access_market(target_market_id)
      and (
        (public.is_vendor() and target_vendor_id = auth.uid())
        or (public.is_manager() and target_vendor_id = public.current_profile_vendor_id())
      )
    );
$$;

create or replace function public.set_profile_totp_required()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role in ('super_admin', 'vendor') then
    new.totp_required := true;
  elsif new.role = 'manager' then
    new.totp_required := coalesce(new.totp_required, false);
  else
    new.totp_required := false;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_profiles_set_totp_required on public.profiles;

create trigger trg_profiles_set_totp_required
before insert or update of role on public.profiles
for each row
execute function public.set_profile_totp_required();

create or replace function public.enforce_manager_product_defaults()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.current_profile_role() = 'manager' then
    new.is_active := false;
  end if;

  return new;
end;
$$;

create or replace function public.enforce_manager_product_activation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.current_profile_role() = 'manager'
     and old.is_active = false
     and new.is_active = true then
    raise exception 'Managers cannot activate products';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_enforce_manager_product_defaults on public.products;

create trigger trg_enforce_manager_product_defaults
before insert on public.products
for each row
execute function public.enforce_manager_product_defaults();

drop trigger if exists trg_enforce_manager_product_activation on public.products;

create trigger trg_enforce_manager_product_activation
before update of is_active on public.products
for each row
execute function public.enforce_manager_product_activation();

create or replace function public.handle_new_auth_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role, status)
  values (
    new.id,
    coalesce(new.email, ''),
    'customer',
    'active'
  )
  on conflict (id) do update
  set
    email = excluded.email,
    updated_at = timezone('utc', now());

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;

create trigger on_auth_user_created_profile
after insert on auth.users
for each row
execute function public.handle_new_auth_user_profile();

comment on function public.staff_can_manage_role is 'Super Admin manages all staff roles; Vendor manages Managers only.';


-- ---- from 17_admin_product_extensions.sql ----
-- Admin extensions to products for market and vendor scoping.
-- Run after 03_products.sql and 13_admin_profiles.sql

alter table public.products
  add column if not exists market_id uuid null,
  add column if not exists vendor_id uuid null,
  add column if not exists created_by uuid null,
  add column if not exists updated_by uuid null;

alter table public.products
  drop constraint if exists products_market_id_fkey;

alter table public.products
  add constraint products_market_id_fkey
  foreign key (market_id) references public.markets (id) on delete restrict;

alter table public.products
  drop constraint if exists products_vendor_id_fkey;

alter table public.products
  add constraint products_vendor_id_fkey
  foreign key (vendor_id) references public.profiles (id) on delete restrict;

alter table public.products
  drop constraint if exists products_created_by_fkey;

alter table public.products
  add constraint products_created_by_fkey
  foreign key (created_by) references public.profiles (id) on delete set null;

alter table public.products
  drop constraint if exists products_updated_by_fkey;

alter table public.products
  add constraint products_updated_by_fkey
  foreign key (updated_by) references public.profiles (id) on delete set null;

create index if not exists idx_products_market_id
on public.products (market_id)
where market_id is not null;

create index if not exists idx_products_vendor_id
on public.products (vendor_id)
where vendor_id is not null;

create index if not exists idx_products_created_by
on public.products (created_by)
where created_by is not null;

create index if not exists idx_products_market_active
on public.products (market_id, is_active)
where market_id is not null;

comment on column public.products.market_id is 'Primary market ownership for vendor-scoped catalog management.';
comment on column public.products.vendor_id is 'Owning vendor profile. Set for vendor and manager created products.';
comment on column public.products.created_by is 'Staff profile that created the product. Managers create inactive products by default.';


-- ---- from 18_admin_email_extensions.sql ----
-- Extend email_events for admin portal transactional emails.
-- Run after 11_email_events.sql

alter table public.email_events
  drop constraint if exists email_events_type_valid;

alter table public.email_events
  add constraint email_events_type_valid check (
    email_type = any (
      array[
        'admin_order_notification'::text,
        'customer_order_confirmation'::text,
        'customer_fulfillment'::text,
        'customer_cancellation'::text,
        'vendor_onboarding_invite'::text,
        'vendor_onboarding_submitted_admin'::text,
        'vendor_onboarding_submitted_vendor'::text,
        'vendor_onboarding_approved'::text,
        'vendor_onboarding_rejected'::text,
        'staff_user_invite'::text,
        'staff_mfa_reminder'::text
      ]
    )
  );

alter table public.email_events
  add column if not exists profile_id uuid null,
  add column if not exists invite_id uuid null,
  add column if not exists submission_id uuid null;

alter table public.email_events
  drop constraint if exists email_events_profile_id_fkey;

alter table public.email_events
  add constraint email_events_profile_id_fkey
  foreign key (profile_id) references public.profiles (id) on delete set null;

alter table public.email_events
  drop constraint if exists email_events_invite_id_fkey;

alter table public.email_events
  add constraint email_events_invite_id_fkey
  foreign key (invite_id) references public.vendor_onboarding_invites (id) on delete set null;

alter table public.email_events
  drop constraint if exists email_events_submission_id_fkey;

alter table public.email_events
  add constraint email_events_submission_id_fkey
  foreign key (submission_id) references public.vendor_onboarding_submissions (id) on delete set null;

create index if not exists idx_email_events_profile_id
on public.email_events (profile_id)
where profile_id is not null;

create index if not exists idx_email_events_invite_id
on public.email_events (invite_id)
where invite_id is not null;

create index if not exists idx_email_events_submission_id
on public.email_events (submission_id)
where submission_id is not null;

create index if not exists idx_email_events_email_type
on public.email_events (email_type);

comment on column public.email_events.invite_id is 'Links vendor onboarding invite emails to vendor_onboarding_invites.';


-- ---- from 19_admin_storage_buckets.sql ----
-- Private storage for vendor KYC / identity documents.
-- Run after 12_storage_buckets.sql

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'vendor-identity-documents',
    'vendor-identity-documents',
    false,
    10485760,
    array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  )
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;


-- Enable RLS on admin portal tables
alter table public.profiles enable row level security;
alter table public.vendor_onboarding_invites enable row level security;
alter table public.vendor_onboarding_submissions enable row level security;
alter table public.vendor_identity_documents enable row level security;
alter table public.admin_audit_log enable row level security;

commit;