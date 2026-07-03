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
