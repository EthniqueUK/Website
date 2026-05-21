create table public.categories (
  id uuid not null default gen_random_uuid(),
  parent_id uuid null,
  name text not null,
  slug text not null,
  description text null,
  image_path text null,
  image_alt text null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint categories_pkey primary key (id),
  constraint categories_slug_key unique (slug),
  constraint categories_parent_id_fkey foreign key (parent_id) references public.categories (id) on delete set null,
  constraint categories_name_not_blank check (length(trim(name)) > 0),
  constraint categories_slug_not_blank check (length(trim(slug)) > 0),
  constraint categories_not_own_parent check (parent_id is null or parent_id <> id)
);

create index if not exists idx_categories_parent_id on public.categories (parent_id);
create index if not exists idx_categories_is_active on public.categories (is_active);
create index if not exists idx_categories_sort_order on public.categories (sort_order);

create trigger trg_categories_updated_at
before update on public.categories
for each row execute function public.set_updated_at();
