"use client";
import { Handbag, Menu, Trash2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useCartStore } from "@/store/useCartStore";
import toast from "react-hot-toast";

export const Header = ({ isOverlay = false }) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const { items, loadCart } = useCartStore();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const textColorClass = isOverlay && !scrolled ? "text-[#fff]" : "text-black";

  return (
    <>
      {/* HEADER */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 h-20 w-full px-5 flex items-center justify-between
        transition-colors duration-500 ${
          scrolled
            ? "bg-white/70 backdrop-blur-md shadow-sm"
            : isOverlay
            ? "bg-transparent"
            : "bg-[#e0ebf5]"
        }`}
      >
        {/* Desktop Left Menu */}
        <ul
          className={`hidden md:flex gap-3 items-center text-sm transition-colors duration-500 ${textColorClass}`}
        >
          <Link href={"/shop"}>
            <li className="cursor-pointer hover:text-[#7A2048]">SHOP</li>
          </Link>
          <Link href="/about">
            <li className="cursor-pointer hover:text-[#7A2048]">ABOUT</li>
          </Link>
          <Link href="/contact">
            <li className="cursor-pointer hover:text-[#7A2048]">CONTACT</li>
          </Link>
          <li className="cursor-pointer hover:text-[#7A2048]">HELP CENTER</li>
        </ul>

        {/* LOGO */}
        <div
          className={`w-[500px] h-20 flex items-center justify-center transition-all duration-500
          ${
            scrolled
              ? "bg-transparent scale-90"
              : isOverlay
              ? "bg-transparent"
              : "bg-white"
          }
          [clip-path:polygon(0%_0%,100%_0%,80%_100%,20%_100%)]`}
        >
          <Link href="/">
            <Image
              src="/images/Moda2.png"
              alt="logo"
              width={200}
              height={50}
              className="transition-all duration-500"
            />
          </Link>
        </div>

        {/* RIGHT ICONS (DESKTOP) */}
        <ul
          className={`hidden md:flex gap-3 items-center text-sm transition-colors duration-500 ${textColorClass}`}
        >
          <li className="cursor-pointer hover:text-[#7A2048]">SEASONAL</li>
          <li className="cursor-pointer hover:text-[#7A2048]">ACCESSORIES</li>

          <Link href="/login">
            <div className="p-2 rounded-2xl bg-black text-white text-xs hover:bg-[#7A2048] cursor-pointer">
              SIGN IN / UP
            </div>
          </Link>

          {/* Cart Icon */}
          <div
            onClick={() => setCartOpen(true)}
            className={`relative h-[30px] w-[30px] rounded-full flex items-center justify-center cursor-pointer border transition-colors
            ${
              isOverlay && !scrolled
                ? "bg-white text-black border-white"
                : "bg-black text-white border-black"
            }`}
          >
            <Handbag size={18} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </div>
        </ul>

        {/* MOBILE BUTTONS */}
        <div className="md:hidden flex gap-5 items-center">
          <div
            onClick={() => setCartOpen(true)}
            className="relative h-[30px] w-[30px] rounded-full flex items-center justify-center cursor-pointer bg-white text-black"
          >
            <Handbag size={18} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </div>

          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="transition-colors text-black"
          >
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <div
        className={`fixed top-0 left-0 right-0 z-40 md:hidden bg-white pt-20
        transition-transform duration-500 ease-in-out ${
          menuOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <ul className="flex flex-col gap-6 px-6 py-8 text-sm text-black">
          <Link href={"/shop"} onClick={() => setMenuOpen(false)}>
            <li className="hover:text-[#7A2048]">SHOP</li>
          </Link>
          <Link href="/about" onClick={() => setMenuOpen(false)}>
            <li className="hover:text-[#7A2048]">ABOUT</li>
          </Link>
          <Link href="/contact" onClick={() => setMenuOpen(false)}>
            <li className="hover:text-[#7A2048]">CONTACT</li>
          </Link>
          <li className="hover:text-[#7A2048]">HELP CENTER</li>
          <li className="hover:text-[#7A2048]">SEASONAL</li>
          <li className="hover:text-[#7A2048]">ACCESSORIES</li>
          <Link href="/login" onClick={() => setMenuOpen(false)}>
            <div className="mt-4 p-3 text-center rounded-xl bg-black text-white text-xs">
              SIGN IN / UP
            </div>
          </Link>
        </ul>
      </div>

      {/* CART DRAWER */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-[80%] md:w-1/3 bg-white shadow-lg
  transition-transform duration-500 ${
    cartOpen ? "translate-x-0" : "translate-x-full"
  }`}
      >
        {/* CART HEADER */}
        <div className="flex justify-between items-center p-4 ">
          <div className="flex items-center gap-4">
            <h2 className="font-[MomoSignature] text-[#7A2048] text-xl md:text-3xl lg:text-4xl">
              Cart
            </h2>
            {/* <button
              onClick={() => {
                if (confirm("Are you sure you want to clear the cart?")) {
                  useCartStore.getState().removeItem(""); // clear all
                }
              }}
              className="text-black hover:text-red-700"
            >
              <Trash2 size={20} />
            </button> */}
          </div>

          <div className="flex gap-2">
            {/* Clear Cart Button */}

            {/* Close Cart */}
            <button onClick={() => setCartOpen(false)}>
              <X size={24} />
            </button>
          </div>
        </div>

        {/* CART ITEMS */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 md:mt-5">
          {items.length === 0 ? (
            <p>Your cart is empty</p>
          ) : (
            items.map((item) => (
              <div key={item.cartId} className="flex gap-4  pb-4 relative">
                <img
                  src={item.imageUrl}
                  className="w-30 h-30 object-cover rounded"
                />
                <div className="flex-1">
                  <p className="text-lg text-[#7a2048]">
                    {item.title} ({item.quantity})
                  </p>
                  <p className="text-sm text-gray-500">
                    {item.color} · {item.size}
                  </p>
                  <p className="text-[#7a2048]">
                    {item.currency} {item.price}
                  </p>
                </div>

                {/* Delete single item */}
                <button
                  onClick={() => {
                    useCartStore.getState().removeItem(item.cartId);
                    toast.success("Item removed from cart");
                  }}
                  className="absolute top-0 right-0 mt-1 mr-1 text-black hover:text-red-700"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* CART FOOTER */}
        {items.length > 0 && (
          <div className="p-4 border-t border-[#7A2048] space-y-4 ">
            {/* Total Price */}
            <div className="flex justify-between text-lg font-semibold">
              <span>Total:</span>
              <span>
                $
                {items
                  .reduce((sum, item) => {
                    const priceNum = Number(item.price.replace(/[^0-9.]/g, ""));
                    return sum + priceNum * item.quantity;
                  }, 0)
                  .toLocaleString()}
              </span>
            </div>

            {/* Checkout Button */}
            <button className="w-full bg-[#7A2048] text-white py-3 rounded-md hover:bg-black transition">
              Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
};
