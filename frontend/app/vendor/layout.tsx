import { Footer } from "@/components/Footer";
import { Navbar } from "./_components/navbar";
import { Sidebar } from "./_components/sidebar";

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className=" flex flex-col pt-20 bg-[#e0ebf5] min-h-screen">
      {/* Top Navbar */}
      <Navbar />

      {/* Sidebar + Page Content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 overflow-auto md:pl-64 ">
          {children}
          <Footer />
        </main>
      </div>
    </div>
  );
}
