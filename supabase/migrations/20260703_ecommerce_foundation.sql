-- =========================================
-- Ecommerce foundation (TableSchemas 00-12)
-- Run this BEFORE 20260703_admin_portal_schema.sql
-- =========================================

begin;

-- ---- from 00_extensions_and_functions.sql ----
create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;


-- ---- from 01_markets.sql ----
create table public.markets (
  id uuid not null default gen_random_uuid(),
  name text not null,
  code text not null,
  currency text not null,
  locale text not null default 'en-GB',
  country_code text not null default 'GB',
  is_default boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint markets_pkey primary key (id),
  constraint markets_code_key unique (code),
  constraint markets_code_not_blank check (length(trim(code)) > 0),
  constraint markets_currency_not_blank check (length(trim(currency)) > 0),
  constraint markets_name_not_blank check (length(trim(name)) > 0),
  constraint markets_country_code_not_blank check (length(trim(country_code)) > 0),
  constraint markets_currency_uppercase check (currency = upper(currency)),
  constraint markets_country_code_uppercase check (country_code = upper(country_code))
);

create unique index if not exists ux_markets_single_default
on public.markets (is_default)
where is_default = true;

create index if not exists idx_markets_is_active on public.markets (is_active);
create index if not exists idx_markets_sort_order on public.markets (sort_order);

create trigger trg_markets_updated_at
before update on public.markets
for each row execute function public.set_updated_at();

insert into public.markets (name, code, currency, locale, country_code, is_default, is_active, sort_order)
values
  ('United Kingdom', 'uk', 'GBP', 'en-GB', 'GB', true, true, 10),
  ('India', 'india', 'INR', 'en-IN', 'IN', false, false, 20)
on conflict (code) do nothing;


-- ---- from 02_categories.sql ----
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


-- ---- from 03_products.sql ----
create table public.products (
  id uuid not null default gen_random_uuid(),
  category_id uuid not null,
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
  constraint products_attributes_object check (jsonb_typeof(attributes) = 'object')
);

create index if not exists idx_products_category_id on public.products (category_id);
create index if not exists idx_products_is_active on public.products (is_active);
create index if not exists idx_products_is_featured on public.products (is_featured);
create index if not exists idx_products_product_type on public.products (product_type);
create index if not exists idx_products_name on public.products (name);

create trigger trg_products_updated_at
before update on public.products
for each row execute function public.set_updated_at();


-- ---- from 04_product_variants.sql ----
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


-- ---- from 05_product_market_data.sql ----
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


-- ---- from 06_product_images.sql ----
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


-- ---- from 07_orders.sql ----
create table public.orders (
  id uuid not null default gen_random_uuid(),
  order_number text not null,
  market_id uuid not null,
  currency text not null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text null,
  shipping_address_line1 text not null,
  shipping_address_line2 text null,
  shipping_city text not null,
  shipping_county text null,
  shipping_postal_code text not null,
  shipping_country text not null default 'United Kingdom',
  billing_address_same_as_shipping boolean not null default true,
  billing_address jsonb null,
  customer_notes text null,
  status text not null default 'pending_payment',
  payment_status text not null default 'pending',
  payment_provider text not null default 'stripe',
  stripe_checkout_session_id text null,
  stripe_payment_intent_id text null,
  paid_at timestamp with time zone null,
  subtotal_amount numeric(12, 2) not null default 0,
  shipping_amount numeric(12, 2) not null default 0,
  discount_amount numeric(12, 2) not null default 0,
  tax_amount numeric(12, 2) not null default 0,
  total_amount numeric(12, 2) not null default 0,
  total_items integer not null default 0,
  email_status text not null default 'pending',
  customer_confirmation_sent_at timestamp with time zone null,
  admin_notification_sent_at timestamp with time zone null,
  fulfillment_status text not null default 'unfulfilled',
  tracking_number text null,
  tracking_url text null,
  shipping_carrier text null,
  fulfilled_at timestamp with time zone null,
  cancellation_reason text null,
  cancelled_at timestamp with time zone null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint orders_pkey primary key (id),
  constraint orders_order_number_key unique (order_number),
  constraint orders_market_id_fkey foreign key (market_id) references public.markets (id) on delete restrict,
  constraint orders_currency_not_blank check (length(trim(currency)) > 0),
  constraint orders_currency_uppercase check (currency = upper(currency)),
  constraint orders_customer_name_not_blank check (length(trim(customer_name)) > 0),
  constraint orders_customer_email_not_blank check (length(trim(customer_email)) > 0),
  constraint orders_shipping_address_line1_not_blank check (length(trim(shipping_address_line1)) > 0),
  constraint orders_shipping_city_not_blank check (length(trim(shipping_city)) > 0),
  constraint orders_shipping_postal_code_not_blank check (length(trim(shipping_postal_code)) > 0),
  constraint orders_status_valid check (status in ('pending_payment', 'paid', 'processing', 'fulfilled', 'cancelled', 'refunded')),
  constraint orders_payment_status_valid check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  constraint orders_payment_provider_valid check (payment_provider = 'stripe'),
  constraint orders_email_status_valid check (email_status in ('pending', 'sent', 'failed')),
  constraint orders_fulfillment_status_valid check (fulfillment_status in ('unfulfilled', 'processing', 'fulfilled', 'cancelled')),
  constraint orders_amounts_non_negative check (
    subtotal_amount >= 0 and shipping_amount >= 0 and discount_amount >= 0 and tax_amount >= 0 and total_amount >= 0
  ),
  constraint orders_total_items_non_negative check (total_items >= 0),
  constraint orders_billing_address_object check (billing_address is null or jsonb_typeof(billing_address) = 'object')
);

