import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "Seasonal",
  description:
    "Shop clothing by season — winter, summer, autumn and spring collections.",
};

export default function SeasonalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header isOverlay={true} />
      {children}
      <Footer />
    </>
  );
}
