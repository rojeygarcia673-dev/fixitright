import { createCustomer } from "../actions";
import { PageHeader, Card } from "@/components/ui";

export default function NewCustomerPage() {
  return (
    <div>
      <PageHeader title="New customer" sub="Add a customer record" />
      <Card className="max-w-xl p-6">
        <form action={createCustomer} className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" name="name" required full />
          <Field label="Phone" name="phone" placeholder="+639XXXXXXXXX" />
          <div>
            <label className="mb-1 block font-mono text-[0.62rem] uppercase tracking-widest text-muted">
              Type
            </label>
            <select
              name="type"
              className="w-full rounded-lg border border-line bg-surface2 px-3 py-2.5 outline-none focus:border-accent-strong"
            >
              <option value="individual">Individual</option>
              <option value="company">Company</option>
            </select>
          </div>
          <Field label="Address" name="address" full />
          <div className="col-span-full flex justify-end gap-2">
            <a
              href="/customers"
              className="rounded-lg border border-line bg-surface px-4 py-2.5 font-display text-sm font-bold"
            >
              Cancel
            </a>
            <button
              type="submit"
              className="rounded-lg bg-accent-strong px-4 py-2.5 font-display text-sm font-bold text-accent-ink"
            >
              Add customer
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function Field({
  label,
  name,
  placeholder,
  required,
  full,
}: {
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  full?: boolean;
}) {
  return (
    <div className={full ? "col-span-full" : ""}>
      <label className="mb-1 block font-mono text-[0.62rem] uppercase tracking-widest text-muted">
        {label}
        {required ? " *" : ""}
      </label>
      <input
        name={name}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-lg border border-line bg-surface2 px-3 py-2.5 outline-none focus:border-accent-strong"
      />
    </div>
  );
}
