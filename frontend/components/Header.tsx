"use client";
import { Handbag, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export const Header = ({ isOverlay = false }) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState(2);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const bgClass = scrolled
    ? "bg-white/70 backdrop-blur-md shadow-sm"
    : isOverlay
    ? "bg-transparent"
    : menuOpen === true
    ? "#fff"
    : "bg-[#e0ebf5]";

  const textColorClass = isOverlay && !scrolled ? "text-[#fff]" : "text-black";

  return (
    <>
      {/* HEADER */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 h-20 w-full px-5 flex items-center justify-between
        transition-colors duration-500 ${bgClass}`}
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
              className={`transition-all duration-500 `}
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
            {cartItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {cartItems}
              </span>
            )}
          </div>
        </ul>

        {/* MOBILE BUTTONS */}
        <div className="md:hidden flex gap-5 items-center">
          <div
            onClick={() => setCartOpen(true)}
            className={`relative h-[30px] w-[30px] rounded-full flex items-center justify-center cursor-pointer
           bg-white text-black `}
          >
            <Handbag size={18} />
            {cartItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {cartItems}
              </span>
            )}
          </div>

          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className={`transition-colors text-black`}
          >
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <div
        className={`fixed top-0 left-0 right-0 z-40 md:hidden bg-white pt-20
        transition-transform duration-500 ease-in-out
        ${menuOpen ? "translate-y-0" : "-translate-y-full"}`}
      >
        <ul className="flex flex-col gap-6 px-6 py-8 text-sm text-black">
          <Link href={"/shop"}>
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
        transition-transform duration-500
        ${cartOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex justify-between items-center p-4 border-b border-[#7A2048]">
          <h2 className="text-lg font-semibold text-[#7A2048]">
            My Shopping Cart
          </h2>
          <button onClick={() => setCartOpen(false)}>
            <X size={24} />
          </button>
        </div>
        <div className="flex-1 p-4 overflow-y-auto">
          <p>Item 1</p>
          <p>Item 2</p>
        </div>
      </div>
    </>
  );
};
