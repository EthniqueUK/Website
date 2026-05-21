create table public.product_market_data (
  id uuid not null default gen_random_uuid(),
  product_id uuid not null,
  product_variant_id uuid null,
  market_id uuid not null,
  price numeric(12, 2) not null,
  compare_at_price numeric(12, 2) null,
  cost_price numeric(12, 2) null,
  currency text not null,
  stock_quantity integer not null default 0,
  low_stock_threshold integer not null default 0,
  is_visible boolean not null default true,
  is_available boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint product_market_data_pkey primary key (id),
  constraint product_market_data_product_id_fkey foreign key (product_id) references public.products (id) on delete cascade,
  constraint product_market_data_product_variant_id_fkey foreign key (product_variant_id) references public.product_variants (id) on delete cascade,
  constraint product_market_data_market_id_fkey foreign key (market_id) references public.markets (id) on delete restrict,
  constraint product_market_data_currency_not_blank check (length(trim(currency)) > 0),
  constraint product_market_data_currency_uppercase check (currency = upper(currency)),
  constraint product_market_data_price_non_negative check (price >= 0),
  constraint product_market_data_compare_at_price_non_negative check (compare_at_price is null or compare_at_price >= 0),
  constraint product_market_data_cost_price_non_negative check (cost_price is null or cost_price >= 0),
  constraint product_market_data_stock_non_negative check (stock_quantity >= 0),
  constraint product_market_data_low_stock_non_negative check (low_stock_threshold >= 0)
);

create unique index if not exists ux_product_market_data_product_market
on public.product_market_data (product_id, market_id)
where product_variant_id is null;

create unique index if not exists ux_product_market_data_variant_market
on public.product_market_data (product_variant_id, market_id)
where product_variant_id is not null;

create index if not exists idx_product_market_data_product_id on public.product_market_data (product_id);
create index if not exists idx_product_market_data_variant_id on public.product_market_data (product_variant_id);
create index if not exists idx_product_market_data_market_id on public.product_market_data (market_id);
create index if not exists idx_product_market_data_market_visible on public.product_market_data (market_id, is_visible, is_available);
create index if not exists idx_product_market_data_stock on public.product_market_data (stock_quantity);

create trigger trg_product_market_data_updated_at
before update on public.product_market_data
for each row execute function public.set_updated_at();
