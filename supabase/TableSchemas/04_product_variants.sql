create table public.product_variants (
  id uuid not null default gen_random_uuid(),
  product_id uuid not null,
  name text not null,
  sku text null,
  option_values jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint product_variants_pkey primary key (id),
  constraint product_variants_product_id_fkey foreign key (product_id) references public.products (id) on delete cascade,
  constraint product_variants_sku_key unique (sku),
  constraint product_variants_name_not_blank check (length(trim(name)) > 0),
  constraint product_variants_option_values_object check (jsonb_typeof(option_values) = 'object')
);

create index if not exists idx_product_variants_product_id on public.product_variants (product_id);
create index if not exists idx_product_variants_is_active on public.product_variants (is_active);
create index if not exists idx_product_variants_sort_order on public.product_variants (sort_order);

create trigger trg_product_variants_updated_at
before update on public.product_variants
for each row execute function public.set_updated_at();
