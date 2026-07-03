-- Vendor onboarding: invites, submissions, and identity documents.
-- Run after 13_admin_profiles.sql

create table public.vendor_onboarding_invites (
  id uuid not null default gen_random_uuid(),
  email text not null,
  market_id uuid not null,
  token_hash text not null,
  invited_by uuid not null,
  expires_at timestamp with time zone not null,
  status text not null default 'pending'::text,
  completed_at timestamp with time zone null,
  revoked_at timestamp with time zone null,
  revoked_by uuid null,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone('utc'::text, now()),
  constraint vendor_onboarding_invites_pkey primary key (id),
  constraint vendor_onboarding_invites_market_id_fkey foreign key (market_id) references public.markets (id) on delete restrict,
  constraint vendor_onboarding_invites_invited_by_fkey foreign key (invited_by) references public.profiles (id) on delete restrict,
  constraint vendor_onboarding_invites_revoked_by_fkey foreign key (revoked_by) references public.profiles (id) on delete set null,
  constraint vendor_onboarding_invites_email_not_blank check (length(trim(email)) > 0),
  constraint vendor_onboarding_invites_token_hash_not_blank check (length(trim(token_hash)) > 0),
  constraint vendor_onboarding_invites_status_check check (
    status = any (array['pending'::text, 'completed'::text, 'expired'::text, 'revoked'::text])
  ),
  constraint vendor_onboarding_invites_expires_after_created check (expires_at > created_at)
);

create unique index if not exists ux_vendor_invites_token_hash
on public.vendor_onboarding_invites (token_hash);

create index if not exists idx_vendor_invites_email_lower
on public.vendor_onboarding_invites (lower(trim(email)));

create index if not exists idx_vendor_invites_market_id
on public.vendor_onboarding_invites (market_id);

create index if not exists idx_vendor_invites_status
on public.vendor_onboarding_invites (status);

create index if not exists idx_vendor_invites_expires_at
on public.vendor_onboarding_invites (expires_at)
where status = 'pending'::text;

create trigger trg_vendor_onboarding_invites_updated_at
before update on public.vendor_onboarding_invites
for each row execute function public.set_updated_at();

create table public.vendor_onboarding_submissions (
  id uuid not null default gen_random_uuid(),
  invite_id uuid not null,
  profile_id uuid null,
  legal_name text not null,
  phone text not null,
  address_line1 text not null,
  address_line2 text null,
  city text not null,
  state_region text null,
  postal_code text not null,
  country_code text not null,
  status text not null default 'submitted'::text,
  submitted_at timestamp with time zone not null default timezone('utc'::text, now()),
  reviewed_by uuid null,
  reviewed_at timestamp with time zone null,
  rejection_reason text null,
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone('utc'::text, now()),
  constraint vendor_onboarding_submissions_pkey primary key (id),
  constraint vendor_onboarding_submissions_invite_id_key unique (invite_id),
  constraint vendor_onboarding_submissions_invite_id_fkey foreign key (invite_id) references public.vendor_onboarding_invites (id) on delete restrict,
  constraint vendor_onboarding_submissions_profile_id_fkey foreign key (profile_id) references public.profiles (id) on delete set null,
  constraint vendor_onboarding_submissions_reviewed_by_fkey foreign key (reviewed_by) references public.profiles (id) on delete set null,
  constraint vendor_onboarding_submissions_legal_name_not_blank check (length(trim(legal_name)) > 0),
  constraint vendor_onboarding_submissions_phone_not_blank check (length(trim(phone)) > 0),
  constraint vendor_onboarding_submissions_address_not_blank check (length(trim(address_line1)) > 0),
  constraint vendor_onboarding_submissions_city_not_blank check (length(trim(city)) > 0),
  constraint vendor_onboarding_submissions_postal_code_not_blank check (length(trim(postal_code)) > 0),
  constraint vendor_onboarding_submissions_country_code_not_blank check (length(trim(country_code)) > 0),
  constraint vendor_onboarding_submissions_country_code_uppercase check (country_code = upper(country_code)),
  constraint vendor_onboarding_submissions_status_check check (
    status = any (array['submitted'::text, 'approved'::text, 'rejected'::text])
  ),
  constraint vendor_onboarding_submissions_rejection_reason_when_rejected check (
    status <> 'rejected'::text
    or (rejection_reason is not null and length(trim(rejection_reason)) > 0)
  )
);

create index if not exists idx_vendor_submissions_status
on public.vendor_onboarding_submissions (status);

create index if not exists idx_vendor_submissions_submitted_at
on public.vendor_onboarding_submissions (submitted_at desc);

create index if not exists idx_vendor_submissions_profile_id
on public.vendor_onboarding_submissions (profile_id)
where profile_id is not null;

create trigger trg_vendor_onboarding_submissions_updated_at
before update on public.vendor_onboarding_submissions
for each row execute function public.set_updated_at();

create table public.vendor_identity_documents (
  id uuid not null default gen_random_uuid(),
  submission_id uuid not null,
  document_type text not null,
  storage_path text not null,
  original_filename text null,
  mime_type text null,
  file_size_bytes integer null,
  uploaded_at timestamp with time zone not null default timezone('utc'::text, now()),
  created_at timestamp with time zone not null default timezone('utc'::text, now()),
  constraint vendor_identity_documents_pkey primary key (id),
  constraint vendor_identity_documents_submission_id_fkey foreign key (submission_id) references public.vendor_onboarding_submissions (id) on delete cascade,
  constraint vendor_identity_documents_storage_path_not_blank check (length(trim(storage_path)) > 0),
  constraint vendor_identity_documents_document_type_check check (
    document_type = any (
      array[
        'passport'::text,
        'driving_licence'::text,
        'utility_bill'::text,
        'aadhar'::text
      ]
    )
  ),
  constraint vendor_identity_documents_file_size_non_negative check (
    file_size_bytes is null
    or file_size_bytes >= 0
  )
);

create index if not exists idx_vendor_identity_documents_submission_id
on public.vendor_identity_documents (submission_id);

create index if not exists idx_vendor_identity_documents_document_type
on public.vendor_identity_documents (document_type);

comment on table public.vendor_onboarding_invites is 'Single-use onboarding links sent to prospective vendors. Token stored as hash only.';
comment on column public.vendor_onboarding_invites.expires_at is 'Invite expiry (7 calendar days from creation, set by application layer).';
comment on table public.vendor_identity_documents is 'KYC uploads. UK: passport, driving_licence, utility_bill. India: aadhar. Validated in application layer by market.';
