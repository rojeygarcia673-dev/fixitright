import { createClient } from "@/lib/supabase/server";
import { PageHeader, Card, Tile, Badge, EmptyState } from "@/components/ui";
import { peso, pesoK } from "@/lib/format";

export default async function InventoryPage() {
  const supabase = await createClient();
  const { data: parts } = await supabase
    .from("parts")
    .select("id, name, brand, category, stock_qty, min_stock, cost_price, selling_price")
    .is("deleted_at", null)
    .order("name");

  const list = parts ?? [];
  const low = list.filter((p) => p.stock_qty <= p.min_stock);
  const out = list.filter((p) => p.stock_qty <= 0);
  const value = list.reduce((s, p) => s + p.stock_qty * Number(p.cost_price), 0);

  return (
    <div>
      <PageHeader title="Inventory" sub={`${list.length} parts`} />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Tile label="Parts on file" value={list.length} foot="active SKUs" />
        <Tile label="Low stock" value={low.length} foot="at or below minimum" alert={low.length > 0} />
        <Tile label="Out of stock" value={out.length} foot="need reorder" />
        <Tile label="Stock value" value={pesoK(value)} foot="at cost" />
      </div>

      <Card className="overflow-x-auto">
        {list.length === 0 ? (
          <EmptyState>No parts yet.</EmptyState>
        ) : (
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-line font-mono text-[0.62rem] uppercase tracking-wide text-muted">
                <th className="px-4 py-3 text-left">Part</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-right">Stock</th>
                <th className="px-4 py-3 text-right">Min</th>
                <th className="px-4 py-3 text-right">Cost</th>
                <th className="px-4 py-3 text-right">Price</th>
              </tr>
            </thead>
            <tbody>
              {list.map((p) => {
                const lowB = p.stock_qty <= p.min_stock;
                return (
                  <tr key={p.id} className="border-b border-line last:border-0 hover:bg-surface2">
                    <td className="px-4 py-3 font-semibold">
                      {p.name}
                      <div className="font-mono text-xs text-muted">{p.brand}</div>
                    </td>
                    <td className="px-4 py-3 text-muted">{p.category ?? "—"}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      <span className={lowB ? "font-bold text-accent" : ""}>{p.stock_qty}</span>{" "}
                      {lowB && <Badge tone="red">Low</Badge>}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted">{p.min_stock}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{peso(p.cost_price)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{peso(p.selling_price)}</td>
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
