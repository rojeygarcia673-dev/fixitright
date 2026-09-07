import { requireProfile } from "@/lib/auth";
import { navForRole } from "@/lib/auth";
import { TopNav } from "@/components/nav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireProfile();
  const items = navForRole(profile.role);

  return (
    <div className="min-h-screen">
      <TopNav name={profile.name} role={profile.role} items={items} />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
