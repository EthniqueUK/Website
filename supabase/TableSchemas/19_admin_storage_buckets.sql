-- Private storage for vendor KYC / identity documents.
-- Run after 12_storage_buckets.sql

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'vendor-identity-documents',
    'vendor-identity-documents',
    false,
    10485760,
    array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  )
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
