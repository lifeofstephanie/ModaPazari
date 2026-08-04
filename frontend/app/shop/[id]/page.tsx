"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import Link from "next/link";
import { useCartStore, CartItem } from "@/store/useCartStore";
import { productService, type ApiProduct } from "@/services/api";
import toast from "react-hot-toast";

const FALLBACK_IMG = "/images/image.png";
const naira = (n: number) => `₦${n.toLocaleString("en-NG")}`;

const categoryName = (c: ApiProduct["category"]) =>
  c && typeof c === "object" ? c.name ?? "" : "";

export default function ProductDetails() {
  const params = useParams();
  const id = String(params?.id ?? "");
  const router = useRouter();

  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [mainImage, setMainImage] = useState("");

  const { items, addToCart, increaseQty, decreaseQty } = useCartStore();

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const { data } = await productService.getById(id);
        if (!active) return;
        setProduct(data);
        setMainImage(data.images?.[0] || FALLBACK_IMG);
      } catch {
        if (active) setNotFound(true);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <main className="flex h-screen items-center justify-center bg-background text-muted">
        Loading…
      </main>
    );
  }

  if (notFound || !product) {
    return (
      <main className="flex h-screen flex-col items-center justify-center gap-4 bg-background">
        <p className="text-xl">Product not found.</p>
        <Link href="/shop" className="text-accent hover:underline">
          Back to shop
        </Link>
      </main>
    );
  }

  const cartId = product._id;
  const cartItem = items.find((i) => i.cartId === cartId);
  const quantity = cartItem?.quantity ?? 1;
  const soldOut = product.stock === 0;
  const gallery = product.images?.length ? product.images : [FALLBACK_IMG];

  const handleAdd = () => {
    const newItem: CartItem = {
      cartId,
      productId: product._id,
      title: product.name,
      price: product.price,
      imageUrl: mainImage,
      quantity: 1,
      color: "",
      size: "",
    };
    addToCart(newItem);
    toast.success("Added to cart!");
  };

  const buyNow = () => {
    if (!cartItem) handleAdd();
    router.push("/checkout");
  };

  return (
    <main className="bg-background pt-28 pb-24">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-sm text-muted">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1 transition-colors hover:text-accent"
          >
            <ArrowLeft size={15} /> Back
          </button>
          <span className="text-border">/</span>
          <Link href="/shop" className="transition-colors hover:text-accent">
            Shop
          </Link>
          <span className="text-border">/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Gallery */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="overflow-hidden rounded-3xl border border-border bg-surface">
              <img
                src={mainImage}
                alt={product.name}
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
            {gallery.length > 1 && (
              <div className="mt-4 flex gap-3">
                {gallery.map((thumb, i) => (
                  <button
                    key={i}
                    onClick={() => setMainImage(thumb)}
                    className={`overflow-hidden rounded-xl border-2 transition-colors ${
                      mainImage === thumb
                        ? "border-accent"
                        : "border-border hover:border-accent/50"
                    }`}
                  >
                    <img src={thumb} className="h-20 w-20 object-cover" alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            {categoryName(product.category) && (
              <span className="text-xs uppercase tracking-[0.2em] text-muted">
                {categoryName(product.category)}
              </span>
            )}
            <h1 className="mt-2 font-serif text-4xl italic text-accent md:text-5xl">
              {product.name}
            </h1>
            <p className="mt-4 text-3xl font-semibold">{naira(product.price)}</p>

            <p
              className={`mt-2 text-sm ${soldOut ? "text-red-500" : "text-muted"}`}
            >
              {soldOut ? "Out of stock" : `${product.stock} in stock`}
            </p>

            <div className="my-7 h-px w-full bg-border" />

            <p className="leading-relaxed text-muted">{product.description}</p>

            {/* Actions */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {soldOut ? (
                <button
                  disabled
                  className="flex-1 cursor-not-allowed rounded-full bg-surface-2 px-8 py-3.5 font-medium text-muted"
                >
                  Sold out
                </button>
              ) : !cartItem ? (
                <button
                  onClick={handleAdd}
                  className="flex-1 rounded-full bg-accent-solid px-8 py-3.5 font-medium text-white transition-colors hover:bg-accent-strong"
                >
                  Add to Cart
                </button>
              ) : (
                <div className="flex flex-1 items-center justify-between rounded-full border border-border px-6 py-2.5">
                  <button
                    aria-label="Decrease quantity"
                    onClick={() => {
                      decreaseQty(cartId);
                      toast.success(
                        quantity === 1 ? "Removed from cart!" : "Quantity reduced"
                      );
                    }}
                    className="text-lg"
                  >
                    −
                  </button>
                  <span className="font-medium">{quantity}</span>
                  <button
                    aria-label="Increase quantity"
                    onClick={() => {
                      increaseQty(cartId);
                      toast.success("Quantity updated");
                    }}
                    className="text-lg"
                  >
                    +
                  </button>
                </div>
              )}

              {!soldOut && (
                <button
                  onClick={buyNow}
                  className="flex-1 rounded-full border border-accent px-8 py-3.5 font-medium text-accent transition-colors hover:bg-accent-soft"
                >
                  Buy Now
                </button>
              )}
            </div>

            {/* Trust badges */}
            <div className="mt-9 grid grid-cols-1 gap-3 rounded-2xl border border-border bg-surface p-5 sm:grid-cols-3">
              <Badge icon={Truck} title="Fast delivery" sub="Nationwide" />
              <Badge icon={RotateCcw} title="7-day returns" sub="Hassle-free" />
              <Badge icon={ShieldCheck} title="Secure checkout" sub="Paystack" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function Badge({
  icon: Icon,
  title,
  sub,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  sub: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon size={20} className="text-accent" />
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted">{sub}</p>
      </div>
    </div>
  );
}
