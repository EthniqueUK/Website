-- Catalog taxonomy extensions: tags, product_tags, product department.
-- Run after 03_products.sql. Keep categories flat (parent_id null) for garment types.

create table public.tags (
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

create trigger trg_tags_updated_at
before update on public.tags
for each row execute function public.set_updated_at();

create table public.product_tags (
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

comment on table public.tags is 'Marketing and collection labels (New Arrivals, Trending, Offers). Not garment categories.';
comment on table public.product_tags is 'Many-to-many link between products and tags.';
comment on table public.categories is 'Flat garment types only (Kurta, Lehenga, Saree…). Keep parent_id null for v1.';
