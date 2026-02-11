import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export default function HelpLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // <html lang="en">
    <body>
      <Header isOverlay={false} />

      {children}
      <Footer />
    </body>
    // </html>
  );
}
