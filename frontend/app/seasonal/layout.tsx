import { Header } from "@/components/Header";

export default function SeasonalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Header isOverlay={true} />

        {children}
      </body>
    </html>
  );
}
