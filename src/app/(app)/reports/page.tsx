import { requireProfile } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PageHeader, Card } from "@/components/ui";

export default async function ReportsPage() {
  const profile = await requireProfile();
  if (profile.role !== "owner") redirect("/dashboard");
  return (
    <div>
      <PageHeader title="Reports" sub="Monthly" />
      <Card className="p-8 text-sm text-muted">
        Monthly sales, collections-by-method, sales-by-service-type, top customers,
        parts margin and a simple P&amp;L are next. All source data (invoices, payments,
        parts, payroll, expenses) is already modelled in Supabase.
      </Card>
    </div>
  );
}
