import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export default function ShopLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Header />

        {children}
        <Footer />
      </body>
    </html>
  );
}
