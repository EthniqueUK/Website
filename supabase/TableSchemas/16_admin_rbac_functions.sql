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
