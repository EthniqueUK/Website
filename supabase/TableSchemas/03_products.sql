create table public.products (
  id uuid not null default gen_random_uuid(),
  category_id uuid not null,
  department text null,
  name text not null,
  slug text not null,
  short_description text null,
  description text null,
  sku text null,
  product_type text null,
  material text null,
  care_instructions text null,
  attributes jsonb not null default '{}'::jsonb,
  is_featured boolean not null default false,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint products_pkey primary key (id),
  constraint products_category_id_fkey foreign key (category_id) references public.categories (id) on delete restrict,
  constraint products_slug_key unique (slug),
  constraint products_sku_key unique (sku),
  constraint products_name_not_blank check (length(trim(name)) > 0),
  constraint products_slug_not_blank check (length(trim(slug)) > 0),
  constraint products_attributes_object check (jsonb_typeof(attributes) = 'object'),
  constraint products_department_check check (
    department is null
    or department = any (array['men'::text, 'women'::text, 'kids'::text])
  )
);

create index if not exists idx_products_category_id on public.products (category_id);
create index if not exists idx_products_department on public.products (department) where department is not null;
create index if not exists idx_products_department_category on public.products (department, category_id) where department is not null;
create index if not exists idx_products_is_active on public.products (is_active);
create index if not exists idx_products_is_featured on public.products (is_featured);
create index if not exists idx_products_product_type on public.products (product_type);
create index if not exists idx_products_name on public.products (name);

create trigger trg_products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

comment on column public.products.department is 'Storefront audience: men | women | kids. Not a nested category.';
