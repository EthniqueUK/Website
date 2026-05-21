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
