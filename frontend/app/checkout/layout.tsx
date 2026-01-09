import { Header } from "@/components/Header";

export default function CheckoutLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Header />

      <body>{children}</body>
    </html>
  );
}
