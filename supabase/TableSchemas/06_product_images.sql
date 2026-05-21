create table public.product_images (
  id uuid not null default gen_random_uuid(),
  product_id uuid not null,
  storage_path text not null,
  alt_text text null,
  width integer null,
  height integer null,
  sort_order integer not null default 0,
  is_primary boolean not null default false,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint product_images_pkey primary key (id),
  constraint product_images_product_id_fkey foreign key (product_id) references public.products (id) on delete cascade,
  constraint product_images_storage_path_not_blank check (length(trim(storage_path)) > 0),
  constraint product_images_width_positive check (width is null or width > 0),
  constraint product_images_height_positive check (height is null or height > 0)
);

create index if not exists idx_product_images_product_id on public.product_images (product_id);
create index if not exists idx_product_images_sort_order on public.product_images (sort_order);
create index if not exists idx_product_images_primary on public.product_images (product_id, is_primary);

create unique index if not exists ux_product_images_one_primary_per_product
on public.product_images (product_id)
where is_primary = true;

create trigger trg_product_images_updated_at
before update on public.product_images
for each row execute function public.set_updated_at();
