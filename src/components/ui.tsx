import Link from "next/link";
import type { ReactNode } from "react";

const BADGE_TONES: Record<string, string> = {
  grey: "bg-surface2 text-muted border border-line",
  red: "text-accent",
  amber: "text-[#c9862b]",
  green: "text-ok",
  dark: "bg-graphite text-on-graphite",
};

export function Badge({ tone = "grey", children }: { tone?: string; children: ReactNode }) {
  const base =
    "inline-flex items-center gap-1 rounded-md px-2 py-1 font-mono text-[0.6rem] font-semibold uppercase tracking-wider";
  const tint =
    tone === "red"
      ? "bg-[color-mix(in_srgb,var(--accent)_16%,transparent)]"
      : tone === "amber"
      ? "bg-[rgba(210,140,40,0.16)]"
      : tone === "green"
      ? "bg-[color-mix(in_srgb,var(--ok)_16%,transparent)]"
      : "";
  return <span className={`${base} ${BADGE_TONES[tone] ?? BADGE_TONES.grey} ${tint}`}>{children}</span>;
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-line bg-surface ${className}`}>{children}</div>
  );
}

export function Tile({
  label,
  value,
  foot,
  alert,
}: {
  label: string;
  value: ReactNode;
  foot?: ReactNode;
  alert?: boolean;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-line bg-surface p-5`}>
      {alert && <span className="absolute left-0 top-0 h-full w-1 bg-accent-strong" />}
      <div className="eyebrow">{label}</div>
      <div className="mt-2 font-display text-2xl font-extrabold tabular-nums tracking-tight">{value}</div>
      {foot && <div className="mt-1 text-sm text-muted">{foot}</div>}
    </div>
  );
}

export function PageHeader({
  title,
  sub,
  action,
}: {
  title: string;
  sub?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-3xl font-extrabold">{title}</h1>
        {sub && <div className="mt-1 font-mono text-xs tracking-wide text-muted">{sub}</div>}
      </div>
      {action}
    </div>
  );
}

export function Button({
  children,
  href,
  type = "button",
  variant = "default",
}: {
  children: ReactNode;
  href?: string;
  type?: "button" | "submit";
  variant?: "default" | "accent";
}) {
  const cls =
    variant === "accent"
      ? "bg-accent-strong text-accent-ink border-transparent"
      : "bg-surface text-ink border-line";
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 font-display text-sm font-bold transition hover:-translate-y-px";
  if (href) {
    return (
      <Link href={href} className={`${base} ${cls}`}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} className={`${base} ${cls}`}>
      {children}
    </button>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="p-10 text-center text-sm text-muted">{children}</div>;
}
