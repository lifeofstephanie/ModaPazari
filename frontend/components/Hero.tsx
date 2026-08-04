"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { useCallback, useEffect, useState } from "react";

type Figure = {
  id: number;
  name: string;
  category: string;
  price: string;
  tag: string;
  photo: string; // Unsplash id
};

const img = (id: string, w = 900) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

const FIGURES: Figure[] = [
  { id: 0, name: "The Tailored Edit", category: "Outerwear", price: "$129", tag: "New Arrival", photo: "1524504388940-b1c1722653e1" },
  { id: 1, name: "Modern Muse", category: "Womenswear", price: "$98", tag: "Trending", photo: "1490481651871-ab68de25d43d" },
  { id: 2, name: "Street Signature", category: "Everyday", price: "$164", tag: "Best Seller", photo: "1529139574466-a303027c1d8b" },
  { id: 3, name: "Evening Character", category: "After Dark", price: "$142", tag: "Limited", photo: "1496747611176-843222e1e57c" },
];

export const Hero = () => {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);
  const figure = FIGURES[index];

  const go = useCallback((dir: number) => {
    setDirection(dir);
    setIndex((prev) => (prev + dir + FIGURES.length) % FIGURES.length);
  }, []);

  const jumpTo = (i: number) => {
    setDirection(i > index ? 1 : -1);
    setIndex(i);
  };

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => go(1), 5500);
    return () => clearInterval(t);
  }, [paused, go]);

  // Mouse-parallax tilt for the whole 3D stage
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotY = useSpring(useTransform(mx, [-0.5, 0.5], [-14, 14]), {
    stiffness: 140,
    damping: 18,
  });
  const rotX = useSpring(useTransform(my, [-0.5, 0.5], [10, -10]), {
    stiffness: 140,
    damping: 18,
  });

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const resetMouse = () => {
    mx.set(0);
    my.set(0);
  };

  const swap = {
    enter: (d: number) => ({ opacity: 0, rotateY: d > 0 ? 65 : -65, x: d > 0 ? 80 : -80 }),
    center: { opacity: 1, rotateY: 0, x: 0 },
    exit: (d: number) => ({ opacity: 0, rotateY: d > 0 ? -65 : 65, x: d > 0 ? -80 : 80 }),
  };

  return (
    <section className="bg-surface">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-5 py-16 md:grid-cols-2 md:py-24">
        {/* ---------------- Copy ---------------- */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="order-2 text-center md:order-1 md:text-left"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-1.5 text-xs font-medium tracking-wide text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            New Season · Autumn 2026
          </span>

          <h1 className="mt-6 text-[2.6rem] font-semibold leading-[1.04] tracking-tight md:text-6xl lg:text-7xl">
            Gear up for
            <br />
            every{" "}
            <span className="font-[MomoSignature] font-normal text-accent">
              season
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-muted md:mx-0">
            A living lookbook of our latest edit. Spin through the collection and
            discover the pieces defining the season.
          </p>

          {/* Live figure meta */}
          <AnimatePresence mode="wait">
            <motion.div
              key={figure.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="mt-8 flex items-center justify-center gap-4 md:justify-start"
            >
              <span className="h-11 w-px bg-border" />
              <div className="text-left">
                <p className="text-base font-semibold">{figure.name}</p>
                <p className="text-sm text-muted">
                  {figure.category} · from {figure.price}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 md:justify-start">
            <Link href="/shop">
              <button className="group flex items-center gap-2 rounded-full bg-accent-solid px-7 py-3.5 text-sm font-medium text-white transition-colors hover:bg-accent-strong">
                Shop the collection
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </button>
            </Link>
            <Link href="/seasonal">
              <button className="flex items-center gap-1.5 rounded-full border border-border px-7 py-3.5 text-sm font-medium transition-colors hover:border-accent hover:text-accent">
                Explore all
                <ArrowUpRight size={16} />
              </button>
            </Link>
          </div>
        </motion.div>

        {/* ---------------- 3D stage ---------------- */}
        <div
          className="perspective relative order-1 flex h-[440px] items-center justify-center md:order-2 md:h-[600px]"
          onMouseMove={handleMouse}
          onMouseLeave={resetMouse}
          onPointerEnter={() => setPaused(true)}
          onPointerLeave={() => setPaused(false)}
        >
          <motion.div
            className="preserve-3d relative flex h-full w-full items-center justify-center"
            style={{ rotateX: rotX, rotateY: rotY }}
          >
            {/* Solid backdrop plate for depth (no gradient) */}
            <div
              className="absolute h-[330px] w-[260px] rounded-3xl bg-accent-soft md:h-[440px] md:w-[330px]"
              style={{ transform: "translate3d(26px, 26px, -80px)" }}
            />
            {/* Thin accent frame, slightly offset */}
            <div
              className="absolute h-[330px] w-[260px] rounded-3xl border border-accent/40 md:h-[440px] md:w-[330px]"
              style={{ transform: "translate3d(-22px, -22px, -30px)" }}
            />

            {/* The interchanging portrait */}
            <AnimatePresence mode="popLayout" custom={direction}>
              <motion.div
                key={figure.id}
                custom={direction}
                variants={swap}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="preserve-3d relative"
              >
                <div className="floaty" style={{ transform: "translateZ(50px)" }}>
                  <div className="relative h-[360px] w-[270px] overflow-hidden rounded-3xl border border-border shadow-2xl md:h-[460px] md:w-[340px]">
                    <Image
                      src={img(figure.photo)}
                      alt={figure.name}
                      fill
                      priority
                      sizes="(max-width: 768px) 270px, 340px"
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* Floating price badge */}
                <motion.div
                  className="glass absolute -left-6 bottom-16 rounded-2xl px-4 py-3 shadow-lg md:-left-10"
                  style={{ transform: "translateZ(100px)" }}
                  animate={{ y: [0, -7, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <p className="text-[10px] uppercase tracking-wide text-muted">{figure.tag}</p>
                  <p className="text-lg font-semibold text-accent">{figure.price}</p>
                </motion.div>

                {/* Floating category chip */}
                <motion.div
                  className="glass absolute -right-4 top-10 rounded-full px-4 py-1.5 text-xs font-medium shadow-lg md:-right-8"
                  style={{ transform: "translateZ(80px)" }}
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                >
                  {figure.category}
                </motion.div>
              </motion.div>
            </AnimatePresence>

            {/* Ground shadow */}
            <div
              className="floor-shadow absolute bottom-8 h-10 w-52 md:w-64"
              style={{ transform: "translateZ(-40px)" }}
            />
          </motion.div>

          {/* Controls */}
          <button
            aria-label="Previous look"
            onClick={() => go(-1)}
            className="glass absolute left-0 top-1/2 z-20 -translate-y-1/2 rounded-full p-2.5 text-accent transition-transform hover:scale-110"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            aria-label="Next look"
            onClick={() => go(1)}
            className="glass absolute right-0 top-1/2 z-20 -translate-y-1/2 rounded-full p-2.5 text-accent transition-transform hover:scale-110"
          >
            <ChevronRight size={22} />
          </button>

          <div className="absolute bottom-0 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {FIGURES.map((f, i) => (
              <button
                key={f.id}
                aria-label={`Show ${f.name}`}
                onClick={() => jumpTo(i)}
                className={`h-2 rounded-full transition-all ${
                  i === index ? "w-7 bg-accent" : "w-2 bg-border"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
