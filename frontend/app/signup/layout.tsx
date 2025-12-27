import { Header } from "@/components/Header";

export default function SignupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div lang="en">
      {/* <Header /> */}
      {children}
    </div>
  );
}
