# PROGRESS

## Decisions made (defaults — change if needed)
- **VAT:** registered → VAT support on (12%), stored in `settings.vat`. Invoices carry `vat_applicable`.
- **Numbering:** starts fresh at `-0001` per year via `generate_doc_no()` (JO / INV / Q).
- **Default terms:** 50% downpayment, 15-day balance (`settings.terms`).
- **Parts:** sample list seeded; import real list later.
- **Language:** UI English; customer message templates Tagalog + English (no Waray).
- **Primary user:** service advisor; **mechanics:** daily rate, own phones.

## Done
- [x] Phase 0 — Next.js 15 + TS + Tailwind scaffold, env handling
- [x] Supabase schema: profiles, customers, vehicles, job_orders, jo_items, parts,
      invoices, payments, stock_movements, reminders, employees, expenses,
      settings, message_templates; doc-number function; updated_at triggers; views
      `v_invoices`, `v_jo_totals`
- [x] Row Level Security for all tables (owner/advisor/cashier/mechanic)
- [x] Auth: email/password, `handle_new_user` trigger → profiles, middleware gate,
      role-based nav, sign in / sign out
- [x] Dashboard (live KPIs + board + low stock; mechanic "my tasks" variant)
- [x] Customers: list, detail (vehicles + job history + balance), create (Zod-validated)
- [x] Job Orders: list with status/mechanic/est-total
- [x] Billing: receivables with aging + KPI tiles
- [x] Inventory: parts list + tiles
- [x] Payroll: employee list (owner-only)
- [x] Seed: settings, bilingual templates, sample customers/vehicles/parts/employees

## Next (wire onto existing data layer)
- [ ] Job detail: items add/remove, status/mechanic change, issue-part-from-stock
- [ ] Quotations → convert to Job Order
- [ ] Invoicing: generate invoice from JO (VAT), record payment, invoice print
- [ ] Inventory: receive / adjust / issue movements, part detail + stock card
- [ ] Reminders queue: auto-generate from due invoices + next-service; mark sent
- [ ] Reports: monthly sales, collections-by-method, sales-by-type, top customers, P&L
- [ ] Payroll runs + printable payslips; attendance
- [ ] Settings screens (shop info, VAT, templates), audit log
- [ ] Phase 3: automated SMS via Semaphore (Edge Function + pg_cron)

## Notes
- I could not run `npm install` / the dev server in the authoring environment
  (no Node there). First run may surface a small fix or two — that's expected;
  report any error and it's quick to resolve.
- `date` handling uses server time (UTC). For production, pin to Asia/Manila.
