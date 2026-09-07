export function peso(n: number | string | null | undefined, decimals = 2): string {
  const v = Number(n ?? 0);
  return (
    "₱" +
    v.toLocaleString("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
  );
}

/** Compact peso for KPI tiles (no decimals). */
export function pesoK(n: number | string | null | undefined): string {
  return peso(n, 0);
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** Format an ISO date (yyyy-mm-dd or Date) as `dd MMM yyyy`. */
export function fmtDate(input: string | Date | null | undefined): string {
  if (!input) return "—";
  const d = typeof input === "string" ? new Date(input + "T00:00:00") : input;
  if (isNaN(d.getTime())) return String(input);
  const dd = String(d.getDate()).padStart(2, "0");
  return `${dd} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}
