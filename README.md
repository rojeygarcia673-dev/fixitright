# Fix It Right Garage — Shop Management (Next.js + Supabase)

Multi-user shop-management system for **Fix It Right Garage**, Tacloban City.
Stack: **Next.js 15 (App Router) + TypeScript + Tailwind + Supabase** (Postgres,
Auth, Row Level Security). Deploys to Vercel.

> This is the production codebase. A single-file browser demo of the same features
> exists separately; this version is multi-user with a real database and secure auth.

---

## 1. Prerequisites

- **Node.js 18.18+** (or 20+) and npm — https://nodejs.org
- A free **Supabase** account — https://supabase.com
- (to deploy) a **Vercel** account and a **GitHub** account

Check Node is installed:

```bash
node --version
```

## 2. Install

```bash
npm install
```

## 3. Create the Supabase project

1. supabase.com → **New project** (pick a region near PH, e.g. Singapore).
2. When it's ready, open **Project Settings → API** and copy:
   - **Project URL**
   - **anon public** key
3. Copy the env template and fill it in:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 4. Create the database

In Supabase → **SQL Editor**, run these files **in order** (paste the contents, Run):

1. `supabase/migrations/0001_schema.sql`  (tables, functions, triggers, views)
2. `supabase/migrations/0002_policies.sql` (Row Level Security)
3. `supabase/seed.sql`                      (settings, message templates, sample data)

## 5. Create the first users

Staff sign in with email + password. Create accounts in Supabase →
**Authentication → Users → Add user** (check "Auto Confirm").
To set the name and role, add **User Metadata** (raw JSON) when creating, e.g.:

```json
{ "name": "Rojey Garcia", "role": "owner" }
```

Valid roles: `owner`, `advisor`, `mechanic`, `cashier`.
A `profiles` row is created automatically (via trigger) with that name/role.
If you created a user without metadata, fix the role in **Table Editor → profiles**.

Suggested starter accounts:

| Email                    | Role    |
|--------------------------|---------|
| owner@fixitright.ph      | owner   |
| advisor@fixitright.ph    | advisor |
| mechanic@fixitright.ph   | mechanic|
| cashier@fixitright.ph    | cashier |

## 6. Run it

```bash
npm run dev
```

Open http://localhost:3000 → you'll be redirected to `/login`.

## 7. Deploy (GitHub + Vercel)

1. Push this folder to a new GitHub repo.
2. Vercel → **Add New → Project → Import** the repo.
3. Add the two env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   in **Vercel → Project → Settings → Environment Variables**.
4. **Deploy**. Every push auto-deploys.

In Supabase → **Authentication → URL Configuration**, add your Vercel URL to
**Site URL** / **Redirect URLs**.

---

## What's implemented (this milestone)

- Auth (email/password), session middleware, role-based nav
- **RLS enforced** — e.g. mechanics cannot read invoices/payments/payroll
- Dashboard (live KPIs, job board, low stock), role-aware mechanic view
- Customers (list, detail, create) · Job Orders (list) · Billing/Receivables (aging)
- Inventory (parts list) · Payroll (employee list)

## Next steps

See `PROGRESS.md`. Job detail + items, invoicing + payments, stock receive/issue,
reminders queue, and reports charts are the next screens to wire onto this
already-complete data layer.
