import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ProfileShell } from "./_components/profileShell";

export const metadata: Metadata = {
  title: "My Account",
  description: "Manage your Moda Pazari profile, orders and wishlist.",
};

export default function ProfileLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <ProfileShell>{children}</ProfileShell>
      <Footer />
    </>
  );
}
