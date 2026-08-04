import { Footer } from "@/components/Footer";
import { Navbar } from "./_components/navbar";
import { Sidebar } from "./_components/sidebar";

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-surface pt-[calc(4rem+env(safe-area-inset-top,0px))]">
      {/* Top Navbar */}
      <Navbar />

      {/* Sidebar + Page Content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 overflow-auto md:pl-64">
          {children}
          <Footer />
        </main>
      </div>
    </div>
  );
}
