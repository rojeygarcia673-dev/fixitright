-- Fix It Right Garage — Row Level Security
-- Roles: owner (all), advisor (ops + money, no payroll/settings),
--        cashier (billing/payments), mechanic (own jobs only, no money).

alter table profiles         enable row level security;
alter table customers        enable row level security;
alter table vehicles         enable row level security;
alter table job_orders       enable row level security;
alter table jo_items         enable row level security;
alter table parts            enable row level security;
alter table invoices         enable row level security;
alter table payments         enable row level security;
alter table stock_movements  enable row level security;
alter table reminders        enable row level security;
alter table employees        enable row level security;
alter table expenses         enable row level security;
alter table message_templates enable row level security;
alter table settings         enable row level security;

-- ---------- profiles ----------
drop policy if exists profiles_select on profiles;
create policy profiles_select on profiles for select
  using (id = auth.uid() or auth_role() = 'owner');
drop policy if exists profiles_update_own on profiles;
create policy profiles_update_own on profiles for update
  using (auth_role() = 'owner') with check (auth_role() = 'owner');

-- ---------- customers / vehicles (all staff read; owner+advisor write) ----------
drop policy if exists customers_select on customers;
create policy customers_select on customers for select using (is_staff());
drop policy if exists customers_write on customers;
create policy customers_write on customers for all
  using (auth_role() in ('owner','advisor')) with check (auth_role() in ('owner','advisor'));

drop policy if exists vehicles_select on vehicles;
create policy vehicles_select on vehicles for select using (is_staff());
drop policy if exists vehicles_write on vehicles;
create policy vehicles_write on vehicles for all
  using (auth_role() in ('owner','advisor')) with check (auth_role() in ('owner','advisor'));

-- ---------- job_orders (mechanic sees only assigned) ----------
drop policy if exists jo_select on job_orders;
create policy jo_select on job_orders for select
  using (auth_role() in ('owner','advisor','cashier') or mechanic_id = auth.uid());
drop policy if exists jo_write on job_orders;
create policy jo_write on job_orders for all
  using (auth_role() in ('owner','advisor')) with check (auth_role() in ('owner','advisor'));
-- mechanic may update status/findings on their own jobs
drop policy if exists jo_mechanic_update on job_orders;
create policy jo_mechanic_update on job_orders for update
  using (mechanic_id = auth.uid()) with check (mechanic_id = auth.uid());

drop policy if exists jo_items_select on jo_items;
create policy jo_items_select on jo_items for select
  using (exists (select 1 from job_orders j where j.id = jo_items.jo_id
    and (auth_role() in ('owner','advisor','cashier') or j.mechanic_id = auth.uid())));
drop policy if exists jo_items_write on jo_items;
create policy jo_items_write on jo_items for all
  using (auth_role() in ('owner','advisor')) with check (auth_role() in ('owner','advisor'));

-- ---------- parts / stock (all staff read; owner+advisor write) ----------
drop policy if exists parts_select on parts;
create policy parts_select on parts for select using (is_staff());
drop policy if exists parts_write on parts;
create policy parts_write on parts for all
  using (auth_role() in ('owner','advisor')) with check (auth_role() in ('owner','advisor'));

drop policy if exists movements_select on stock_movements;
create policy movements_select on stock_movements for select using (is_staff());
drop policy if exists movements_write on stock_movements;
create policy movements_write on stock_movements for all
  using (auth_role() in ('owner','advisor')) with check (auth_role() in ('owner','advisor'));

-- ---------- invoices / payments (NO mechanic) ----------
drop policy if exists invoices_select on invoices;
create policy invoices_select on invoices for select
  using (auth_role() in ('owner','advisor','cashier'));
drop policy if exists invoices_write on invoices;
create policy invoices_write on invoices for all
  using (auth_role() in ('owner','advisor','cashier'))
  with check (auth_role() in ('owner','advisor','cashier'));

drop policy if exists payments_select on payments;
create policy payments_select on payments for select
  using (auth_role() in ('owner','advisor','cashier'));
drop policy if exists payments_write on payments;
create policy payments_write on payments for all
  using (auth_role() in ('owner','advisor','cashier'))
  with check (auth_role() in ('owner','advisor','cashier'));

-- ---------- reminders (all staff read; owner+advisor+cashier write) ----------
drop policy if exists reminders_select on reminders;
create policy reminders_select on reminders for select using (is_staff());
drop policy if exists reminders_write on reminders;
create policy reminders_write on reminders for all
  using (auth_role() in ('owner','advisor','cashier'))
  with check (auth_role() in ('owner','advisor','cashier'));

-- ---------- employees / expenses (owner; expenses also cashier) ----------
drop policy if exists employees_select on employees;
create policy employees_select on employees for select using (auth_role() = 'owner');
drop policy if exists employees_write on employees;
create policy employees_write on employees for all
  using (auth_role() = 'owner') with check (auth_role() = 'owner');

drop policy if exists expenses_select on expenses;
create policy expenses_select on expenses for select
  using (auth_role() in ('owner','cashier'));
drop policy if exists expenses_write on expenses;
create policy expenses_write on expenses for all
  using (auth_role() in ('owner','cashier')) with check (auth_role() in ('owner','cashier'));

-- ---------- settings / templates (all read; owner write) ----------
drop policy if exists settings_select on settings;
create policy settings_select on settings for select using (is_staff());
drop policy if exists settings_write on settings;
create policy settings_write on settings for all
  using (auth_role() = 'owner') with check (auth_role() = 'owner');

drop policy if exists templates_select on message_templates;
create policy templates_select on message_templates for select using (is_staff());
drop policy if exists templates_write on message_templates;
create policy templates_write on message_templates for all
  using (auth_role() = 'owner') with check (auth_role() = 'owner');
