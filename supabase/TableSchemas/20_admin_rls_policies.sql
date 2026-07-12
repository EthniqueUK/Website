-- Admin Portal and catalog RLS policies.
-- Run after 16_admin_rbac_functions.sql (includes staff_can_access_product).
-- Also used as source for supabase/migrations/20260703_admin_rls_policies.sql

-- ---- profiles ----

create policy "Users can read their own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy "Super admins can read all staff profiles"
on public.profiles
for select
to authenticated
using (
  public.is_super_admin()
  and role <> 'customer'::text
);

create policy "Vendors can read their managers"
on public.profiles
for select
to authenticated
using (
  public.is_vendor()
  and role = 'manager'::text
  and vendor_id = auth.uid()
  and market_id = public.current_profile_market_id()
);

create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Super admins can manage staff profiles"
on public.profiles
for all
to authenticated
using (
  public.is_super_admin()
  and role <> 'customer'::text
)
with check (
  public.is_super_admin()
  and role <> 'customer'::text
  and public.staff_can_manage_role(role)
);

create policy "Vendors can manage their managers"
on public.profiles
for all
to authenticated
using (
  public.is_vendor()
  and role = 'manager'::text
  and vendor_id = auth.uid()
)
with check (
  public.is_vendor()
  and role = 'manager'::text
  and vendor_id = auth.uid()
  and market_id = public.current_profile_market_id()
);

-- ---- vendor onboarding (super admin dashboard; public form uses service role) ----

create policy "Super admins can manage vendor onboarding invites"
on public.vendor_onboarding_invites
for all
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

create policy "Super admins can manage vendor onboarding submissions"
on public.vendor_onboarding_submissions
for all
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

create policy "Super admins can read vendor identity documents"
on public.vendor_identity_documents
for select
to authenticated
using (public.is_super_admin());

-- ---- admin audit log ----

create policy "Super admins can read all audit logs"
on public.admin_audit_log
for select
to authenticated
using (public.is_super_admin());

create policy "Staff can read audit logs for their market"
on public.admin_audit_log
for select
to authenticated
using (
  public.is_staff()
  and (
    public.is_super_admin()
    or market_id = public.current_profile_market_id()
    or market_id is null
  )
);

create policy "Staff can insert audit log entries"
on public.admin_audit_log
for insert
to authenticated
with check (
  public.is_staff()
  and actor_id = auth.uid()
);

-- ---- markets ----

alter table public.markets enable row level security;

create policy "Public can read active markets"
on public.markets
for select
to anon, authenticated
using (is_active = true);

create policy "Super admins can manage markets"
on public.markets
for all
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

-- ---- categories ----

alter table public.categories enable row level security;

create policy "Public can read active categories"
on public.categories
for select
to anon, authenticated
using (is_active = true);

create policy "Vendor or above can manage categories"
on public.categories
for all
to authenticated
using (public.is_vendor_or_above())
with check (public.is_vendor_or_above());

-- ---- tags ----

alter table public.tags enable row level security;

create policy "Public can read active tags"
on public.tags
for select
to anon, authenticated
using (is_active = true);

create policy "Vendor or above can manage tags"
on public.tags
for all
to authenticated
using (public.is_vendor_or_above())
with check (public.is_vendor_or_above());

-- ---- product_tags ----

alter table public.product_tags enable row level security;

create policy "Public can read product tags for active products"
on public.product_tags
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.products p
    where p.id = product_tags.product_id
      and p.is_active = true
  )
);

create policy "Staff can read product tags"
on public.product_tags
for select
to authenticated
using (
  exists (
    select 1
    from public.products p
    where p.id = product_tags.product_id
      and public.staff_can_access_product(p.market_id, p.vendor_id)
  )
);

create policy "Staff can manage product tags"
on public.product_tags
for all
to authenticated
using (
  exists (
    select 1
    from public.products p
    where p.id = product_tags.product_id
      and public.staff_can_access_product(p.market_id, p.vendor_id)
  )
)
with check (
  exists (
    select 1
    from public.products p
    where p.id = product_tags.product_id
      and public.staff_can_access_product(p.market_id, p.vendor_id)
  )
);

-- ---- products ----

alter table public.products enable row level security;

create policy "Public can read active products"
on public.products
for select
to anon, authenticated
using (is_active = true);

create policy "Staff can read accessible products"
on public.products
for select
to authenticated
using (public.staff_can_access_product(market_id, vendor_id));

create policy "Staff can insert accessible products"
on public.products
for insert
to authenticated
with check (
  public.is_super_admin()
  or (
    public.is_staff()
    and market_id is not null
    and public.staff_can_access_market(market_id)
    and (
      (public.is_vendor() and vendor_id = auth.uid())
      or (public.is_manager() and vendor_id = public.current_profile_vendor_id())
    )
  )
);

