-- Fix It Right Garage — schema (Phase 1 core)
-- Run this in the Supabase SQL editor, or via `supabase db push`.

create extension if not exists pgcrypto;

-- ---------- enums ----------
do $$ begin
  create type user_role       as enum ('owner','advisor','mechanic','cashier');
exception when duplicate_object then null; end $$;
do $$ begin
  create type customer_type   as enum ('individual','company');
exception when duplicate_object then null; end $$;
do $$ begin
  create type job_status       as enum ('open','in_progress','waiting_parts','waiting_approval','done','billed','released','cancelled');
exception when duplicate_object then null; end $$;
do $$ begin
  create type item_kind        as enum ('labor','part','outsourced','misc');
exception when duplicate_object then null; end $$;
do $$ begin
  create type invoice_terms    as enum ('full','downpayment','installment');
exception when duplicate_object then null; end $$;
do $$ begin
  create type payment_method   as enum ('cash','gcash','maya','bank','check','other');
exception when duplicate_object then null; end $$;
do $$ begin
  create type movement_type    as enum ('purchase','issue_to_jo','return_from_jo','adjustment','sale');
exception when duplicate_object then null; end $$;
do $$ begin
  create type pay_basis        as enum ('daily','monthly');
exception when duplicate_object then null; end $$;
do $$ begin
  create type reminder_type    as enum ('payment_due','payment_overdue','next_service','follow_up_after_release','quotation_followup');
exception when duplicate_object then null; end $$;
do $$ begin
  create type reminder_status  as enum ('pending','sent','done','skipped');
exception when duplicate_object then null; end $$;

-- ---------- shared helpers ----------
create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end $$ language plpgsql;

-- sequential per-year document numbers (JO / INV / Q)
create table if not exists doc_counters (
  kind text not null,
  yr   int  not null,
  last int  not null default 0,
  primary key (kind, yr)
);

create or replace function generate_doc_no(p_kind text) returns text as $$
declare
  y int := extract(year from now())::int;
  n int;
begin
  insert into doc_counters(kind, yr, last) values (p_kind, y, 1)
    on conflict (kind, yr) do update set last = doc_counters.last + 1
    returning last into n;
  return p_kind || '-' || y::text || '-' || lpad(n::text, 4, '0');
end $$ language plpgsql;

-- ---------- profiles (mirrors auth.users) ----------
create table if not exists profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  name       text not null default 'Staff',
  role       user_role not null default 'advisor',
  active     boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- create a profile automatically when an auth user is created.
-- pass name/role in the user's metadata to control them.
create or replace function handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'advisor')
  )
  on conflict (id) do nothing;
  return new;
end $$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- role lookup used by RLS (security definer avoids recursion on profiles RLS)
create or replace function auth_role() returns user_role as $$
  select role from public.profiles where id = auth.uid();
$$ language sql stable security definer set search_path = public;

create or replace function is_staff() returns boolean as $$
  select exists (select 1 from public.profiles where id = auth.uid() and active);
$$ language sql stable security definer set search_path = public;

-- ---------- business tables ----------
create table if not exists customers (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  phone         text,
  messenger     text,
  email         text,
  address       text,
  type          customer_type not null default 'individual',
  notes         text,
  tags          text[] default '{}',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);

create table if not exists vehicles (
  id               uuid primary key default gen_random_uuid(),
  customer_id      uuid not null references customers(id) on delete cascade,
  plate_no         text,
  make             text,
  model            text,
  year             int,
  engine           text,
  transmission     text,
  color            text,
  current_odometer int,
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  deleted_at       timestamptz
);

create table if not exists job_orders (
  id                uuid primary key default gen_random_uuid(),
  jo_no             text unique not null default generate_doc_no('JO'),
  customer_id       uuid not null references customers(id),
  vehicle_id        uuid not null references vehicles(id),
  status            job_status not null default 'open',
  priority          text not null default 'normal',
  advisor_id        uuid references profiles(id),
  mechanic_id       uuid references profiles(id),
  customer_concern  text,
  findings          text,
  recommendations   text,
  odometer_in       int,
  promised_date     date,
  next_service_date date,
  next_service_km   int,
  next_service_note text,
  released_at       timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  deleted_at        timestamptz
);

create table if not exists parts (
  id            uuid primary key default gen_random_uuid(),
  sku           text,
  name          text not null,
  brand         text,
  part_no       text,
  category      text,
  unit          text default 'pc',
  cost_price    numeric(12,2) not null default 0,
  selling_price numeric(12,2) not null default 0,
  stock_qty     int not null default 0,
  min_stock     int not null default 0,
  location      text,
  active        boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);

create table if not exists jo_items (
  id                uuid primary key default gen_random_uuid(),
  jo_id             uuid not null references job_orders(id) on delete cascade,
  kind              item_kind not null default 'labor',
  description       text not null,
  part_id           uuid references parts(id),
  qty               numeric(12,2) not null default 1,
  unit_price        numeric(12,2) not null default 0,
  unit_cost         numeric(12,2) not null default 0,
  customer_supplied boolean not null default false,
  line_total        numeric(12,2) generated always as (qty * unit_price) stored,
  created_at        timestamptz not null default now()
);

