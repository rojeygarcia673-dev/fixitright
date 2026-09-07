import { createClient } from "@/lib/supabase/server";
import { PageHeader, Card, Badge, EmptyState } from "@/components/ui";
import { peso } from "@/lib/format";
import { JOB_STATUS } from "@/lib/types";

export default async function JobsPage() {
  const supabase = await createClient();

  const [{ data: jobs }, { data: totals }] = await Promise.all([
    supabase
      .from("job_orders")
      .select("id, jo_no, status, vehicles(plate_no, make, model), customers(name), mechanic:profiles!job_orders_mechanic_id_fkey(name)")
      .is("deleted_at", null)
      .order("jo_no", { ascending: false }),
    supabase.from("v_jo_totals").select("jo_id, est_total"),
  ]);

  const totalMap = new Map((totals ?? []).map((t) => [t.jo_id, Number(t.est_total)]));
  const list = jobs ?? [];

  return (
    <div>
      <PageHeader title="Job Orders" sub={`${list.length} total`} />
      <Card className="overflow-x-auto">
        {list.length === 0 ? (
          <EmptyState>No job orders yet.</EmptyState>
        ) : (
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-line font-mono text-[0.62rem] uppercase tracking-wide text-muted">
                <th className="px-4 py-3 text-left">JO No.</th>
                <th className="px-4 py-3 text-left">Vehicle</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Mechanic</th>
                <th className="px-4 py-3 text-right">Est. total</th>
              </tr>
            </thead>
            <tbody>
              {list.map((j) => {
                const v = j.vehicles as { plate_no?: string; make?: string; model?: string } | null;
                const c = j.customers as { name?: string } | null;
                const m = j.mechanic as { name?: string } | null;
                return (
                  <tr key={j.id} className="border-b border-line last:border-0 hover:bg-surface2">
                    <td className="px-4 py-3 font-semibold">{j.jo_no}</td>
                    <td className="px-4 py-3">
                      {v?.make} {v?.model}
                      <div className="font-mono text-xs text-muted">{v?.plate_no}</div>
                    </td>
                    <td className="px-4 py-3">{c?.name ?? "—"}</td>
                    <td className="px-4 py-3">
                      <Badge tone={JOB_STATUS[j.status]?.tone}>{JOB_STATUS[j.status]?.label}</Badge>
                    </td>
                    <td className="px-4 py-3">{m?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{peso(totalMap.get(j.id) ?? 0)}</td>
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
