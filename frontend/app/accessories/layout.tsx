import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export default function AccessoriesLayout({
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
