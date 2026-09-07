-- Fix It Right Garage — seed reference + sample data.
-- Run AFTER 0001_schema.sql and 0002_policies.sql, in the Supabase SQL editor
-- (the SQL editor runs as the postgres role and bypasses RLS).
--
-- NOTE: staff accounts are created via Supabase Auth (dashboard or API), not here.
-- See README "Create the first users". Sample business data below has no auth links.

-- ---------- settings ----------
insert into settings(key, value) values
  ('shop', '{"name":"Fix It Right Garage","address":"Picas-San Jose, DZR Airport Rd, Tacloban City, Leyte","phone":"+63 954 164 3935","facebook":"facebook.com/fixitrightgarage"}'),
  ('vat', '{"enabled":true,"rate":0.12}'),
  ('terms', '{"default":"downpayment","downpayment_pct":50,"balance_days":15}'),
  ('next_service', '{"interval_km":5000,"interval_months":6}')
on conflict (key) do update set value = excluded.value;

-- ---------- message templates (bilingual) ----------
insert into message_templates(key, language, body) values
  ('payment_due','tl','Hi {{name}}, paalala lang po mula sa {{shop}}: may balance po kayong PHP {{amount}} para sa {{vehicle}} ({{plate}}), due sa {{due_date}}. Pwede po magbayad via cash, GCash, o Maya. Salamat po!'),
  ('payment_due','en','Hi {{name}}, a reminder from {{shop}}: you have a balance of PHP {{amount}} for {{vehicle}} ({{plate}}), due on {{due_date}}. You may pay via cash, GCash or Maya. Thank you!'),
  ('payment_overdue','tl','Hi {{name}}, {{shop}} po ito. Overdue na po ang balance na PHP {{amount}} para sa {{plate}} (due {{due_date}}). Paki-settle po sa lalong madaling panahon o tawagan kami sa {{shop_phone}}. Salamat!'),
  ('payment_overdue','en','Hi {{name}}, this is {{shop}}. Your balance of PHP {{amount}} for {{plate}} (due {{due_date}}) is overdue. Please settle soon or call us at {{shop_phone}}. Thank you!'),
  ('next_service','tl','Hi {{name}}! Malapit na po ang next {{service}} ng {{vehicle}} ({{plate}}). Mag-book na po para sure ang slot: {{shop_phone}}. - {{shop}}'),
  ('next_service','en','Hi {{name}}! The next {{service}} for {{vehicle}} ({{plate}}) is coming up. Book now to reserve a slot: {{shop_phone}}. - {{shop}}'),
  ('follow_up_after_release','tl','Hi {{name}}, kumusta po ang {{vehicle}} after ng service? Kung may concern, message lang po. Pwede rin po mag-rate dito: {{feedback_link}} - {{shop}}'),
  ('follow_up_after_release','en','Hi {{name}}, how is {{vehicle}} after the service? If you have any concern, just message us. You can also rate us here: {{feedback_link}} - {{shop}}'),
  ('quotation_followup','tl','Hi {{name}}, follow-up lang po sa quotation namin para sa {{plate}}. May tanong po ba kayo? - {{shop}}'),
  ('quotation_followup','en','Hi {{name}}, just following up on our quotation for {{plate}}. Do you have any questions? - {{shop}}')
on conflict (key, language) do update set body = excluded.body;

-- ---------- sample customers + vehicles ----------
insert into customers(id, name, phone, type, address) values
  ('11111111-1111-1111-1111-111111111111','Ramon Dela Cruz','+639541234567','individual','Brgy. Abucay, Tacloban City'),
  ('22222222-2222-2222-2222-222222222222','Grace Lim','+639182223344','individual','Brgy. Sagkahan, Tacloban City'),
  ('33333333-3333-3333-3333-333333333333','Jomar Bautista','+639173334455','individual','Palo, Leyte'),
  ('44444444-4444-4444-4444-444444444444','Leyte Farms Inc.','+639209876543','company','Sto. Nino St, Tacloban City')
on conflict (id) do nothing;

insert into vehicles(id, customer_id, plate_no, make, model, year, engine, transmission, current_odometer) values
  ('a1111111-1111-1111-1111-111111111111','11111111-1111-1111-1111-111111111111','ABC 1234','Toyota','Hilux',2019,'1GD','MT',92000),
  ('a2222222-2222-2222-2222-222222222222','22222222-2222-2222-2222-222222222222','XYZ 8890','Honda','City',2020,'L15','CVT',41000),
  ('a3333333-3333-3333-3333-333333333333','33333333-3333-3333-3333-333333333333','DEF 4412','Isuzu','MU-X',2018,'4JJ1','AT',88000),
  ('a4444444-4444-4444-4444-444444444444','44444444-4444-4444-4444-444444444444','GHI 7781','Mitsubishi','Montero',2017,'4N15','AT',120000)
on conflict (id) do nothing;

-- ---------- sample parts ----------
insert into parts(name, brand, category, cost_price, selling_price, stock_qty, min_stock) values
  ('Oil filter','Toyota','Filters',280,450,2,5),
  ('Brake pad set (front)','Hilux','Brakes',1600,2400,1,4),
  ('Fuel filter','Common-rail diesel','Filters',620,950,3,6),
  ('ATF fluid (4L)','Isuzu','Fluids',950,1400,2,5),
  ('Engine oil (6L)','Diesel 15W-40','Fluids',1900,2700,12,6),
  ('Injector (reconditioned)','YS23','Fuel system',5200,6500,0,2)
on conflict do nothing;

-- ---------- sample employees (payroll) ----------
insert into employees(name, role, basis, rate) values
  ('Boy Mendoza','mechanic','daily',650),
  ('Jun Pagara','mechanic','daily',600),
  ('Nonoy Adona','mechanic','daily',550),
  ('Dodong Reyes','helper','daily',450),
  ('Ana Villanueva','advisor','monthly',18000),
  ('Liza Reyes','cashier','monthly',14000)
on conflict do nothing;

-- ---------- sample expenses (current month) ----------
insert into expenses(date, category, amount, note) values
  (date_trunc('month', current_date)::date + 0,  'rent', 15000, 'Shop rent'),
  (date_trunc('month', current_date)::date + 2,  'utilities', 4200, 'Electricity & water'),
  (date_trunc('month', current_date)::date + 4,  'tools', 2800, 'Shop tools & consumables')
on conflict do nothing;
