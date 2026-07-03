-- Admin activity audit trail. All timestamps stored in UTC.
-- Run after 13_admin_profiles.sql

create table public.admin_audit_log (
  id uuid not null default gen_random_uuid(),
  actor_id uuid null,
  actor_email text not null,
  actor_role text not null,
  market_id uuid null,
  action text not null,
  entity_type text not null,
  entity_id text null,
  summary text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  constraint admin_audit_log_pkey primary key (id),
  constraint admin_audit_log_actor_id_fkey foreign key (actor_id) references public.profiles (id) on delete set null,
  constraint admin_audit_log_market_id_fkey foreign key (market_id) references public.markets (id) on delete set null,
  constraint admin_audit_log_actor_email_not_blank check (length(trim(actor_email)) > 0),
  constraint admin_audit_log_actor_role_not_blank check (length(trim(actor_role)) > 0),
  constraint admin_audit_log_action_not_blank check (length(trim(action)) > 0),
  constraint admin_audit_log_entity_type_not_blank check (length(trim(entity_type)) > 0),
  constraint admin_audit_log_summary_not_blank check (length(trim(summary)) > 0),
  constraint admin_audit_log_metadata_object check (jsonb_typeof(metadata) = 'object')
);

create index if not exists idx_audit_actor_email
on public.admin_audit_log using btree (lower(trim(actor_email)));

create index if not exists idx_audit_created_at
on public.admin_audit_log using btree (created_at desc);

create index if not exists idx_audit_market_id
on public.admin_audit_log using btree (market_id)
where market_id is not null;

create index if not exists idx_audit_market_created_at
on public.admin_audit_log using btree (market_id, created_at desc)
where market_id is not null;

create index if not exists idx_audit_action
on public.admin_audit_log using btree (action);

create index if not exists idx_audit_entity
on public.admin_audit_log using btree (entity_type, entity_id);

comment on table public.admin_audit_log is 'Meaningful admin actions only. Display layer converts created_at from UTC to browser timezone.';
comment on column public.admin_audit_log.metadata is 'Optional structured context, e.g. changed_fields, previous_status, invite_id.';
