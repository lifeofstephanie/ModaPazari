import { Header } from "@/components/Header";

export default function ContactLayout({
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
