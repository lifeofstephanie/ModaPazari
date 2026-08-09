"use client";
import { Handbag, Menu, Trash2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useCartStore } from "@/store/useCartStore";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NotificationBell } from "@/components/NotificationBell";

const navLinks = [
  { label: "SHOP", href: "/shop" },
  { label: "ABOUT", href: "/about" },
  { label: "CONTACT", href: "/contact" },
  { label: "HELP CENTER", href: "/helpCenter" },
];

const navLinksRight = [
  { label: "SEASONAL", href: "/seasonal" },
  { label: "ACCESSORIES", href: "/accessories" },
];

export const Header = ({ isOverlay = false }) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const { items, loadCart, increaseQty, decreaseQty, removeItem } =
    useCartStore();
  const { user, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => setHydrated(true), 0);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (hydrated) loadCart();
  }, [loadCart, hydrated]);

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);

  // On an overlay hero (before scroll) links sit on a photo → force white.
  const onPhoto = isOverlay && !scrolled;
  const linkColor = onPhoto ? "text-white" : "text-foreground";

  return (
    <>
      {/* HEADER */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 flex h-20 w-full items-center justify-between px-5 transition-colors duration-500 ${
          scrolled
            ? "glass shadow-sm"
            : isOverlay
              ? "bg-transparent"
              : "bg-background border-b border-border"
        }`}
      >
        {/* Desktop Left Menu */}
        <ul
          className={`hidden items-center gap-4 text-xs tracking-wide transition-colors duration-500 md:flex lg:text-sm ${linkColor}`}
        >
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href}>
              <li className="cursor-pointer transition-colors hover:text-accent">
                {l.label}
              </li>
            </Link>
          ))}
        </ul>

        {/* LOGO */}
        <Link href="/" className="shrink-0">
          <Image
            src="/images/Moda2.png"
            alt="Moda Pazari"
            width={170}
            height={44}
            priority
            className={`h-10 w-auto object-contain transition-all duration-500 ${
              scrolled ? "scale-95" : ""
            } ${onPhoto ? "brightness-0 invert" : "dark:invert dark:brightness-95"}`}
          />
        </Link>

        {/* Desktop Right */}
        <ul
          className={`hidden items-center gap-4 text-xs tracking-wide transition-colors duration-500 md:flex lg:text-sm ${linkColor}`}
        >
          {navLinksRight.map((l) => (
            <Link key={l.href} href={l.href}>
              <li className="cursor-pointer transition-colors hover:text-accent">
                {l.label}
              </li>
            </Link>
          ))}

          {hydrated && user && (
            <Link href="/orders">
              <li className="cursor-pointer transition-colors hover:text-accent">
                ORDERS
              </li>
            </Link>
          )}
          {hydrated && user && (
            <Link href="/wishlist">
              <li className="cursor-pointer transition-colors hover:text-accent">
                WISHLIST
              </li>
            </Link>
          )}

          <NotificationBell />

          <ThemeToggle />

          {hydrated &&
            (!user ? (
              <Link href="/login">
                <div className="cursor-pointer rounded-full bg-accent-solid px-4 py-2 text-xs text-white transition-colors hover:bg-accent-strong">
                  SIGN IN / UP
                </div>
              </Link>
            ) : (
              <button
                onClick={() => {
                  logout();
                  loadCart(); // token gone -> reverts to the (empty) guest cart
                  router.push("/login");
                }}
                className="cursor-pointer rounded-full bg-accent-solid px-4 py-2 text-xs text-white transition-colors hover:bg-accent-strong"
              >
                LOGOUT
              </button>
            ))}

          {/* Cart */}
          <button
            onClick={() => setCartOpen(true)}
            aria-label="Open cart"
            className="relative grid h-9 w-9 place-items-center rounded-full border border-border text-foreground transition-colors hover:border-accent hover:text-accent"
          >
            <Handbag size={17} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 grid h-4 w-4 place-items-center rounded-full bg-accent-solid text-[10px] text-white">
                {cartCount}
              </span>
            )}
          </button>
        </ul>

        {/* MOBILE BUTTONS */}
        <div className="flex items-center gap-3 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setCartOpen(true)}
            aria-label="Open cart"
            className={`relative grid h-9 w-9 place-items-center rounded-full border transition-colors ${
              onPhoto
                ? "border-white text-white"
                : "border-border text-foreground"
            }`}
          >
            <Handbag size={17} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 grid h-4 w-4 place-items-center rounded-full bg-accent-solid text-[10px] text-white">
                {cartCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className={onPhoto ? "text-white" : "text-foreground"}
          >
            {menuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <div
        id="mobile-menu"
        className={`fixed left-0 right-0 top-0 z-40 bg-background pt-20 transition-transform duration-500 ease-in-out md:hidden ${
          menuOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <ul className="flex flex-col gap-6 px-6 py-8 text-sm text-foreground">
          {[...navLinks, ...navLinksRight].map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}>
              <li className="transition-colors hover:text-accent">{l.label}</li>
            </Link>
          ))}
          {hydrated && user && (
            <Link href="/orders" onClick={() => setMenuOpen(false)}>
              <li className="transition-colors hover:text-accent">MY ORDERS</li>
            </Link>
          )}
          {hydrated && !user && (
            <Link href="/login" onClick={() => setMenuOpen(false)}>
              <div className="w-fit rounded-full bg-accent-solid px-5 py-2 text-xs text-white">
                SIGN IN / UP
              </div>
            </Link>
          )}
        </ul>
      </div>

      {/* CART DRAWER */}
      {cartOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          onClick={() => setCartOpen(false)}
        />
      )}
      <div
        className={`fixed top-0 right-0 z-50 flex h-full w-[85%] flex-col overflow-hidden border-l border-border bg-card shadow-xl transition-transform duration-500 md:w-1/3 ${
          cartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="font-[MomoSignature] text-3xl text-accent md:text-4xl">
            Cart
          </h2>
          <button onClick={() => setCartOpen(false)} aria-label="Close cart">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {!hydrated ? null : items.length === 0 ? (
            <p className="mt-10 text-center text-muted">Your cart is empty</p>
          ) : (
            items.map((item) => (
              <div key={item.cartId} className="relative flex gap-4 border-b border-border pb-4">
                <img
                  src={item.imageUrl}
                  className="h-24 w-24 shrink-0 rounded-lg object-cover"
                  loading="lazy"
                />
                <div className="flex flex-1 flex-col">
                  <p className="pr-6 text-sm font-medium text-foreground">
                    {item.title}
                  </p>
                  {(item.color || item.size) && (
                    <p className="text-xs text-muted">
                      {[item.color, item.size].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  <p className="mt-0.5 font-semibold text-accent">
                    ₦{(Number(item.price) * item.quantity).toLocaleString()}
                  </p>

                  {/* Quantity stepper */}
                  <div className="mt-auto flex items-center gap-3 pt-2">
                    <div className="inline-flex items-center rounded-full border border-border">
                      <button
                        onClick={() => decreaseQty(item.cartId)}
                        aria-label="Decrease quantity"
                        className="grid h-7 w-7 place-items-center text-base leading-none text-muted transition-colors hover:text-accent"
                      >
                        −
                      </button>
                      <span className="min-w-6 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => increaseQty(item.cartId)}
                        aria-label="Increase quantity"
                        className="grid h-7 w-7 place-items-center text-base leading-none text-muted transition-colors hover:text-accent"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    removeItem(item.cartId);
                    toast.success("Item removed from cart");
                  }}
                  className="absolute top-0 right-0 text-muted transition-colors hover:text-red-600"
                  aria-label="Remove item"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="shrink-0 space-y-4 border-t border-border p-4">
            <div className="flex justify-between text-lg font-semibold">
              <span>Total:</span>
              <span>
                ₦
                {items
                  .reduce(
                    (sum, item) => sum + Number(item.price) * item.quantity,
                    0
                  )
                  .toLocaleString()}
              </span>
            </div>
            <Link
              href={user ? "/checkout" : "/login"}
              onClick={() => setCartOpen(false)}
            >
              <button className="w-full rounded-lg bg-accent-solid py-3 text-white transition-colors hover:bg-accent-strong">
                {user ? "Checkout" : "Sign in to checkout"}
              </button>
            </Link>
          </div>
        )}
      </div>
    </>
  );
};
