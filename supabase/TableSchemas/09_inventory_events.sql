create table public.inventory_events (
  id uuid not null default gen_random_uuid(),
  product_id uuid null,
  product_variant_id uuid null,
  product_market_data_id uuid null,
  market_id uuid null,
  order_id uuid null,
  quantity_delta integer not null,
  change_type text not null,
  source text not null,
  notes text null,
  created_at timestamp with time zone not null default now(),
  constraint inventory_events_pkey primary key (id),
  constraint inventory_events_product_id_fkey foreign key (product_id) references public.products (id) on delete set null,
  constraint inventory_events_product_variant_id_fkey foreign key (product_variant_id) references public.product_variants (id) on delete set null,
  constraint inventory_events_product_market_data_id_fkey foreign key (product_market_data_id) references public.product_market_data (id) on delete set null,
  constraint inventory_events_market_id_fkey foreign key (market_id) references public.markets (id) on delete set null,
  constraint inventory_events_order_id_fkey foreign key (order_id) references public.orders (id) on delete set null,
  constraint inventory_events_change_type_valid check (change_type in ('stock_decrement', 'stock_increment', 'manual_adjustment', 'order_cancelled', 'refund_restock')),
  constraint inventory_events_source_valid check (source in ('online_checkout', 'admin_adjustment', 'import', 'cancellation', 'refund')),
  constraint inventory_events_quantity_delta_non_zero check (quantity_delta <> 0)
);

create index if not exists idx_inventory_events_product_id on public.inventory_events (product_id);
create index if not exists idx_inventory_events_product_variant_id on public.inventory_events (product_variant_id);
create index if not exists idx_inventory_events_product_market_data_id on public.inventory_events (product_market_data_id);
create index if not exists idx_inventory_events_market_id on public.inventory_events (market_id);
create index if not exists idx_inventory_events_order_id on public.inventory_events (order_id);
create index if not exists idx_inventory_events_created_at on public.inventory_events (created_at desc);
