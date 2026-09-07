import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile, Role } from "@/lib/types";

/**
 * Returns the signed-in user's profile, or redirects to /login.
 * Use at the top of every protected page / layout.
 */
export async function requireProfile(): Promise<Profile> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, name, role, active")
    .eq("id", user.id)
    .single();

  if (!profile) {
    // Authenticated but no profile row yet — treat as advisor fallback.
    return { id: user.id, name: user.email ?? "Staff", role: "advisor", active: true };
  }
  return profile as Profile;
}

export function canSeeMoney(role: Role): boolean {
  return role === "owner" || role === "advisor" || role === "cashier";
}

export function navForRole(role: Role): { href: string; label: string }[] {
  if (role === "mechanic") return [{ href: "/dashboard", label: "My Tasks" }];
  const items = [{ href: "/dashboard", label: "Dashboard" }];
  if (role === "owner" || role === "advisor")
    items.push({ href: "/jobs", label: "Job Orders" });
  items.push({ href: "/customers", label: "Customers" });
  items.push({ href: "/billing", label: "Billing" });
  if (role === "owner" || role === "advisor")
    items.push({ href: "/inventory", label: "Inventory" });
  items.push({ href: "/reminders", label: "Reminders" });
  if (role === "owner") items.push({ href: "/reports", label: "Reports" });
  if (role === "owner") items.push({ href: "/payroll", label: "Payroll" });
  return items;
}
