-- Vendor MFA is optional; only super_admin requires TOTP by default.

create or replace function public.set_profile_totp_required()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role = 'super_admin' then
    new.totp_required := true;
  elsif new.role in ('vendor', 'manager') then
    new.totp_required := coalesce(new.totp_required, false);
  else
    new.totp_required := false;
  end if;

  return new;
end;
$$;

-- Existing vendors approved with mandatory MFA can remain enrolled; clear the flag for new logins.
update public.profiles
set totp_required = false
where role = 'vendor'
  and totp_required = true;
