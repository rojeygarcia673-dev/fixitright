import { PageHeader, Card } from "@/components/ui";

export default function RemindersPage() {
  return (
    <div>
      <PageHeader title="Reminders" sub="Who to contact today" />
      <Card className="p-8 text-sm text-muted">
        The reminders queue (payment due / overdue / next-service, with one-tap SMS and
        Messenger links) is the next screen to wire up. The database, RLS and message
        templates are already in place — see <code>supabase/</code>.
      </Card>
    </div>
  );
}
