"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  productService,
  DEPARTMENTS,
  type ApiProduct,
  type Department,
} from "@/services/api";

const FALLBACK_IMG = "/images/image.png";
const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`;
const titleCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function Shop() {
  const [items, setItems] = useState<ApiProduct[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);

  const [search, setSearch] = useState("");
  const [appliedQ, setAppliedQ] = useState("");
  const [dept, setDept] = useState<Department | "">("");

  // Debounce the search box so we don't hit the API on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => setAppliedQ(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(
    async (nextCursor?: string) => {
      try {
        nextCursor ? setLoadingMore(true) : setLoading(true);
        const { data } = await productService.getFeed({
          limit: 12,
          cursor: nextCursor,
          q: appliedQ || undefined,
          department: dept || undefined,
        });
        setItems((prev) => (nextCursor ? [...prev, ...data.items] : data.items));
        setCursor(data.nextCursor);
        setHasMore(data.hasMore);
        setError(false);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [appliedQ, dept]
  );

  // Reloads from scratch whenever the query or department filter changes.
  useEffect(() => {
    load();
  }, [load]);

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

        {/* Search + department filter */}
        <div className="mt-12 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <label className="flex w-full items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 md:max-w-sm">
            <Search size={18} className="text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setDept("")}
              className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                dept === ""
                  ? "border-accent bg-accent-solid text-white"
                  : "border-border text-muted hover:border-accent hover:text-accent"
              }`}
            >
              All
            </button>
            {DEPARTMENTS.filter((d) => d !== "other").map((d) => (
              <button
                key={d}
                onClick={() => setDept(d)}
                className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                  dept === d
                    ? "border-accent bg-accent-solid text-white"
                    : "border-border text-muted hover:border-accent hover:text-accent"
                }`}
              >
                {titleCase(d)}
              </button>
            ))}
          </div>
        </div>

        {/* Grid heading */}
        <div className="mt-8 mb-8 flex items-end justify-between border-b border-border pb-5">
          <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
            {appliedQ ? `Results for “${appliedQ}”` : "All products"}
          </h2>
          {!loading && !error && (
            <span className="text-sm text-muted">{items.length} items</span>
          )}
        </div>

        {/* States */}
        {loading ? (
          <ProductGridSkeleton />
        ) : error ? (
          <EmptyState
            title="Couldn't load products"
            sub="Please check your connection and try again."
            action={
              <button
                onClick={() => load()}
                className="rounded-full bg-accent-solid px-5 py-2 text-sm text-white transition-colors hover:bg-accent-strong"
              >
                Retry
              </button>
            }
          />
        ) : items.length === 0 ? (
          <EmptyState
            title="No products yet"
            sub="Check back soon — new pieces are on the way."
          />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-3 md:gap-8 lg:grid-cols-4">
              {items.map((item) => (
                <Link href={`/shop/${item._id}`} key={item._id} className="group">
                  <div className="relative aspect-3/4 overflow-hidden rounded-3xl border border-border bg-surface">
                    <img
                      src={item.images?.[0] || FALLBACK_IMG}
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    {item.stock === 0 && (
                      <span className="absolute left-3 top-3 rounded-full bg-black/70 px-2 py-0.5 text-xs text-white">
                        Sold out
                      </span>
                    )}
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

            {hasMore && (
              <div className="mt-12 flex justify-center">
                <button
                  onClick={() => cursor && load(cursor)}
                  disabled={loadingMore}
                  className="rounded-full border border-accent px-8 py-3 text-sm font-medium text-accent transition-colors hover:bg-accent-soft disabled:opacity-60"
                >
                  {loadingMore ? "Loading…" : "Load more"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

const ProductGridSkeleton = () => (
  <div className="grid grid-cols-2 gap-6 md:grid-cols-3 md:gap-8 lg:grid-cols-4">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="aspect-3/4 rounded-3xl bg-surface-2" />
        <div className="mx-auto mt-4 h-4 w-2/3 rounded bg-surface-2" />
        <div className="mx-auto mt-2 h-3 w-1/3 rounded bg-surface-2" />
      </div>
    ))}
  </div>
);

const EmptyState = ({
  title,
  sub,
  action,
}: {
  title: string;
  sub: string;
  action?: React.ReactNode;
}) => (
  <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-border py-24 text-center">
    <p className="text-lg font-semibold">{title}</p>
    <p className="max-w-sm text-sm text-muted">{sub}</p>
    {action}
  </div>
);
