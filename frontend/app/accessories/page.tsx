"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { productService, type ApiProduct } from "@/services/api";

const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`;
const FALLBACK = "/images/image.png";

export default function Accessories() {
  const [items, setItems] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productService
      .getFeed({ department: "accessories", limit: 40 })
      .then(({ data }) => setItems(data.items ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="bg-background pt-28 pb-20">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <div className="relative flex h-[30vh] w-full items-center overflow-hidden rounded-3xl md:h-[42vh]">
          <img
            src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=80"
            alt="Accessories"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/45" />
          <div className="relative z-10 px-6 md:px-12">
            <p className="text-xs uppercase tracking-[0.25em] text-white/80">
              Accessories
            </p>
            <p className="mt-3 font-serif text-3xl font-bold italic text-white md:text-5xl">
              Get your elegance on
            </p>
            <p className="mt-2 font-serif text-sm font-medium italic text-white/80 md:text-lg">
              Finishing touches that make you stand out
            </p>
          </div>
        </div>

        <div className="mt-14 mb-8 flex items-end justify-between border-b border-border pb-5">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Accessories
          </h2>
          <span className="text-sm text-muted">
            {loading ? "…" : `${items.length} items`}
          </span>
        </div>

        {loading ? (
          <p className="py-20 text-center text-muted">Loading…</p>
        ) : items.length === 0 ? (
          <p className="py-20 text-center text-muted">
            No pieces in this collection yet — check back soon.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 md:gap-8 lg:grid-cols-4">
            {items.map((item) => (
              <Link href={`/shop/${item._id}`} key={item._id} className="group">
                <div className="relative aspect-3/4 overflow-hidden rounded-3xl border border-border bg-surface">
                  <img
                    src={item.images?.[0] || FALLBACK}
                    alt={item.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
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
                    {naira(item.price)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
