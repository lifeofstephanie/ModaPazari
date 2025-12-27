"use client";

import { CLOTHES_DATA, ClothesItem } from "@/data/constants";
import { MouseEvent, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ARViewer from "@/components/ARViewer";
import CameraTryOn from "@/components/ARViewer";
// import { useRouter } from "next/router";

export default function ProductDetails() {
  const params = useParams();
  const id = Number(params?.id);
  const router = useRouter();
  const [quantity, setQuantity] = useState<number>(1);
  const [showAR, setShowAR] = useState(false);

  const product: ClothesItem | undefined = CLOTHES_DATA.find(
    (item) => item.id === id
  );

  const [mainImage, setMainImage] = useState(product?.img || "");

  const [selectedColor, setSelectedColor] = useState(
    product?.colors?.[0] || ""
  );

  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || "");

  const incrementQuantity = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setQuantity((q) => q + 1);
  };

  const decrementQuantity = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setQuantity((q) => (q > 1 ? q - 1 : 1));
  };
  // const handleContinueShopping = () => {
  //   router.push("/shop");
  // };

  const handleCheckout = () => {
    router.push("/cart");
  };

  const handleAddToCart = () => {
    if (!product) return;

    const cartData = localStorage.getItem("myCart");
    const currentCart = cartData ? JSON.parse(cartData) : [];

    // Find if item already exists in cart (same product, color, and size)
    const existingItem = currentCart.find(
      (item) =>
        item.id === product.id &&
        item.color === selectedColor &&
        item.size === selectedSize
    );

    if (existingItem) {
      // Update quantity if already in cart
      const updatedCart = currentCart.map((item) =>
        item.cartId === existingItem.cartId
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
      localStorage.setItem("myCart", JSON.stringify(updatedCart));
    } else {
      // Generate stable cart ID here (impure function called inside event handler — safe)
      const newItem = {
        cartId: `${product.id}-${selectedColor}-${selectedSize}`,
        id: product.id,
        title: product.name,
        price: product.price,
        imageUrl: mainImage,
        quantity,
        color: selectedColor,
        size: selectedSize,
      };
      localStorage.setItem("myCart", JSON.stringify([...currentCart, newItem]));
    }
  };
  if (!product) {
    return (
      <main className="flex items-center justify-center h-screen text-xl font-semibold text-gray-600">
        Product not found.
      </main>
    );
  }

  return (
    <section className="bg-linear-to-b from-[#e0ebf5] to-white py-24 px-6 md:px-16">
      <button
        onClick={() => router.back()}
        className="mb-6 w-fit text-sm text-[#7A2048] underline hover:opacity-70 cursor-pointer"
      >
        <ArrowLeft size={20} />
      </button>
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20">
        {/* LEFT — Image Section */}
        <div className="flex flex-col items-center">
          <div className="relative w-full max-w-md rounded-[28px] border-[6px] border-[#7A2048] bg-white p-4">
            <img
              src={mainImage}
              alt={product.name}
              className="w-full h-auto object-cover rounded-[20px]"
            />
          </div>

          <div className="mt-6 flex gap-4">
            {product.thumbnails.map((thumb, index) => (
              <button
                key={index}
                onClick={() => setMainImage(thumb)}
                className={`relative rounded-xl overflow-hidden border transition ${
                  mainImage === thumb
                    ? "border-[#7A2048]"
                    : "border-transparent"
                }`}
              >
                <img
                  src={thumb}
                  alt={`${product.name} thumbnail ${index + 1}`}
                  className="w-24 h-24 object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-center max-w-xl">
          <h1 className="text-4xl lg:text-5xl font-serif text-[#7A2048] leading-tight mb-6">
            {product.name}
          </h1>

          <p className="text-gray-700 text-base leading-relaxed mb-6">
            {product.description}
          </p>

          <p className="text-2xl font-semibold text-[#7A2048] mb-8">
            {product.price}
          </p>
          {product.colors && product.colors.length > 0 && (
            <div className="mb-8">
              <p className="text-sm text-[#7A2048] mb-3">Color</p>
              <div className="flex gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-9 h-9 rounded-full border transition ${
                      selectedColor === color
                        ? "ring-2 ring-[#7A2048] ring-offset-2"
                        : "border-gray-300"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          )}

          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-10">
              <p className="text-sm text-[#7A2048] mb-3">Size</p>
              <div className="flex gap-3 flex-wrap">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-5 py-2 rounded-full border text-sm transition ${
                      selectedSize === size
                        ? "bg-[#7A2048] text-white border-[#7A2048]"
                        : "border-[#7A2048] text-[#7A2048] hover:bg-[#f1efe6]"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-4">
            <button
              className="px-8 py-3 rounded-full bg-[#7A2048] text-white hover:bg-[#0c3024] transition"
              onClick={handleAddToCart}
            >
              Add to Cart
            </button>
            <button className="px-8 py-3 rounded-full border border-[#7A2048] text-[#7A2048] hover:bg-[#f1efe6] transition">
              Buy Now
            </button>
          </div>
          {product.arEnabled && (
            <>
              <button
                onClick={() => setShowAR(true)}
                className="px-8 py-3 rounded-full border border-[#7A2048] text-[#7A2048] hover:bg-[#f1efe6] transition mt-10"
              >
                Try it on
              </button>

              {showAR && product.overlayImage && (
                <CameraTryOn overlaySrc={product.overlayImage} />
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
