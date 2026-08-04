import { CLOTHES_DATA } from "@/data/constants";
import Link from "next/link";

export default function Shop() {
  return (
    <main className="bg-background pt-28 pb-20">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        {/* Hero band */}
        <div className="relative flex h-[30vh] w-full items-center overflow-hidden rounded-3xl md:h-[42vh]">
          <img
            src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1600&q=80"
            alt="Shop fashion"
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/45" />
          <div className="relative z-10 px-6 md:px-12">
            <p className="text-xs uppercase tracking-[0.25em] text-white/80">
              The collection
            </p>
            <p className="mt-3 font-serif text-3xl font-bold italic text-white md:text-5xl">
              Fashion for all
            </p>
            <p className="mt-2 font-serif text-sm font-medium italic text-white/80 md:text-lg">
              Dress bold, live confident
            </p>
          </div>
        </div>

        {/* Grid heading */}
        <div className="mt-14 mb-8 flex items-end justify-between border-b border-border pb-5">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
            All products
          </h2>
          <span className="text-sm text-muted">{CLOTHES_DATA.length} items</span>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 md:gap-8 lg:grid-cols-4">
          {CLOTHES_DATA.map((item) => (
            <Link href={`/shop/${item.id}`} key={item.id} className="group">
              <div className="relative aspect-3/4 overflow-hidden rounded-3xl border border-border bg-surface">
                <img
                  src={item.img}
                  alt={item.name}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute bottom-4 right-4 grid h-14 w-14 place-items-center rounded-full bg-card shadow-lg transition-transform group-hover:rotate-45">
                  <span className="text-center text-[10px] font-bold uppercase leading-none tracking-tighter">
                    Moda <br /> Pazari
                  </span>
                  <div className="absolute -top-1 -right-1 rounded-full bg-accent-solid p-1 text-white">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M7 17L17 7M17 7H7M17 7V17" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <h3 className="font-serif text-lg italic text-accent">
                  {item.name}
                </h3>
                <p className="mt-1 text-sm font-bold tracking-widest text-accent">
                  {item.currency} {item.price}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
