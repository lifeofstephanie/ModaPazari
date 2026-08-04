"use client";

import { CLOTHES_DATA, ClothesItem } from "@/data/constants";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Truck,
} from "lucide-react";
import Link from "next/link";
import CameraTryOn from "@/components/ARViewer";
import { useCartStore, CartItem } from "@/store/useCartStore";
import toast from "react-hot-toast";

export default function ProductDetails() {
  const params = useParams();
  const id = Number(params?.id);
  const router = useRouter();

  const product: ClothesItem | undefined = CLOTHES_DATA.find(
    (item) => item.id === id
  );

  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [mainImage, setMainImage] = useState("");
  const [showAR, setShowAR] = useState(false);

  const { items, addToCart, increaseQty, decreaseQty, loadCart } =
    useCartStore();

  useEffect(() => {
    if (!product) return;
    setSelectedColor(product.colors?.[0] ?? "");
    setSelectedSize(product.sizes?.[0] ?? "");
    setMainImage(product.img ?? "");
  }, [product]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  if (!product) {
    return (
      <main className="flex h-screen items-center justify-center bg-background text-xl">
        Product not found.
      </main>
    );
  }

  const cartId = `${product.id}-${selectedColor}-${selectedSize}`;
  const cartItem = items.find((i) => i.cartId === cartId);
  const quantity = cartItem?.quantity ?? 1;

  const handleAdd = () => {
    const newItem: CartItem = {
      cartId,
      id: product.id,
      title: product.name,
      price: product.price,
      imageUrl: mainImage,
      quantity: 1,
      color: selectedColor,
      size: selectedSize,
      currency: product.currency,
    };
    addToCart(newItem);
    toast.success("Added to cart!");
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
          {/* -------- Gallery -------- */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="overflow-hidden rounded-3xl border border-border bg-surface">
              <img
                src={mainImage}
                alt={product.name}
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
            <div className="mt-4 flex gap-3">
              {product.thumbnails.map((thumb, i) => (
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
          </div>

          {/* -------- Details -------- */}
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-[0.2em] text-muted">
              {product.category}
            </span>
            <h1 className="mt-2 font-serif text-4xl italic text-accent md:text-5xl">
              {product.name}
            </h1>
            <p className="mt-4 text-3xl font-semibold">
              {product.currency}
              {product.price}
            </p>

            <div className="my-7 h-px w-full bg-border" />

            <p className="leading-relaxed text-muted">{product.description}</p>

            {/* Colours */}
            {product.colors && (
              <div className="mt-7">
                <p className="mb-3 text-sm font-medium">
                  Colour
                  <span className="ml-2 text-muted">{selectedColor}</span>
                </p>
                <div className="flex gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      aria-label={color}
                      className={`h-9 w-9 rounded-full transition-transform hover:scale-110 ${
                        selectedColor === color
                          ? "ring-2 ring-accent ring-offset-2 ring-offset-background"
                          : "border border-border"
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedColor(color)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes && (
              <div className="mt-6">
                <p className="mb-3 text-sm font-medium">Size</p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      className={`min-w-12 rounded-full px-4 py-2 text-sm transition-colors ${
                        selectedSize === size
                          ? "bg-accent-solid text-white"
                          : "border border-border hover:border-accent"
                      }`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {!cartItem ? (
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

              <button
                onClick={handleAdd}
                className="flex-1 rounded-full border border-accent px-8 py-3.5 font-medium text-accent transition-colors hover:bg-accent-soft"
              >
                Buy Now
              </button>
            </div>

            {/* AR try-on */}
            {product.arEnabled && !showAR && (
              <button
                onClick={() => setShowAR(true)}
                className="mt-3 inline-flex items-center justify-center gap-2 rounded-full border border-border px-8 py-3.5 font-medium transition-colors hover:border-accent hover:text-accent"
              >
                <Sparkles size={16} /> Try it on
              </button>
            )}
            {product.arEnabled && showAR && product.overlayImage && (
              <CameraTryOn overlaySrc={product.overlayImage} />
            )}

            {/* Trust badges */}
            <div className="mt-9 grid grid-cols-1 gap-3 rounded-2xl border border-border bg-surface p-5 sm:grid-cols-3">
              <Badge icon={Truck} title="Free delivery" sub="Orders over $100" />
              <Badge icon={RotateCcw} title="7-day returns" sub="Hassle-free" />
              <Badge icon={ShieldCheck} title="Secure checkout" sub="SSL encrypted" />
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
