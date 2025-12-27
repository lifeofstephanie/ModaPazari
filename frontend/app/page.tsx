import { Categories } from "@/components/Categories";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";

export default function Home() {
  return (
    <div>
      <Header />
      <div className="pt-20">
        <Hero />
        <Categories />
      </div>
    </div>
  );
}
