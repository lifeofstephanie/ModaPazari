"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { productService, type ApiProduct, type Season } from "@/services/api";

const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`;
const FALLBACK = "/images/image.png";

const TABS: { key: Season | "all"; label: string }[] = [
  { key: "all", label: "All clothing" },
  { key: "winter", label: "Winter" },
  { key: "summer", label: "Summer" },
  { key: "autumn", label: "Autumn" },
  { key: "spring", label: "Spring" },
];

export default function Seasonal() {
  const [tab, setTab] = useState<Season | "all">("all");
  const [items, setItems] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (season: Season | "all") => {
    try {
      setLoading(true);
      const { data } = await productService.getFeed({
        department: "clothes",
        ...(season !== "all" ? { season } : {}),
        limit: 40,
      });
      setItems(data.items ?? []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(tab);
  }, [tab, load]);

  return (
    <main className="bg-background pt-28 pb-20">
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <div className="relative flex h-[30vh] w-full items-center overflow-hidden rounded-3xl md:h-[42vh]">
          <img
            src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80"
            alt="Seasonal"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/45" />
          <div className="relative z-10 px-6 md:px-12">
            <p className="text-xs uppercase tracking-[0.25em] text-white/80">
              Seasonal
            </p>
            <p className="mt-3 font-serif text-3xl font-bold italic text-white md:text-5xl">
              Dressed for the season
            </p>
            <p className="mt-2 font-serif text-sm font-medium italic text-white/80 md:text-lg">
              Curated clothing for every time of year
            </p>
          </div>
        </div>

        {/* Season tabs */}
        <div className="mt-10 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-full border px-4 py-2 text-sm capitalize transition-colors ${
                tab === t.key
                  ? "border-accent bg-accent-solid text-white"
                  : "border-border text-muted hover:border-accent hover:text-accent"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-8 mb-8 flex items-end justify-between border-b border-border pb-5">
          <h2 className="text-2xl font-semibold capitalize tracking-tight md:text-3xl">
            {tab === "all" ? "All clothing" : `${tab} collection`}
          </h2>
          <span className="text-sm text-muted">
            {loading ? "…" : `${items.length} items`}
          </span>
        </div>

        {loading ? (
          <p className="py-20 text-center text-muted">Loading…</p>
        ) : items.length === 0 ? (
          <p className="py-20 text-center text-muted">
            Nothing here yet — check back soon.
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
