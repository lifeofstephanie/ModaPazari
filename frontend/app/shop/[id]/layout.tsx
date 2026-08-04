// This route is already wrapped by app/shop/layout.tsx (Header + Footer),
// so this nested layout must NOT render them again — just pass children through.
export default function ProductLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
