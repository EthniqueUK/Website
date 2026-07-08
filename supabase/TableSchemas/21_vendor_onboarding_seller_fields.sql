-- Mirror of 20260708_vendor_onboarding_seller_fields.sql
-- Run after 14_vendor_onboarding.sql

alter table public.profiles
  add column if not exists gender text null;

alter table public.profiles
  drop constraint if exists profiles_gender_check;

alter table public.profiles
  add constraint profiles_gender_check check (
    gender is null
    or gender = any (array['female'::text, 'male'::text, 'non_binary'::text, 'prefer_not_to_say'::text, 'other'::text])
  );

alter table public.vendor_onboarding_invites
  add column if not exists display_name text null,
  add column if not exists gender text null,
  add column if not exists phone text null;

alter table public.vendor_onboarding_invites
  drop constraint if exists vendor_onboarding_invites_gender_check;

alter table public.vendor_onboarding_invites
  add constraint vendor_onboarding_invites_gender_check check (
    gender is null
    or gender = any (array['female'::text, 'male'::text, 'non_binary'::text, 'prefer_not_to_say'::text, 'other'::text])
  );

alter table public.vendor_onboarding_submissions
  add column if not exists gender text null,
  add column if not exists display_name text null,
  add column if not exists terms_accepted_at timestamptz null,
  add column if not exists signature_data_url text null,
  add column if not exists identity_proof_deferred boolean not null default false,
  add column if not exists address_proof_deferred boolean not null default false;

alter table public.vendor_onboarding_submissions
  drop constraint if exists vendor_onboarding_submissions_gender_check;

alter table public.vendor_onboarding_submissions
  add constraint vendor_onboarding_submissions_gender_check check (
    gender is null
    or gender = any (array['female'::text, 'male'::text, 'non_binary'::text, 'prefer_not_to_say'::text, 'other'::text])
  );

alter table public.vendor_onboarding_submissions
  drop constraint if exists vendor_onboarding_submissions_terms_required;

alter table public.vendor_onboarding_submissions
  add constraint vendor_onboarding_submissions_terms_required check (
    terms_accepted_at is not null
  );

alter table public.vendor_onboarding_submissions
  drop constraint if exists vendor_onboarding_submissions_signature_required;

alter table public.vendor_onboarding_submissions
  add constraint vendor_onboarding_submissions_signature_required check (
    signature_data_url is not null and length(trim(signature_data_url)) > 0
  );

alter table public.vendor_identity_documents
  add column if not exists proof_category text null;

alter table public.vendor_identity_documents
  drop constraint if exists vendor_identity_documents_proof_category_check;

alter table public.vendor_identity_documents
  add constraint vendor_identity_documents_proof_category_check check (
    proof_category is null
    or proof_category = any (array['identity'::text, 'address'::text])
  );
