export type Role = "owner" | "advisor" | "mechanic" | "cashier";

export type Profile = {
  id: string;
  name: string;
  role: Role;
  active: boolean;
};

export const JOB_STATUS: Record<string, { label: string; tone: string }> = {
  open: { label: "Open", tone: "grey" },
  in_progress: { label: "In progress", tone: "red" },
  waiting_parts: { label: "Waiting parts", tone: "amber" },
  waiting_approval: { label: "Waiting approval", tone: "amber" },
  done: { label: "Done", tone: "green" },
  billed: { label: "Billed", tone: "dark" },
  released: { label: "Released", tone: "green" },
  cancelled: { label: "Cancelled", tone: "grey" },
};

export const INVOICE_STATUS: Record<string, { label: string; tone: string }> = {
  unpaid: { label: "Unpaid", tone: "red" },
  partial: { label: "Partial", tone: "amber" },
  paid: { label: "Paid", tone: "green" },
  void: { label: "Void", tone: "grey" },
};
