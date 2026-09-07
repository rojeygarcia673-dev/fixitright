"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function TopNav({
  name,
  role,
  items,
}: {
  name: string;
  role: string;
  items: { href: string; label: string }[];
}) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-graphite font-display text-base font-black text-accent-strong">
            FR
          </span>
          <span className="hidden leading-tight sm:block">
            <span className="block font-display text-sm font-extrabold">FIX IT RIGHT</span>
            <span className="block font-mono text-[0.55rem] tracking-widest text-muted">
              SHOP MANAGEMENT
            </span>
          </span>
        </Link>

        <nav className="ml-2 flex flex-1 gap-1 overflow-x-auto">
          {items.map((it) => {
            const active =
              pathname === it.href || (it.href !== "/dashboard" && pathname.startsWith(it.href));
            return (
              <Link
                key={it.href}
                href={it.href}
                className={`whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition ${
                  active ? "bg-surface2 text-ink" : "text-muted hover:text-ink"
                }`}
              >
                {it.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-accent-strong font-display text-sm font-extrabold text-accent-ink">
            {initials}
          </div>
          <div className="hidden leading-tight sm:block">
            <div className="text-sm font-semibold">{name}</div>
            <div className="font-mono text-[0.6rem] capitalize tracking-wide text-muted">{role}</div>
          </div>
          <button
            onClick={signOut}
            className="rounded-lg border border-line px-3 py-2 font-display text-xs font-semibold text-muted hover:text-ink"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
