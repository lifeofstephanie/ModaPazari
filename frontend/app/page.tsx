import { Categories } from "@/components/Categories";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";

export default function Home() {
  return (
    <div className="bg-background">
      <Header />
      <main className="pt-20">
        <Hero />
        <Categories />
      </main>
      <Footer />
    </div>
  );
}
