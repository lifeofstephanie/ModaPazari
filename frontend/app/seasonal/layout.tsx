import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

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
