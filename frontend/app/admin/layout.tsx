import { AdminGuard } from "./_components/adminGuard";
import { AdminNav } from "./_components/adminNav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-surface">
        <AdminNav />
        <main className="mx-auto max-w-6xl px-5 py-8">{children}</main>
      </div>
    </AdminGuard>
  );
}
