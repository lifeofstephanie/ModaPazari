"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Heart, RotateCcw, ShieldCheck, Star, Truck } from "lucide-react";
import Link from "next/link";
import { useCartStore, CartItem } from "@/store/useCartStore";
import {
  productService,
  reviewService,
  wishlistService,
  type ApiProduct,
  type ApiReview,
} from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
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
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [reviews, setReviews] = useState<ApiReview[]>([]);
  const [wishlisted, setWishlisted] = useState(false);
  const [related, setRelated] = useState<ApiProduct[]>([]);
  const [zoom, setZoom] = useState({ x: 50, y: 50 });

  const { items, addToCart, increaseQty, decreaseQty } = useCartStore();
  const user = useAuthStore((s) => s.user);

  const loadReviews = useCallback((pid: string) => {
    reviewService
      .getForProduct(pid)
      .then(({ data }) => setReviews(data))
      .catch(() => setReviews([]));
  }, []);

  useEffect(() => {
    if (!id) return;
    loadReviews(id);
  }, [id, loadReviews]);

  // "You may also like" — other approved products in the same department.
  useEffect(() => {
    if (!product?.department) return;
    productService
      .getFeed({ department: product.department, limit: 8 })
      .then(({ data }) =>
        setRelated(
          (data.items ?? []).filter((p) => p._id !== product._id).slice(0, 4)
        )
      )
      .catch(() => {});
  }, [product?.department, product?._id]);

  // Reflect whether this product is already in the user's wishlist.
  useEffect(() => {
    if (!user || !id) return;
    wishlistService
      .get()
      .then(({ data }) =>
        setWishlisted(!!data?.products?.some((p) => p._id === id))
      )
      .catch(() => {});
  }, [user, id]);

  const toggleWishlist = async () => {
    if (!user) {
      toast.error("Please sign in to save items");
      return;
    }
    try {
      if (wishlisted) {
        setWishlisted(false);
        await wishlistService.remove(id);
        toast.success("Removed from wishlist");
      } else {
        setWishlisted(true);
        await wishlistService.add(id);
        toast.success("Saved to wishlist");
      }
    } catch {
      setWishlisted((w) => !w); // revert on failure
    }
  };

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const { data } = await productService.getById(id);
        if (!active) return;
        setProduct(data);
        setMainImage(data.images?.[0] || FALLBACK_IMG);
        setSelectedColor(data.colors?.[0] ?? "");
        // Default to the first in-stock size, if the product is sized.
        const firstInStock = data.variants?.find((v) => v.stock > 0);
        setSelectedSize(firstInStock?.size ?? "");
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

  const hasColors = !!product.colors && product.colors.length > 0;
  const hasSizes = !!product.variants && product.variants.length > 0;
  const activeColor = hasColors ? selectedColor : "";
  const activeSize = hasSizes ? selectedSize : "";

  const selectedVariant = hasSizes
    ? product.variants!.find((v) => v.size === selectedSize)
    : undefined;

  // Availability: for sized products, the selected size's stock; else flat stock.
  const availableStock = hasSizes ? selectedVariant?.stock ?? 0 : product.stock;
  const soldOut = hasSizes
    ? product.variants!.every((v) => v.stock <= 0)
    : product.stock === 0;

  // Synthetic id for a brand-new guest line; the server assigns real ids once
  // logged in. Matching for an existing line is by variant, not this id.
  const cartId = `${product._id}-${activeColor}-${activeSize}`;
  const cartItem = items.find(
    (i) =>
      i.productId === product._id &&
      i.color === activeColor &&
      i.size === activeSize
  );
  const quantity = cartItem?.quantity ?? 1;
  const gallery = product.images?.length ? product.images : [FALLBACK_IMG];

  const stockBadge = soldOut
    ? { label: "Out of stock", cls: "bg-red-500/10 text-red-500" }
    : hasSizes && !selectedSize
      ? { label: "Select a size", cls: "bg-foreground/5 text-muted" }
      : availableStock <= 5
        ? {
            label: `Only ${availableStock} left`,
            cls: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
          }
        : {
            label: "In stock",
            cls: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
          };

  const handleAdd = () => {
    if (hasSizes && !selectedSize) {
      toast.error("Please select a size");
      return;
    }
    if (availableStock <= 0) {
      toast.error("That option is out of stock");
      return;
    }
    const newItem: CartItem = {
      cartId,
      productId: product._id,
      title: product.name,
      price: product.price,
      imageUrl: mainImage,
      quantity: 1,
      color: selectedColor,
      size: activeSize,
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
            <div className="flex flex-col-reverse gap-4 lg:flex-row">
              {/* Thumbnails — vertical rail on desktop, horizontal scroll on mobile */}
              {gallery.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
                  {gallery.map((thumb, i) => (
                    <button
                      key={i}
                      onClick={() => setMainImage(thumb)}
                      onMouseEnter={() => setMainImage(thumb)}
                      className={`shrink-0 overflow-hidden rounded-xl border-2 transition-colors ${
                        mainImage === thumb
                          ? "border-accent"
                          : "border-border hover:border-accent/50"
                      }`}
                    >
                      <img
                        src={thumb}
                        className="h-16 w-16 object-cover lg:h-20 lg:w-20"
                        alt=""
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Main image with cursor-following zoom on hover */}
              <div
                className="group relative flex-1 cursor-zoom-in overflow-hidden rounded-3xl border border-border bg-surface"
                onMouseMove={(e) => {
                  const r = e.currentTarget.getBoundingClientRect();
                  setZoom({
                    x: ((e.clientX - r.left) / r.width) * 100,
                    y: ((e.clientY - r.top) / r.height) * 100,
                  });
                }}
              >
                <img
                  src={mainImage}
                  alt={product.name}
                  style={{ transformOrigin: `${zoom.x}% ${zoom.y}%` }}
                  className="aspect-[4/5] w-full object-cover transition-transform duration-200 group-hover:scale-[1.8]"
                />
              </div>
            </div>
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

            {/* Rating */}
            <a
              href="#reviews"
              className="mt-3 flex w-fit items-center gap-2 text-sm"
            >
              <span className="flex">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    size={16}
                    className={
                      n <= Math.round(avgRating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-border"
                    }
                  />
                ))}
              </span>
              <span className="text-muted transition-colors hover:text-accent">
                {reviews.length > 0
                  ? `${avgRating.toFixed(1)} · ${reviews.length} review${reviews.length === 1 ? "" : "s"}`
                  : "No reviews yet"}
              </span>
            </a>

            <p className="mt-4 text-3xl font-bold">{naira(product.price)}</p>
            <p className="mt-1 text-xs text-muted">
              VAT &amp; shipping calculated at checkout
            </p>

            {/* Stock badge */}
            <span
              className={`mt-4 inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium ${stockBadge.cls}`}
            >
              {stockBadge.label}
            </span>

            <div className="my-7 h-px w-full bg-border" />

            <p className="leading-relaxed text-muted">{product.description}</p>

            {/* Colours */}
            {hasColors && (
              <div className="mt-7">
                <p className="mb-3 text-sm font-medium">
                  Colour
                  {selectedColor && (
                    <span className="ml-2 font-normal text-muted">
                      {selectedColor}
                    </span>
                  )}
                </p>
                <div className="flex flex-wrap gap-3">
                  {product.colors!.map((color) => (
                    <button
                      key={color}
                      aria-label={color}
                      title={color}
                      onClick={() => setSelectedColor(color)}
                      className={`h-9 w-9 rounded-full transition-transform hover:scale-110 ${
                        selectedColor === color
                          ? "ring-2 ring-accent ring-offset-2 ring-offset-background"
                          : "border border-border"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {hasSizes && (
              <div className="mt-7">
                <p className="mb-3 text-sm font-medium">Size</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants!.map((v) => {
                    const out = v.stock <= 0;
                    const active = selectedSize === v.size;
                    return (
                      <button
                        key={v.size}
                        disabled={out}
                        onClick={() => setSelectedSize(v.size)}
                        className={`min-w-11 rounded-md border px-3 py-2 text-sm transition-colors ${
                          active
                            ? "border-accent bg-accent-soft text-accent"
                            : "border-border hover:border-accent"
                        } ${out ? "cursor-not-allowed text-muted line-through opacity-50" : ""}`}
                      >
                        {v.size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

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
                <div className="flex flex-1 items-center justify-between rounded-full border border-accent px-4 py-1.5 text-accent">
                  <button
                    aria-label="Decrease quantity"
                    onClick={() => {
                      decreaseQty(cartItem.cartId);
                      toast.success(
                        quantity === 1 ? "Removed from cart!" : "Quantity reduced"
                      );
                    }}
                    className="grid h-9 w-9 place-items-center rounded-full text-xl leading-none transition-colors hover:bg-accent-soft"
                  >
                    −
                  </button>
                  <span className="font-semibold text-foreground">{quantity}</span>
                  <button
                    aria-label="Increase quantity"
                    onClick={() => {
                      increaseQty(cartItem.cartId);
                      toast.success("Quantity updated");
                    }}
                    className="grid h-9 w-9 place-items-center rounded-full text-xl leading-none transition-colors hover:bg-accent-soft"
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

              <button
                onClick={toggleWishlist}
                aria-label="Save to wishlist"
                className={`grid h-[52px] w-[52px] shrink-0 place-items-center rounded-full border transition-colors ${
                  wishlisted
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-border text-muted hover:border-accent hover:text-accent"
                }`}
              >
                <Heart size={20} fill={wishlisted ? "currentColor" : "none"} />
              </button>
            </div>

            {/* Trust badges */}
            <div className="mt-9 grid grid-cols-1 gap-3 rounded-2xl border border-border bg-surface p-5 sm:grid-cols-3">
              <Badge icon={Truck} title="Fast delivery" sub="Nationwide" />
              <Badge icon={RotateCcw} title="7-day returns" sub="Hassle-free" />
              <Badge icon={ShieldCheck} title="Secure checkout" sub="Paystack" />
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div id="reviews" className="scroll-mt-24">
          <ReviewsSection
            productId={id}
            reviews={reviews}
            avg={avgRating}
            canReview={!!user}
            onAdded={() => loadReviews(id)}
          />
        </div>

        {/* You may also like */}
        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-6 text-xl font-semibold tracking-tight">
              You may also like
            </h2>
            <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
              {related.map((p) => (
                <Link key={p._id} href={`/shop/${p._id}`} className="group">
                  <div className="aspect-[3/4] overflow-hidden rounded-2xl border border-border bg-surface">
                    <img
                      src={p.images?.[0] || FALLBACK_IMG}
                      alt={p.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <p className="mt-2 truncate text-sm font-medium transition-colors group-hover:text-accent">
                    {p.name}
                  </p>
                  <p className="text-sm text-accent">{naira(p.price)}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
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

const Stars = ({ value, size = 14 }: { value: number; size?: number }) => (
  <span className="inline-flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <Star
        key={n}
        size={size}
        className={n <= Math.round(value) ? "text-amber-400" : "text-border"}
        fill={n <= Math.round(value) ? "currentColor" : "none"}
      />
    ))}
  </span>
);

const reviewerName = (u: ApiReview["user"]) => {
  if (!u || typeof u === "string") return "Customer";
  return [u.firstName, u.lastName].filter(Boolean).join(" ") || "Customer";
};

function ReviewsSection({
  productId,
  reviews,
  avg,
  canReview,
  onAdded,
}: {
  productId: string;
  reviews: ApiReview[];
  avg: number;
  canReview: boolean;
  onAdded: () => void;
}) {
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await reviewService.create(productId, { rating, comment: comment.trim() });
      setComment("");
      setRating(5);
      toast.success("Review posted");
      onAdded();
    } catch {
      /* interceptor toasts */
    } finally {
      setSubmitting(false);
    }
  };

  const fmt = (d?: string) =>
    d
      ? new Date(d).toLocaleDateString("en-NG", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "";
  const initials = (name: string) =>
    name
      .split(" ")
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";

  return (
    <section className="mt-16 border-t border-border pt-10">
      <h2 className="text-2xl font-semibold tracking-tight">Customer reviews</h2>

      {/* Rating summary */}
      {reviews.length > 0 && (
        <div className="mt-6 grid max-w-2xl gap-6 rounded-2xl border border-border bg-card p-6 sm:grid-cols-[auto_1fr] sm:items-center sm:gap-10">
          <div className="text-center sm:border-r sm:border-border sm:pr-10">
            <p className="text-5xl font-bold leading-none">{avg.toFixed(1)}</p>
            <div className="mt-2 flex justify-center">
              <Stars value={avg} />
            </div>
            <p className="mt-1.5 text-xs text-muted">
              {reviews.length} review{reviews.length === 1 ? "" : "s"}
            </p>
          </div>
          <div className="space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviews.filter(
                (r) => Math.round(r.rating) === star
              ).length;
              const pct = reviews.length ? (count / reviews.length) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-xs">
                  <span className="flex w-6 items-center gap-0.5 text-muted">
                    {star}
                    <Star size={11} className="text-amber-400" fill="currentColor" />
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
                    <div
                      className="h-full rounded-full bg-amber-400 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-5 text-right text-muted">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Write a review */}
      {canReview ? (
        <form
          onSubmit={submit}
          className="mt-6 max-w-2xl rounded-2xl border border-border bg-card p-5"
        >
          <p className="mb-3 text-sm font-medium">Write a review</p>
          <div
            className="mb-3 flex items-center gap-1"
            onMouseLeave={() => setHover(0)}
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                onMouseEnter={() => setHover(n)}
                aria-label={`${n} star`}
                className="transition-transform hover:scale-110"
              >
                <Star
                  size={24}
                  className={
                    n <= (hover || rating) ? "text-amber-400" : "text-border"
                  }
                  fill={n <= (hover || rating) ? "currentColor" : "none"}
                />
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share what you liked (fit, quality, delivery)…"
            rows={3}
            className="w-full resize-none rounded-lg border border-border bg-background p-3 text-sm outline-none transition-colors focus:border-accent"
          />
          <button
            type="submit"
            disabled={submitting}
            className="mt-3 rounded-full bg-accent-solid px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-strong disabled:opacity-60"
          >
            {submitting ? "Posting…" : "Post review"}
          </button>
        </form>
      ) : (
        <div className="mt-6 max-w-2xl rounded-2xl border border-dashed border-border p-5 text-sm text-muted">
          <Link href="/login" className="font-medium text-accent hover:underline">
            Sign in
          </Link>{" "}
          to share your review.
        </div>
      )}

      {/* Review list */}
      <div className="mt-8 space-y-4">
        {reviews.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border py-10 text-center text-sm text-muted">
            No reviews yet — be the first to review this product.
          </p>
        ) : (
          reviews.map((r) => {
            const name = reviewerName(r.user);
            return (
              <div
                key={r._id}
                className="rounded-2xl border border-border bg-card p-5"
              >
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent-soft text-sm font-semibold text-accent">
                    {initials(name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium">{name}</p>
                        <p className="text-xs text-muted">{fmt(r.createdAt)}</p>
                      </div>
                      <Stars value={r.rating} />
                    </div>
                    {r.comment && (
                      <p className="mt-2 text-sm leading-relaxed text-muted">
                        {r.comment}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
