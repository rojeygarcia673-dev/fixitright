import { requireProfile } from "@/lib/auth";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Card, EmptyState } from "@/components/ui";
import { peso } from "@/lib/format";

export default async function PayrollPage() {
  const profile = await requireProfile();
  if (profile.role !== "owner") redirect("/dashboard");

  const supabase = await createClient();
  const { data: employees } = await supabase
    .from("employees")
    .select("id, name, role, basis, rate")
    .eq("active", true)
    .order("name");

  const list = employees ?? [];

  return (
    <div>
      <PageHeader title="Payroll" sub="Employees" />
      <Card className="overflow-x-auto">
        {list.length === 0 ? (
          <EmptyState>No employees yet.</EmptyState>
        ) : (
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-line font-mono text-[0.62rem] uppercase tracking-wide text-muted">
                <th className="px-4 py-3 text-left">Employee</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Basis</th>
                <th className="px-4 py-3 text-right">Rate</th>
              </tr>
            </thead>
            <tbody>
              {list.map((e) => (
                <tr key={e.id} className="border-b border-line last:border-0 hover:bg-surface2">
                  <td className="px-4 py-3 font-semibold">{e.name}</td>
                  <td className="px-4 py-3 capitalize text-muted">{e.role}</td>
                  <td className="px-4 py-3 capitalize">{e.basis}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {peso(e.rate)}
                    {e.basis === "daily" ? "/day" : "/mo"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
      <p className="mt-4 font-mono text-xs text-muted">
        Editable days/deductions, live net computation and printable payslips are the next
        step (they already work in the browser demo).
      </p>
    </div>
  );
}