create policy "Staff can update accessible products"
on public.products
for update
to authenticated
using (public.staff_can_access_product(market_id, vendor_id))
with check (public.staff_can_access_product(market_id, vendor_id));

create policy "Vendor or above can delete accessible products"
on public.products
for delete
to authenticated
using (
  public.is_vendor_or_above()
  and public.staff_can_access_product(market_id, vendor_id)
);

-- ---- product_images ----

alter table public.product_images enable row level security;

create policy "Public can read product images"
on public.product_images
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.products p
    where p.id = product_images.product_id
      and p.is_active = true
  )
);

create policy "Staff can modify accessible product images"
on public.product_images
for all
to authenticated
using (
  exists (
    select 1
    from public.products p
    where p.id = product_images.product_id
      and public.staff_can_access_product(p.market_id, p.vendor_id)
  )
)
with check (
  exists (
    select 1
    from public.products p
    where p.id = product_images.product_id
      and public.staff_can_access_product(p.market_id, p.vendor_id)
  )
);

-- ---- product_variants ----

alter table public.product_variants enable row level security;

create policy "Public can read active product variants"
on public.product_variants
for select
to anon, authenticated
using (
  is_active = true
  and exists (
    select 1
    from public.products p
    where p.id = product_variants.product_id
      and p.is_active = true
  )
);

create policy "Staff can modify accessible product variants"
on public.product_variants
for all
to authenticated
using (
  exists (
    select 1
    from public.products p
    where p.id = product_variants.product_id
      and public.staff_can_access_product(p.market_id, p.vendor_id)
  )
)
with check (
  exists (
    select 1
    from public.products p
    where p.id = product_variants.product_id
      and public.staff_can_access_product(p.market_id, p.vendor_id)
  )
);

-- ---- product_market_data ----

alter table public.product_market_data enable row level security;

create policy "Public can read active product market data"
on public.product_market_data
for select
to anon, authenticated
using (
  is_visible = true
  and is_available = true
  and exists (
    select 1
    from public.products p
    where p.id = product_market_data.product_id
      and p.is_active = true
  )
  and exists (
    select 1
    from public.markets m
    where m.id = product_market_data.market_id
      and m.is_active = true
  )
);

create policy "Staff can read accessible product market data"
on public.product_market_data
for select
to authenticated
using (
  public.is_staff()
  and public.staff_can_access_market(market_id)
);

create policy "Staff can insert accessible product market data"
on public.product_market_data
for insert
to authenticated
with check (
  public.is_staff()
  and public.staff_can_access_market(market_id)
);

create policy "Staff can update accessible product market data"
on public.product_market_data
for update
to authenticated
using (
  public.is_staff()
  and public.staff_can_access_market(market_id)
)
with check (
  public.is_staff()
  and public.staff_can_access_market(market_id)
);

create policy "Vendor or above can delete accessible product market data"
on public.product_market_data
for delete
to authenticated
using (
  public.is_vendor_or_above()
  and public.staff_can_access_market(market_id)
);

-- ---- orders ----

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "Vendor or above can manage orders"
on public.orders
for all
to authenticated
using (public.is_vendor_or_above())
with check (public.is_vendor_or_above());

create policy "Vendor or above can manage order items"
on public.order_items
for all
to authenticated
using (public.is_vendor_or_above())
with check (public.is_vendor_or_above());

-- ---- checkout_settings ----

alter table public.checkout_settings enable row level security;

create policy "Super admins can manage checkout settings"
on public.checkout_settings
for all
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

-- ---- email_events ----

alter table public.email_events enable row level security;

create policy "Staff can read email events"
on public.email_events
for select
to authenticated
using (public.is_staff());

create policy "Staff can insert email events"
on public.email_events
for insert
to authenticated
with check (public.is_staff());

-- ---- storage: product-images ----

create policy "Public can read product images bucket"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'product-images');

create policy "Staff can upload product images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'product-images'
  and public.is_staff()
);

create policy "Staff can update product images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'product-images'
  and public.is_staff()
);

create policy "Vendor or above can delete product images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'product-images'
  and public.is_vendor_or_above()
);

-- ---- storage: category-images ----

create policy "Public can read category images bucket"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'category-images');

create policy "Staff can upload category images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'category-images'
  and public.is_staff()
);

create policy "Staff can update category images"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'category-images'
  and public.is_staff()
);

create policy "Vendor or above can delete category images"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'category-images'
  and public.is_vendor_or_above()
);

-- ---- storage: vendor-identity-documents (private KYC) ----

create policy "Super admins can read vendor identity document files"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'vendor-identity-documents'
  and public.is_super_admin()
);

-- Uploads during public onboarding use the service role (bypasses RLS).