create table if not exists invoices (
  id             uuid primary key default gen_random_uuid(),
  invoice_no     text unique not null default generate_doc_no('INV'),
  jo_id          uuid references job_orders(id),
  customer_id    uuid not null references customers(id),
  issued_at      date not null default current_date,
  due_date       date,
  terms          invoice_terms not null default 'full',
  subtotal       numeric(12,2) not null default 0,
  discount       numeric(12,2) not null default 0,
  vat_applicable boolean not null default false,
  is_void        boolean not null default false,
  or_number      text,
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table if not exists payments (
  id           uuid primary key default gen_random_uuid(),
  invoice_id   uuid not null references invoices(id) on delete cascade,
  paid_at      date not null default current_date,
  amount       numeric(12,2) not null,
  method       payment_method not null default 'cash',
  reference_no text,
  received_by  uuid references profiles(id),
  or_number    text,
  notes        text,
  created_at   timestamptz not null default now()
);

create table if not exists stock_movements (
  id         uuid primary key default gen_random_uuid(),
  part_id    uuid not null references parts(id) on delete cascade,
  type       movement_type not null,
  qty        int not null,
  unit_cost  numeric(12,2) not null default 0,
  ref_type   text,
  ref_id     uuid,
  note       text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists reminders (
  id              uuid primary key default gen_random_uuid(),
  type            reminder_type not null,
  customer_id     uuid references customers(id),
  vehicle_id      uuid references vehicles(id),
  invoice_id      uuid references invoices(id),
  jo_id           uuid references job_orders(id),
  due_at          date not null,
  status          reminder_status not null default 'pending',
  channel         text default 'sms',
  message_preview text,
  sent_at         timestamptz,
  sent_by         uuid references profiles(id),
  created_at      timestamptz not null default now()
);

create table if not exists employees (
  id             uuid primary key default gen_random_uuid(),
  profile_id     uuid references profiles(id),
  name           text not null,
  role           text not null default 'mechanic',
  basis          pay_basis not null default 'daily',
  rate           numeric(12,2) not null default 0,
  commission_pct numeric(5,2),
  active         boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table if not exists expenses (
  id           uuid primary key default gen_random_uuid(),
  date         date not null default current_date,
  category     text not null default 'misc',
  amount       numeric(12,2) not null,
  paid_via     text,
  note         text,
  receipt_path text,
  created_by   uuid references profiles(id),
  created_at   timestamptz not null default now()
);

create table if not exists message_templates (
  id        uuid primary key default gen_random_uuid(),
  key       text not null,
  language  text not null default 'tl',
  body      text not null,
  unique (key, language)
);

create table if not exists settings (
  key   text primary key,
  value jsonb not null
);

-- ---------- indexes ----------
create index if not exists idx_vehicles_customer on vehicles(customer_id);
create index if not exists idx_vehicles_plate on vehicles(plate_no);
create index if not exists idx_jo_customer on job_orders(customer_id);
create index if not exists idx_jo_status on job_orders(status);
create index if not exists idx_jo_mechanic on job_orders(mechanic_id);
create index if not exists idx_jo_items_jo on jo_items(jo_id);
create index if not exists idx_invoices_customer on invoices(customer_id);
create index if not exists idx_payments_invoice on payments(invoice_id);
create index if not exists idx_movements_part on stock_movements(part_id);
create index if not exists idx_reminders_due on reminders(due_at, status);

-- ---------- updated_at triggers ----------
do $$
declare t text;
begin
  foreach t in array array['profiles','customers','vehicles','job_orders','parts','invoices','employees']
  loop
    execute format('drop trigger if exists trg_updated_%1$s on %1$s;', t);
    execute format('create trigger trg_updated_%1$s before update on %1$s for each row execute function set_updated_at();', t);
  end loop;
end $$;

-- ---------- computed views ----------
create or replace view v_invoices with (security_invoker = true) as
  select
    i.*,
    round((i.subtotal - i.discount) * (case when i.vat_applicable then 1.12 else 1 end), 2) as total,
    coalesce((select sum(p.amount) from payments p where p.invoice_id = i.id), 0) as amount_paid,
    round((i.subtotal - i.discount) * (case when i.vat_applicable then 1.12 else 1 end)
      - coalesce((select sum(p.amount) from payments p where p.invoice_id = i.id), 0), 2) as balance,
    case
      when i.is_void then 'void'
      when round((i.subtotal - i.discount) * (case when i.vat_applicable then 1.12 else 1 end)
        - coalesce((select sum(p.amount) from payments p where p.invoice_id = i.id), 0), 2) <= 0.005 then 'paid'
      when coalesce((select sum(p.amount) from payments p where p.invoice_id = i.id), 0) > 0 then 'partial'
      else 'unpaid'
    end as status
  from invoices i;

create or replace view v_jo_totals with (security_invoker = true) as
  select jo_id, coalesce(sum(line_total), 0) as est_total
  from jo_items group by jo_id;
