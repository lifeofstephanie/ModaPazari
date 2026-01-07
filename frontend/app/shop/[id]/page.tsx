"use client";

import { CLOTHES_DATA, ClothesItem } from "@/data/constants";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
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
      <main className="flex items-center justify-center h-screen text-xl">
        Product not found.
      </main>
    );
  }

  const cartId = `${product.id}-${selectedColor}-${selectedSize}`;
  const cartItem = items.find((i) => i.cartId === cartId);
  const quantity = cartItem?.quantity ?? 1;

  const handleAdd = () => {
    if (!product) return;
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
    <section className="bg-linear-to-b from-[#e0ebf5] to-white py-24 px-6 md:px-16">
      <button onClick={() => router.back()} className="mb-6">
        <ArrowLeft size={20} />
      </button>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20">
        {/* Image */}
        <div className="flex flex-col items-center">
          <div className="relative w-full max-w-md rounded-[28px] border-[6px] border-[#7A2048] bg-white p-4">
            <img
              src={mainImage}
              alt={product.name}
              className="w-full rounded-[20px]"
            />
          </div>
          <div className="mt-6 flex gap-4">
            {product.thumbnails.map((thumb, i) => (
              <button key={i} onClick={() => setMainImage(thumb)}>
                <img
                  src={thumb}
                  className="w-24 h-24 object-cover rounded-xl"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-col justify-center max-w-xl">
          <h1 className="text-4xl font-serif text-[#7A2048] mb-6">
            {product.name}
          </h1>
          <p className="mb-6">{product.description}</p>
          <p className="text-2xl font-semibold mb-8">
            {product.currency}
            {product.price}
          </p>

          {/* Color & Size */}
          {product.colors && (
            <div className="mb-4 flex gap-2">
              {product.colors.map((color) => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded-full ${
                    selectedColor === color
                      ? "ring-2 ring-[#7A2048]"
                      : "border border-gray-300"
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </div>
          )}
          {product.sizes && (
            <div className="mb-4 flex gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  className={`px-4 py-1 rounded-full ${
                    selectedSize === size
                      ? "bg-[#7A2048] text-white"
                      : "border border-[#7A2048]"
                  }`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          )}

          <div className="flex gap-3 mt-4 md:mt-0">
            {!cartItem ? (
              <button
                onClick={handleAdd}
                className="px-8 py-3 rounded-full bg-[#7A2048] text-white md:w-[49%] w-full cursor-pointer"
              >
                Add to Cart
              </button>
            ) : (
              <div className="flex items-center gap-4 border rounded-full px-8 py-2 md:w-[49%] w-full cursor-pointer justify-between">
                <button
                  onClick={() => {
                    decreaseQty(cartId);
                    if (quantity === 1) {
                      toast.success("Removed from cart!");
                    } else {
                      toast.success("Quantity Reduced");
                    }
                  }}
                >
                  −
                </button>
                <span>{quantity}</span>
                <button
                  onClick={() => {
                    increaseQty(cartId);

                    toast.success("Quantity Updated");
                  }}
                >
                  +
                </button>
              </div>
            )}

            {/* Buy Now */}
            <button
              onClick={handleAdd}
              className="mt-0 px-8 py-3 rounded-full border border-[#7A2048] md:w-[49%] w-full cursor-pointer"
            >
              Buy Now
            </button>
          </div>
          {/* Add / Quantity */}

          {product.arEnabled && showAR && product.overlayImage && (
            <CameraTryOn overlaySrc={product.overlayImage} />
          )}
          {product.arEnabled && !showAR && (
            <button
              onClick={() => setShowAR(true)}
              className="mt-4 px-8 py-3 rounded-full border border-[#7A2048]"
            >
              Try it on
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
