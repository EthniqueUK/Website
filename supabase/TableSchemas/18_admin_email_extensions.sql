-- Extend email_events for admin portal transactional emails.
-- Run after 11_email_events.sql

alter table public.email_events
  drop constraint if exists email_events_type_valid;

alter table public.email_events
  add constraint email_events_type_valid check (
    email_type = any (
      array[
        'admin_order_notification'::text,
        'customer_order_confirmation'::text,
        'customer_fulfillment'::text,
        'customer_cancellation'::text,
        'vendor_onboarding_invite'::text,
        'vendor_onboarding_submitted_admin'::text,
        'vendor_onboarding_submitted_vendor'::text,
        'vendor_onboarding_approved'::text,
        'vendor_onboarding_rejected'::text,
        'staff_user_invite'::text,
        'staff_mfa_reminder'::text
      ]
    )
  );

alter table public.email_events
  add column if not exists profile_id uuid null,
  add column if not exists invite_id uuid null,
  add column if not exists submission_id uuid null;

alter table public.email_events
  drop constraint if exists email_events_profile_id_fkey;

alter table public.email_events
  add constraint email_events_profile_id_fkey
  foreign key (profile_id) references public.profiles (id) on delete set null;

alter table public.email_events
  drop constraint if exists email_events_invite_id_fkey;

alter table public.email_events
  add constraint email_events_invite_id_fkey
  foreign key (invite_id) references public.vendor_onboarding_invites (id) on delete set null;

alter table public.email_events
  drop constraint if exists email_events_submission_id_fkey;

alter table public.email_events
  add constraint email_events_submission_id_fkey
  foreign key (submission_id) references public.vendor_onboarding_submissions (id) on delete set null;

create index if not exists idx_email_events_profile_id
on public.email_events (profile_id)
where profile_id is not null;

create index if not exists idx_email_events_invite_id
on public.email_events (invite_id)
where invite_id is not null;

create index if not exists idx_email_events_submission_id
on public.email_events (submission_id)
where submission_id is not null;

create index if not exists idx_email_events_email_type
on public.email_events (email_type);

comment on column public.email_events.invite_id is 'Links vendor onboarding invite emails to vendor_onboarding_invites.';
