create table public.order_items (
  id uuid not null default gen_random_uuid(),
  order_id uuid not null,
  product_id uuid null,
  product_variant_id uuid null,
  product_market_data_id uuid null,
  product_name_snapshot text not null,
  product_slug_snapshot text null,
  product_sku_snapshot text null,
  variant_snapshot jsonb null,
  unit_price_snapshot numeric(12, 2) not null,
  currency text not null,
  quantity integer not null,
  line_total numeric(12, 2) not null,
  created_at timestamp with time zone not null default now(),
  constraint order_items_pkey primary key (id),
  constraint order_items_order_id_fkey foreign key (order_id) references public.orders (id) on delete cascade,
  constraint order_items_product_id_fkey foreign key (product_id) references public.products (id) on delete set null,
  constraint order_items_product_variant_id_fkey foreign key (product_variant_id) references public.product_variants (id) on delete set null,
  constraint order_items_product_market_data_id_fkey foreign key (product_market_data_id) references public.product_market_data (id) on delete set null,
  constraint order_items_product_name_not_blank check (length(trim(product_name_snapshot)) > 0),
  constraint order_items_currency_not_blank check (length(trim(currency)) > 0),
  constraint order_items_currency_uppercase check (currency = upper(currency)),
  constraint order_items_quantity_positive check (quantity > 0),
  constraint order_items_unit_price_non_negative check (unit_price_snapshot >= 0),
  constraint order_items_line_total_non_negative check (line_total >= 0),
  constraint order_items_variant_snapshot_object check (variant_snapshot is null or jsonb_typeof(variant_snapshot) = 'object')
);

create index if not exists idx_order_items_order_id on public.order_items (order_id);
create index if not exists idx_order_items_product_id on public.order_items (product_id);
create index if not exists idx_order_items_product_variant_id on public.order_items (product_variant_id);
create index if not exists idx_order_items_product_market_data_id on public.order_items (product_market_data_id);
