import { Header } from "@/components/Header";

export default function AboutLayout({
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
