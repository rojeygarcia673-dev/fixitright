import { createClient } from "@/lib/supabase/server";
import { PageHeader, Card, Tile, Badge, EmptyState } from "@/components/ui";
import { peso, pesoK, fmtDate } from "@/lib/format";
import { INVOICE_STATUS } from "@/lib/types";

function aging(due: string | null, today: string) {
  if (!due) return { label: "—", tone: "grey" };
  const days = Math.round((Date.parse(today) - Date.parse(due)) / 86400000);
  if (days <= 0) return { label: "Current", tone: "grey" };
  if (days <= 7) return { label: "1–7 days", tone: "amber" };
  if (days <= 15) return { label: "8–15 days", tone: "amber" };
  if (days <= 30) return { label: "16–30 days", tone: "red" };
  return { label: "30+ days", tone: "red" };
}

export default async function BillingPage() {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const month = today.slice(0, 7);

  const [{ data: invoices }, { data: customers }, { data: payments }] = await Promise.all([
    supabase.from("v_invoices").select("id, invoice_no, customer_id, issued_at, due_date, total, balance, status, is_void"),
    supabase.from("customers").select("id, name"),
    supabase.from("payments").select("amount, paid_at"),
  ]);

  const custName = new Map((customers ?? []).map((c) => [c.id, c.name]));
  const inv = invoices ?? [];
  const outstanding = inv
    .filter((i) => !i.is_void && Number(i.balance) > 0.005)
    .sort((a, b) => String(a.due_date).localeCompare(String(b.due_date)));

  const receivables = outstanding.reduce((s, i) => s + Number(i.balance), 0);
  const overdue = outstanding.filter((i) => i.due_date && i.due_date < today).length;
  const collectedToday = (payments ?? [])
    .filter((p) => p.paid_at === today)
    .reduce((s, p) => s + Number(p.amount), 0);
  const invoicedThisMonth = inv
    .filter((i) => !i.is_void && String(i.issued_at).slice(0, 7) === month)
    .reduce((s, i) => s + Number(i.total), 0);

  return (
    <div>
      <PageHeader title="Billing & Receivables" sub={month} />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Tile label="Receivables" value={pesoK(receivables)} foot={`${outstanding.length} invoices`} alert={overdue > 0} />
        <Tile label="Overdue" value={overdue} foot="need follow-up" />
        <Tile label="Collected today" value={pesoK(collectedToday)} foot="all methods" />
        <Tile label="Invoiced this month" value={pesoK(invoicedThisMonth)} foot={month} />
      </div>

      <h2 className="mb-3 text-lg font-bold">Outstanding (receivables)</h2>
      <Card className="overflow-x-auto">
        {outstanding.length === 0 ? (
          <EmptyState>No outstanding balances. 🎉</EmptyState>
        ) : (
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-line font-mono text-[0.62rem] uppercase tracking-wide text-muted">
                <th className="px-4 py-3 text-left">Invoice</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Due</th>
                <th className="px-4 py-3 text-left">Aging</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {outstanding.map((i) => {
                const ag = aging(i.due_date, today);
                return (
                  <tr key={i.id} className="border-b border-line last:border-0 hover:bg-surface2">
                    <td className="px-4 py-3 font-semibold">{i.invoice_no}</td>
                    <td className="px-4 py-3">{custName.get(i.customer_id) ?? "—"}</td>
                    <td className="px-4 py-3">{fmtDate(i.due_date)}</td>
                    <td className="px-4 py-3">
                      <Badge tone={ag.tone}>{ag.label}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={INVOICE_STATUS[i.status]?.tone}>{INVOICE_STATUS[i.status]?.label}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums text-accent">{peso(i.balance)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
