-- Catalog taxonomy: flat garment categories + product department + marketing tags.
-- Prerequisite: ecommerce foundation (categories, products) + admin product extensions.

begin;

-- ---- products.department ----

alter table public.products
  add column if not exists department text null;

alter table public.products
  drop constraint if exists products_department_check;

alter table public.products
  add constraint products_department_check check (
    department is null
    or department = any (array['men'::text, 'women'::text, 'kids'::text])
  );

create index if not exists idx_products_department
on public.products (department)
where department is not null;

create index if not exists idx_products_department_category
on public.products (department, category_id)
where department is not null;

comment on column public.products.department is
  'Storefront audience: men | women | kids. Not a nested category.';

-- ---- tags ----

create table if not exists public.tags (
  id uuid not null default gen_random_uuid(),
  name text not null,
  slug text not null,
  kind text not null default 'marketing'::text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone('utc'::text, now()),
  constraint tags_pkey primary key (id),
  constraint tags_slug_key unique (slug),
  constraint tags_name_not_blank check (length(trim(name)) > 0),
  constraint tags_slug_not_blank check (length(trim(slug)) > 0),
  constraint tags_kind_check check (
    kind = any (array['marketing'::text, 'collection'::text])
  )
);

create index if not exists idx_tags_is_active on public.tags (is_active);
create index if not exists idx_tags_kind on public.tags (kind);
create index if not exists idx_tags_sort_order on public.tags (sort_order);

drop trigger if exists trg_tags_updated_at on public.tags;
create trigger trg_tags_updated_at
before update on public.tags
for each row execute function public.set_updated_at();

-- ---- product_tags ----

create table if not exists public.product_tags (
  product_id uuid not null,
  tag_id uuid not null,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  constraint product_tags_pkey primary key (product_id, tag_id),
  constraint product_tags_product_id_fkey foreign key (product_id)
    references public.products (id) on delete cascade,
  constraint product_tags_tag_id_fkey foreign key (tag_id)
    references public.tags (id) on delete cascade
);

create index if not exists idx_product_tags_tag_id on public.product_tags (tag_id);

-- ---- RLS ----

alter table public.tags enable row level security;
alter table public.product_tags enable row level security;

drop policy if exists "Public can read active tags" on public.tags;
create policy "Public can read active tags"
on public.tags
for select
to anon, authenticated
using (is_active = true);

drop policy if exists "Vendor or above can manage tags" on public.tags;
create policy "Vendor or above can manage tags"
on public.tags
for all
to authenticated
using (public.is_vendor_or_above())
with check (public.is_vendor_or_above());

drop policy if exists "Public can read product tags for active products" on public.product_tags;
create policy "Public can read product tags for active products"
on public.product_tags
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.products p
    where p.id = product_tags.product_id
      and p.is_active = true
  )
);

drop policy if exists "Staff can read product tags" on public.product_tags;
create policy "Staff can read product tags"
on public.product_tags
for select
to authenticated
using (
  exists (
    select 1
    from public.products p
    where p.id = product_tags.product_id
      and public.staff_can_access_product(p.market_id, p.vendor_id)
  )
);

drop policy if exists "Staff can manage product tags" on public.product_tags;
create policy "Staff can manage product tags"
on public.product_tags
for all
to authenticated
using (
  exists (
    select 1
    from public.products p
    where p.id = product_tags.product_id
      and public.staff_can_access_product(p.market_id, p.vendor_id)
  )
)
with check (
  exists (
    select 1
    from public.products p
    where p.id = product_tags.product_id
      and public.staff_can_access_product(p.market_id, p.vendor_id)
  )
);

-- ---- Seed flat garment categories (idempotent by slug) ----

insert into public.categories (name, slug, description, sort_order, is_active, parent_id)
values
  ('Kurta', 'kurta', 'Classic and contemporary kurtas', 10, true, null),
  ('Kurta Set', 'kurta-set', 'Coordinated kurta sets', 20, true, null),
  ('Anarkali', 'anarkali', 'Anarkali silhouettes', 30, true, null),
  ('Lehenga', 'lehenga', 'Lehengas for festive and bridal wear', 40, true, null),
  ('Saree', 'saree', 'Handwoven and designer sarees', 50, true, null),
  ('Suit', 'suit', 'Salwar suits and matching sets', 60, true, null),
  ('Sharara', 'sharara', 'Sharara sets', 70, true, null),
  ('Sherwani', 'sherwani', 'Sherwanis and formal menswear', 80, true, null),
  ('Indo-Western', 'indo-western', 'Indo-western fusion pieces', 90, true, null),
  ('Dupatta', 'dupatta', 'Dupattas and stoles', 100, true, null),
  ('Accessories', 'accessories', 'Ethnic accessories', 110, true, null)
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order,
  is_active = true,
  parent_id = null,
  updated_at = timezone('utc'::text, now());

-- ---- Seed marketing tags ----

insert into public.tags (name, slug, kind, sort_order, is_active)
values
  ('New Arrivals', 'new-arrivals', 'marketing', 10, true),
  ('Trending', 'trending', 'marketing', 20, true),
  ('Offers', 'offers', 'marketing', 30, true),
  ('Bestseller', 'bestseller', 'marketing', 40, true),
  ('Festive', 'festive', 'marketing', 50, true)
on conflict (slug) do update
set
  name = excluded.name,
  kind = excluded.kind,
  sort_order = excluded.sort_order,
  is_active = true,
  updated_at = timezone('utc'::text, now());

commit;
