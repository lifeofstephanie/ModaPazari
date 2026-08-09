"use client";

import { Heart, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { wishlistService, type ApiProduct } from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";

const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`;
const FALLBACK = "/images/image.png";

export default function WishlistPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => setMounted(true), []);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await wishlistService.get();
      setProducts(data?.products ?? []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    load();
  }, [mounted, user, router, load]);

  const remove = async (id: string) => {
    setProducts((list) => list.filter((p) => p._id !== id));
    try {
      await wishlistService.remove(id);
    } catch {
      load();
    }
    toast.success("Removed from wishlist");
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-background px-5 pb-20 pt-28 md:px-10">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          Saved
        </p>
        <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">My wishlist</h1>

        {loading ? (
          <p className="mt-10 text-sm text-muted">Loading…</p>
        ) : products.length === 0 ? (
          <div className="mt-10 flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border py-20 text-center">
            <Heart size={40} className="text-muted" />
            <p className="text-lg font-medium">Your wishlist is empty</p>
            <Link
              href="/shop"
              className="rounded-full bg-accent-solid px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-strong"
            >
              Browse the shop
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <div key={p._id} className="group relative">
                <button
                  onClick={() => remove(p._id)}
                  aria-label="Remove"
                  className="absolute right-2 top-2 z-10 grid h-8 w-8 place-items-center rounded-full bg-card/90 text-muted shadow transition-colors hover:text-red-500"
                >
                  <X size={16} />
                </button>
                <Link href={`/shop/${p._id}`}>
                  <div className="relative aspect-3/4 overflow-hidden rounded-3xl border border-border bg-surface">
                    <img
                      src={p.images?.[0] || FALLBACK}
                      alt={p.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="mt-3 text-center">
                    <h3 className="font-serif text-lg italic text-accent">
                      {p.name}
                    </h3>
                    <p className="mt-1 text-sm font-bold tracking-widest text-accent">
                      {naira(p.price)}
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
