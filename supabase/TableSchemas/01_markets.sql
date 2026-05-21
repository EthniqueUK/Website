create table public.markets (
  id uuid not null default gen_random_uuid(),
  name text not null,
  code text not null,
  currency text not null,
  locale text not null default 'en-GB',
  country_code text not null default 'GB',
  is_default boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint markets_pkey primary key (id),
  constraint markets_code_key unique (code),
  constraint markets_code_not_blank check (length(trim(code)) > 0),
  constraint markets_currency_not_blank check (length(trim(currency)) > 0),
  constraint markets_name_not_blank check (length(trim(name)) > 0),
  constraint markets_country_code_not_blank check (length(trim(country_code)) > 0),
  constraint markets_currency_uppercase check (currency = upper(currency)),
  constraint markets_country_code_uppercase check (country_code = upper(country_code))
);

create unique index if not exists ux_markets_single_default
on public.markets (is_default)
where is_default = true;

create index if not exists idx_markets_is_active on public.markets (is_active);
create index if not exists idx_markets_sort_order on public.markets (sort_order);

create trigger trg_markets_updated_at
before update on public.markets
for each row execute function public.set_updated_at();

insert into public.markets (name, code, currency, locale, country_code, is_default, is_active, sort_order)
values
  ('United Kingdom', 'uk', 'GBP', 'en-GB', 'GB', true, true, 10),
  ('India', 'india', 'INR', 'en-IN', 'IN', false, false, 20)
on conflict (code) do nothing;