create index if not exists idx_orders_market_id on public.orders (market_id);
create index if not exists idx_orders_order_number on public.orders (order_number);
create index if not exists idx_orders_customer_email on public.orders (customer_email);
create index if not exists idx_orders_status on public.orders (status);
create index if not exists idx_orders_payment_status on public.orders (payment_status);
create index if not exists idx_orders_fulfillment_status on public.orders (fulfillment_status);
create index if not exists idx_orders_created_at on public.orders (created_at desc);
create index if not exists idx_orders_stripe_checkout_session_id on public.orders (stripe_checkout_session_id);
create index if not exists idx_orders_stripe_payment_intent_id on public.orders (stripe_payment_intent_id);

create trigger trg_orders_updated_at
before update on public.orders
for each row execute function public.set_updated_at();


-- ---- from 08_order_items.sql ----
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


-- ---- from 09_inventory_events.sql ----
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


-- ---- from 10_checkout_settings.sql ----
create table public.checkout_settings (
  id text not null default 'default',
  default_market_id uuid null,
  order_notification_emails text[] not null default '{}'::text[],
  from_email text null,
  admin_email_subject text not null default 'New Ethnique online order: {{order_number}}',
  admin_email_template text not null default 'New online order {{order_number}} from {{customer_name}}.

Customer email: {{customer_email}}
Customer phone: {{customer_phone}}
Shipping address:
{{shipping_address}}

Items:
{{order_lines}}

Order total: {{order_total}}',
  customer_email_subject text not null default 'Ethnique order confirmation: {{order_number}}',
  customer_email_template text not null default 'Dear {{customer_name}},

Thank you for your Ethnique order.

Order reference: {{order_number}}

Items:
{{order_lines}}

Order total: {{order_total}}

We will email you again when your order is on its way.',
  stripe_success_url text null,
  stripe_cancel_url text null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint checkout_settings_pkey primary key (id),
  constraint checkout_settings_default_market_id_fkey foreign key (default_market_id) references public.markets (id) on delete set null,
  constraint checkout_settings_singleton_check check (id = 'default')
);

create trigger trg_checkout_settings_updated_at
before update on public.checkout_settings
for each row execute function public.set_updated_at();

insert into public.checkout_settings (id)
values ('default')
on conflict (id) do nothing;


-- ---- from 11_email_events.sql ----
create table public.email_events (
  id uuid not null default gen_random_uuid(),
  order_id uuid null,
  recipient_email text not null,
  email_type text not null,
  provider text not null default 'resend',
  provider_message_id text null,
  status text not null default 'pending',
  error_message text null,
  sent_at timestamp with time zone null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint email_events_pkey primary key (id),
  constraint email_events_order_id_fkey foreign key (order_id) references public.orders (id) on delete set null,
  constraint email_events_recipient_email_not_blank check (length(trim(recipient_email)) > 0),
  constraint email_events_type_valid check (email_type in ('admin_order_notification', 'customer_order_confirmation', 'customer_fulfillment', 'customer_cancellation')),
  constraint email_events_provider_valid check (provider = 'resend'),
  constraint email_events_status_valid check (status in ('pending', 'sent', 'failed'))
);

create index if not exists idx_email_events_order_id on public.email_events (order_id);
create index if not exists idx_email_events_recipient_email on public.email_events (recipient_email);
create index if not exists idx_email_events_status on public.email_events (status);
create index if not exists idx_email_events_created_at on public.email_events (created_at desc);

create trigger trg_email_events_updated_at
before update on public.email_events
for each row execute function public.set_updated_at();


-- ---- from 12_storage_buckets.sql ----
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'product-images',
    'product-images',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
  ),
  (
    'category-images',
    'category-images',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
  )
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;


commit;