import Link from "next/link";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Tile, Card, Badge, EmptyState } from "@/components/ui";
import { pesoK } from "@/lib/format";
import { JOB_STATUS } from "@/lib/types";

const ACTIVE = ["open", "in_progress", "waiting_parts", "waiting_approval", "done"];
const BOARD = ["open", "in_progress", "waiting_parts", "done"];

export default async function DashboardPage() {
  const profile = await requireProfile();
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const month = today.slice(0, 7);

  const { data: jobs } = await supabase
    .from("job_orders")
    .select("id, jo_no, status, customer_concern, mechanic_id, vehicles(plate_no, make, model), customers(name)")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  const jobList = jobs ?? [];

  // ---- Mechanic view: only their tasks, no money ----
  if (profile.role === "mechanic") {
    const mine = jobList.filter((j) => ACTIVE.includes(j.status));
    return (
      <div>
        <h1 className="mb-1 text-3xl font-extrabold">My tasks, {profile.name.split(" ")[0]}.</h1>
        <p className="mb-6 font-mono text-xs text-muted">Assigned jobs</p>
        <div className="flex flex-col gap-3">
          {mine.length === 0 && <EmptyState>No tasks assigned to you.</EmptyState>}
          {mine.map((j) => {
            const v = j.vehicles as { make?: string; model?: string; plate_no?: string } | null;
            return (
              <Card key={j.id} className="flex items-center gap-4 p-5">
                <div className="flex-1">
                  <div className="font-semibold">
                    {v?.make} {v?.model} — {j.customer_concern?.slice(0, 40)}
                  </div>
                  <div className="font-mono text-xs text-muted">
                    {j.jo_no} · {v?.plate_no}
                  </div>
                </div>
                <Badge tone={JOB_STATUS[j.status]?.tone}>{JOB_STATUS[j.status]?.label}</Badge>
              </Card>
            );
          })}
        </div>
        <p className="mt-5 font-mono text-xs text-muted">
          Mechanics only see their own jobs — no prices or payments.
        </p>
      </div>
    );
  }

  // ---- Money dashboard (owner / advisor / cashier) ----
  const [{ data: invoices }, { data: payments }, { data: parts }] = await Promise.all([
    supabase.from("v_invoices").select("id, invoice_no, issued_at, due_date, total, balance, status, is_void"),
    supabase.from("payments").select("amount, paid_at"),
    supabase.from("parts").select("id, name, brand, stock_qty, min_stock").is("deleted_at", null),
  ]);

  const inv = invoices ?? [];
  const pays = payments ?? [];
  const partList = parts ?? [];

  const carsInShop = jobList.filter((j) => ACTIVE.includes(j.status)).length;
  const collectedToday = pays
    .filter((p) => p.paid_at === today)
    .reduce((s, p) => s + Number(p.amount), 0);
  const invoicedThisMonth = inv
    .filter((i) => !i.is_void && String(i.issued_at).slice(0, 7) === month)
    .reduce((s, i) => s + Number(i.total), 0);
  const outstanding = inv.filter((i) => !i.is_void && Number(i.balance) > 0.005);
  const receivables = outstanding.reduce((s, i) => s + Number(i.balance), 0);
  const overdue = outstanding.filter((i) => i.due_date && i.due_date < today).length;
  const lowStock = partList.filter((p) => p.stock_qty <= p.min_stock);

  return (
    <div>
      <h1 className="mb-1 text-3xl font-extrabold">Good day, {profile.name.split(" ")[0]}.</h1>
      <p className="mb-6 font-mono text-xs text-muted">Fix It Right Garage</p>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Tile label="Cars in shop" value={carsInShop} foot={`${jobList.filter((j) => j.status === "waiting_parts").length} waiting on parts`} />
        <Tile label="Collected today" value={pesoK(collectedToday)} foot="all methods" />
        <Tile label="Invoiced this month" value={pesoK(invoicedThisMonth)} foot={month} />
        <Tile label="Receivables" value={pesoK(receivables)} foot={`${overdue} overdue · ${outstanding.length} invoices`} alert={overdue > 0} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold">Job order board</h2>
            <Link href="/jobs" className="font-mono text-xs text-accent">Open all →</Link>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {BOARD.map((s) => {
              const col = jobList.filter((j) => j.status === s);
              return (
                <div key={s} className="rounded-lg border border-line bg-surface2 p-2.5">
                  <div className="mb-2 flex items-center justify-between font-mono text-[0.6rem] uppercase tracking-wide text-muted">
                    <span>{JOB_STATUS[s].label}</span>
                    <span className="rounded-full border border-line bg-surface px-1.5">{col.length}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {col.map((j) => {
                      const v = j.vehicles as { make?: string; model?: string; plate_no?: string } | null;
                      return (
                        <Link key={j.id} href={`/jobs`} className="block rounded-md border border-line bg-surface p-2">
                          <div className="text-sm font-semibold">{v?.make} {v?.model}</div>
                          <div className="font-mono text-[0.6rem] text-muted">{v?.plate_no}</div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <aside>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold">Low stock</h2>
            <Link href="/inventory" className="font-mono text-xs text-accent">Inventory →</Link>
          </div>
          <Card className="p-4">
            {lowStock.length === 0 && <div className="text-sm text-muted">Stock levels OK.</div>}
            {lowStock.map((p) => (
              <div key={p.id} className="flex items-center justify-between border-b border-line py-2 text-sm last:border-0">
                <div>
                  {p.name} <span className="font-mono text-xs text-muted">{p.brand}</span>
                </div>
                <span className="font-mono text-xs font-semibold text-accent">{p.stock_qty} left</span>
              </div>
            ))}
          </Card>
        </aside>
      </div>
    </div>
  );
}
