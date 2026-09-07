import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireProfile, canSeeMoney } from "@/lib/auth";
import { PageHeader, Card, Badge } from "@/components/ui";
import { peso } from "@/lib/format";
import { JOB_STATUS } from "@/lib/types";

export default async function CustomerDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await requireProfile();
  const supabase = await createClient();

  const { data: customer } = await supabase
    .from("customers")
    .select("id, name, phone, type, address, messenger")
    .eq("id", id)
    .single();

  if (!customer) notFound();

  const [{ data: vehicles }, { data: jobs }, invoicesRes] = await Promise.all([
    supabase.from("vehicles").select("id, plate_no, make, model, year, engine, transmission").eq("customer_id", id),
    supabase
      .from("job_orders")
      .select("id, jo_no, status, customer_concern, vehicles(make, model)")
      .eq("customer_id", id)
      .order("created_at", { ascending: false }),
    canSeeMoney(profile.role)
      ? supabase.from("v_invoices").select("balance, is_void").eq("customer_id", id)
      : Promise.resolve({ data: [] as { balance: number; is_void: boolean }[] }),
  ]);

  const balance = (invoicesRes.data ?? [])
    .filter((i) => !i.is_void)
    .reduce((s, i) => s + Number(i.balance), 0);

  return (
    <div>
      <Link href="/customers" className="mb-3 inline-block font-mono text-xs text-muted hover:text-accent">
        ← Customers
      </Link>
      <PageHeader title={customer.name} sub={`${customer.phone ?? "—"} · ${customer.type}`} />

      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="flex flex-col gap-5">
          <Card className="p-5">
            <h2 className="mb-3 text-lg font-bold">Vehicles</h2>
            {(vehicles ?? []).length === 0 && <div className="text-sm text-muted">No vehicles.</div>}
            {(vehicles ?? []).map((v) => (
              <div key={v.id} className="border-b border-line py-2.5 last:border-0">
                <div className="font-semibold">{v.plate_no}</div>
                <div className="font-mono text-xs text-muted">
                  {v.make} {v.model} {v.year} · {v.engine} · {v.transmission}
                </div>
              </div>
            ))}
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 text-lg font-bold">Job history</h2>
            {(jobs ?? []).length === 0 && <div className="text-sm text-muted">No jobs yet.</div>}
            {(jobs ?? []).map((j) => {
              const v = j.vehicles as { make?: string; model?: string } | null;
              return (
                <div key={j.id} className="flex items-center justify-between border-b border-line py-2.5 last:border-0">
                  <div>
                    <div className="font-semibold">{j.jo_no}</div>
                    <div className="font-mono text-xs text-muted">
                      {v?.make} {v?.model} · {j.customer_concern?.slice(0, 30)}
                    </div>
                  </div>
                  <Badge tone={JOB_STATUS[j.status]?.tone}>{JOB_STATUS[j.status]?.label}</Badge>
                </div>
              );
            })}
          </Card>
        </div>

        <aside>
          <Card className="p-5">
            <h2 className="mb-3 text-lg font-bold">Account</h2>
            {canSeeMoney(profile.role) && (
              <div className="flex items-center justify-between border-b border-line py-2 text-sm">
                <span className="text-muted">Outstanding balance</span>
                <span className="font-semibold" style={{ color: balance > 0 ? "var(--accent)" : "var(--ok)" }}>
                  {peso(balance)}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between border-b border-line py-2 text-sm">
              <span className="text-muted">Messenger</span>
              <span>{customer.messenger ?? "—"}</span>
            </div>
            <div className="flex items-center justify-between py-2 text-sm">
              <span className="text-muted">Address</span>
              <span className="text-right">{customer.address ?? "—"}</span>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
