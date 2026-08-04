import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export default function AccessoriesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
