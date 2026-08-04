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

  const { items, loadCart } = useCartStore();
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
            aria-label="Toggle menu"
            className={onPhoto ? "text-white" : "text-foreground"}
          >
            {menuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <div
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
        className={`fixed top-0 right-0 z-50 h-full w-[85%] overflow-auto border-l border-border bg-card shadow-xl transition-transform duration-500 md:w-1/3 ${
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
                  className="h-28 w-28 rounded-lg object-cover"
                  loading="lazy"
                />
                <div className="flex-1">
                  <p className="text-accent">{item.title}</p>
                  <p className="text-sm text-muted">{item.quantity}x</p>
                  {(item.color || item.size) && (
                    <p className="text-sm text-muted">
                      {[item.color, item.size].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  <p className="text-accent">
                    ₦{Number(item.price).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => {
                    useCartStore.getState().removeItem(item.cartId);
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
          <div className="space-y-4 border-t border-border p-4">
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
