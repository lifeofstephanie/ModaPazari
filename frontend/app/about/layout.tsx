import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export default function AboutLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <body>
      <Header />

      <body>{children}</body>
      <Footer />
    </body>
  );
}
