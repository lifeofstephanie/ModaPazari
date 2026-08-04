"use client";
import { categories } from "@/data/categories";
import { Products } from "@/data/products";
import { motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { TiltCard } from "@/components/TiltCard";

const img = (id: string, w = 800) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

const promos = [
  {
    title: "Where dreams meet couture",
    sub: "The Atelier Collection",
    photo: "1441984904996-e0b6ba687e04",
    href: "/seasonal",
  },
  {
    title: "Enchanting styles for every woman",
    sub: "Womenswear Edit",
    photo: "1483985988355-763728e1935b",
    href: "/shop",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

export const Categories = () => {
  const container = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateButtons = () => {
    const el = container.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  const scroll = (direction: "left" | "right") => {
    const el = container.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollTo({
      left: direction === "left" ? el.scrollLeft - amount : el.scrollLeft + amount,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    updateButtons();
    const el = container.current;
    if (!el) return;
    el.addEventListener("scroll", updateButtons);
    window.addEventListener("resize", updateButtons);
    return () => {
      el.removeEventListener("scroll", updateButtons);
      window.removeEventListener("resize", updateButtons);
    };
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-5 py-16 md:px-10">
      {/* ---------- Promo banners ---------- */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {promos.map((p) => (
          <Link key={p.title} href={p.href}>
            <div className="group relative flex h-52 items-end overflow-hidden rounded-2xl border border-border">
              <Image
                src={img(p.photo)}
                alt={p.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/35" />
              <div className="relative z-10 p-6 text-white">
                <p className="text-xs uppercase tracking-widest text-white/80">
                  {p.sub}
                </p>
                <h3 className="mt-1 max-w-xs text-2xl font-semibold">{p.title}</h3>
                <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium">
                  Shop now
                  <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* ---------- Shop by category ---------- */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        variants={fadeUp}
        viewport={{ once: true, margin: "-80px" }}
        className="mt-20"
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Shop by category
          </h2>
          <p className="max-w-xl text-muted">
            A carefully curated collection for every style and occasion.
          </p>
        </div>

        <div className="relative mt-10">
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              aria-label="Scroll left"
              className="glass absolute left-0 top-1/2 z-20 -translate-y-1/2 rounded-full p-2.5 text-accent shadow"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              aria-label="Scroll right"
              className="glass absolute right-0 top-1/2 z-20 -translate-y-1/2 rounded-full p-2.5 text-accent shadow"
            >
              <ChevronRight size={20} />
            </button>
          )}

          <div
            ref={container}
            className="no-scrollbar flex gap-5 overflow-x-auto scroll-smooth py-2 [perspective:1000px]"
          >
            {categories.map((category) => (
              <TiltCard
                key={category.id}
                max={9}
                className="min-w-[65%] rounded-2xl border border-border bg-surface p-6 md:min-w-[240px]"
              >
                <div className="flex h-32 items-center justify-center" style={{ transform: "translateZ(30px)" }}>
                  <img
                    src={category.image}
                    alt={category.name}
                    className="max-h-full w-auto object-contain"
                    loading="lazy"
                  />
                </div>
                <p className="mt-4 text-center text-sm font-medium capitalize">
                  {category.name}
                </p>
              </TiltCard>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ---------- Featured products ---------- */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        variants={fadeUp}
        viewport={{ once: true, margin: "-80px" }}
        className="mt-20"
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Featured products
          </h2>
          <p className="max-w-xl text-muted">
            Handpicked items from our latest collection, loved by our customers.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6 [perspective:1000px]">
          {Products.map((product) => (
            <TiltCard
              key={product.id}
              max={8}
              className="overflow-hidden rounded-2xl border border-border bg-card"
            >
              <div className="relative h-52 bg-surface">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-contain p-4"
                  loading="lazy"
                />
                {product.tag && (
                  <span
                    className="absolute left-3 top-3 rounded-full bg-accent-solid px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white"
                    style={{ transform: "translateZ(40px)" }}
                  >
                    {product.tag}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-2 p-4">
                <span className="text-xs uppercase tracking-wide text-muted">
                  {product.category}
                </span>
                <p className="text-sm font-semibold">{product.name}</p>
                <div className="flex items-center gap-2 font-semibold text-accent">
                  {product.discount && <span>{product.discount}</span>}
                  <span className={product.discount ? "text-muted line-through" : ""}>
                    {product.price}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted">
                  <Star size={13} className="fill-accent text-accent" />
                  {product.rating}
                </div>
              </div>
            </TiltCard>
          ))}
        </div>
      </motion.section>
    </div>
  );
};
