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
