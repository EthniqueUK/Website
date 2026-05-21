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
