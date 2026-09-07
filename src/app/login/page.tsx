"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      {/* brand panel */}
      <div className="relative hidden flex-col justify-between bg-graphite p-12 text-on-graphite md:flex">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#1c1b1e] font-display text-lg font-black text-accent-strong">
            FR
          </span>
          <div className="leading-tight">
            <div className="font-display font-extrabold">FIX IT RIGHT</div>
            <div className="font-mono text-[0.6rem] tracking-widest text-[#9e9a9c]">
              SHOP MANAGEMENT
            </div>
          </div>
        </div>
        <div>
          <h2 className="font-display text-4xl font-black">
            Run the shop <span className="text-accent-strong">right</span>.
          </h2>
          <p className="mt-4 max-w-sm text-[#9e9a9c]">
            Job orders, billing, receivables and reminders — all in one place.
            Sign in to your workspace.
          </p>
        </div>
      </div>

      {/* form */}
      <div className="flex items-center justify-center bg-surface p-8">
        <form onSubmit={onSubmit} className="w-full max-w-sm">
          <h1 className="text-2xl font-extrabold">Staff sign in</h1>
          <p className="mb-6 mt-1 text-sm text-muted">
            Enter your credentials to access the workspace.
          </p>

          <label className="mb-1 block font-mono text-[0.62rem] uppercase tracking-widest text-muted">
            Email address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
            className="mb-4 w-full rounded-lg border border-line bg-surface2 px-3 py-2.5 outline-none focus:border-accent-strong"
            placeholder="you@fixitright.ph"
          />

          <label className="mb-1 block font-mono text-[0.62rem] uppercase tracking-widest text-muted">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="mb-5 w-full rounded-lg border border-line bg-surface2 px-3 py-2.5 outline-none focus:border-accent-strong"
            placeholder="••••••••"
          />

          {error && (
            <div className="mb-4 rounded-lg border border-[color-mix(in_srgb,var(--accent)_40%,transparent)] bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] px-3 py-2 text-sm text-accent">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-accent-strong px-4 py-3 font-display font-bold text-accent-ink disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
