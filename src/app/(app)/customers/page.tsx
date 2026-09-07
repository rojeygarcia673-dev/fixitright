import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Button, Card, Badge, EmptyState } from "@/components/ui";

export default async function CustomersPage() {
  const supabase = await createClient();
  const { data: customers } = await supabase
    .from("customers")
    .select("id, name, phone, type, vehicles(count)")
    .is("deleted_at", null)
    .order("name");

  const list = customers ?? [];

  return (
    <div>
      <PageHeader
        title="Customers"
        sub={`${list.length} total`}
        action={
          <Button href="/customers/new" variant="accent">
            + New customer
          </Button>
        }
      />
      <Card className="overflow-hidden">
        {list.length === 0 ? (
          <EmptyState>No customers yet. Add your first one.</EmptyState>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line font-mono text-[0.62rem] uppercase tracking-wide text-muted">
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Phone</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-right">Vehicles</th>
              </tr>
            </thead>
            <tbody>
              {list.map((c) => {
                const count = Array.isArray(c.vehicles) ? (c.vehicles[0]?.count ?? 0) : 0;
                return (
                  <tr key={c.id} className="border-b border-line last:border-0 hover:bg-surface2">
                    <td className="px-4 py-3 font-semibold">
                      <Link href={`/customers/${c.id}`}>{c.name}</Link>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted">{c.phone ?? "—"}</td>
                    <td className="px-4 py-3">
                      <Badge tone={c.type === "company" ? "dark" : "grey"}>{c.type}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{count}</td>
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
