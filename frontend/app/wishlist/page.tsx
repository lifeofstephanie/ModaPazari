"use client";

import { Heart, ShoppingBag, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { wishlistService, type ApiProduct } from "@/services/api";
import { useCartStore, type CartItem } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";

const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`;
const FALLBACK = "/images/image.png";

const available = (p: ApiProduct) =>
  p.variants && p.variants.length > 0
    ? p.variants.reduce((s, v) => s + v.stock, 0)
    : p.stock;

export default function WishlistPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { addToCart, increaseQty, decreaseQty, items } = useCartStore();
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

  const add = (p: ApiProduct) => {
    const item: CartItem = {
      cartId: p._id,
      productId: p._id,
      title: p.name,
      price: p.price,
      imageUrl: p.images?.[0] || FALLBACK,
      quantity: 1,
      color: "",
      size: "",
    };
    addToCart(item);
    toast.success("Added to cart");
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-background px-5 pb-20 pt-28 md:px-10">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          Saved
        </p>
        <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">My wishlist</h1>
        {!loading && products.length > 0 && (
          <p className="mt-1 text-sm text-muted">
            {products.length} saved item{products.length === 1 ? "" : "s"}
          </p>
        )}

        {loading ? (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="aspect-[3/4] animate-pulse rounded-2xl border border-border bg-card"
              />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="mt-10 flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border py-20 text-center">
            <Heart size={40} className="text-muted" />
            <p className="text-lg font-medium">Your wishlist is empty</p>
            <p className="max-w-xs text-sm text-muted">
              Tap the heart on any product to save it here for later.
            </p>
            <Link
              href="/shop"
              className="rounded-full bg-accent-solid px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-strong"
            >
              Browse the shop
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => {
              const stock = available(p);
              const soldOut = stock <= 0;
              const hasVariants = !!p.variants && p.variants.length > 0;
              // Match the plain (no colour/size) cart line for this product.
              // We match on productId — not cartId — because a server cart's
              // cartId is the DB line id, not the product id.
              const inCart = items.find(
                (i) => i.productId === p._id && !i.color && !i.size
              );
              return (
                <div
                  key={p._id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="relative aspect-square overflow-hidden bg-surface">
                    <Link href={`/shop/${p._id}`}>
                      <img
                        src={p.images?.[0] || FALLBACK}
                        alt={p.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </Link>
                    <button
                      onClick={() => remove(p._id)}
                      aria-label="Remove from wishlist"
                      className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-card/90 text-muted shadow backdrop-blur transition-colors hover:text-red-500"
                    >
                      <X size={16} />
                    </button>
                    {soldOut && (
                      <span className="absolute left-2 top-2 rounded-full bg-foreground/70 px-2 py-0.5 text-[11px] font-medium text-white">
                        Sold out
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-4">
                    <Link href={`/shop/${p._id}`}>
                      <h3 className="line-clamp-1 font-medium transition-colors group-hover:text-accent">
                        {p.name}
                      </h3>
                    </Link>
                    <p className="mt-1 font-semibold text-accent">
                      {naira(p.price)}
                    </p>

                    <div className="mt-3 flex-1" />

                    {soldOut ? (
                      <button
                        disabled
                        className="w-full cursor-not-allowed rounded-full bg-surface-2 py-2 text-sm text-muted"
                      >
                        Out of stock
                      </button>
                    ) : hasVariants ? (
                      <Link
                        href={`/shop/${p._id}`}
                        className="block w-full rounded-full border border-accent py-2 text-center text-sm font-medium text-accent transition-colors hover:bg-accent-soft"
                      >
                        Choose options
                      </Link>
                    ) : inCart ? (
                      <div className="flex w-full items-center justify-between rounded-full border border-accent px-4 py-1.5">
                        <button
                          aria-label="Decrease quantity"
                          onClick={() => decreaseQty(inCart.cartId)}
                          className="text-lg leading-none text-accent"
                        >
                          −
                        </button>
                        <span className="text-sm font-medium">
                          {inCart.quantity}
                        </span>
                        <button
                          aria-label="Increase quantity"
                          onClick={() => increaseQty(inCart.cartId)}
                          className="text-lg leading-none text-accent"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => add(p)}
                        className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-accent-solid py-2 text-sm font-medium text-white transition-colors hover:bg-accent-strong"
                      >
                        <ShoppingBag size={15} />
                        Add to cart
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
