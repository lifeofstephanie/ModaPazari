"use client";
import { categories } from "@/data/categories";
import { Products } from "@/data/products";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";

export const Categories = () => {
  const container = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const updateButtons = () => {
    const el = container.current;
    if (!el) return;

    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth);
  };

  const scroll = (direction: "left" | "right") => {
    const el = container.current;
    if (!el) return;

    const amount = el.clientWidth * 0.8;
    const newScroll =
      direction === "left" ? el.scrollLeft - amount : el.scrollLeft + amount;

    el.scrollTo({ left: newScroll, behavior: "smooth" });
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
  const elementVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2 } },
  };

  return (
    <AnimatePresence>
      <div className="px-5 md:px-10 py-0 md:py-10 mb-2">
        {/* Couture Section (unchanged) */}
        <div className="flex md:items-center gap-5 md:gap-0 md:justify-between flex-col md:flex-row">
          <div className="w-full md:w-[49%] h-40 bg-[#efefdc] rounded-2xl flex justify-between items-end px-5 pb-5 relative overflow-hidden">
            <p className="text-xl md:text-2xl max-w-[250px] z-10">
              Where dreams meet Couture
            </p>
            <div className="bg-white w-[150px] px-5 py-2 rounded-xl text-black text-center z-10 text-sm md:text-lg">
              <p>Shop Now</p>
            </div>
            <Image
              alt="image"
              src={"/images/CroppedImage3.png"}
              width={250}
              height={200}
              className="absolute right-10 bottom-0 "
            />
          </div>

          <div className="w-full md:w-[49%] h-40 bg-[#fff5fa] rounded-2xl flex justify-between items-end px-5 pb-5 relative overflow-hidden">
            <p className="text-xl md:text-2xl max-w-[250px] z-10">
              Enchanting styles for every woman
            </p>
            <div className="bg-white max-w-[150px] px-5 py-2 rounded-xl text-black text-center z-10 text-sm md:text-lg">
              <p>Shop Now</p>
            </div>
            <Image
              alt="image"
              src={"/images/CroppedImage3.png"}
              width={250}
              height={200}
              className="absolute right-10 bottom-0 bg-top"
            />
          </div>
        </div>

        {/* Title */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={elementVariants}
          viewport={{ once: true }}
        >
          <div className=" mt-10 md:mt-20 mb-2 md:mb-20 flex flex-col gap-5 text-center ">
            <h2 className="text-2xl md:text-3xl font-semibold">
              Shop By Category
            </h2>
            <p className="text-[#888] text-lg">
              Discover our carefully curated collection for every style and
              occasion
            </p>
          </div>

          {/* Scroll Buttons */}
          <div className="relative">
            {canScrollLeft && (
              <button
                onClick={() => scroll("left")}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-black text-white px-3 py-2 rounded-full shadow"
              >
                ‹
              </button>
            )}

            {canScrollRight && (
              <button
                onClick={() => scroll("right")}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-black text-white px-3 py-2 rounded-full shadow"
              >
                ›
              </button>
            )}

            {/* Scrollable Categories */}
            <div
              ref={container}
              className="flex gap-5 overflow-x-auto no-scrollbar scroll-smooth py-2"
            >
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="min-w-[70%] h-[200px] md:min-w-[300px] md:h-40  rounded-2xl flex items-end pl-5 pb-3 cursor-pointer transition-transform hover:scale-110 ease-in-out"
                  style={{
                    backgroundImage: `url('${category.image}')`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                  }}
                >
                  <div className="min-w-20 px-5 py-2 h-[30px] bg-white rounded-lg flex justify-center items-center text-sm capitalize ">
                    <p>{category.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
        <motion.div
          initial="hidden"
          whileInView="visible"
          variants={elementVariants}
          viewport={{ once: true }}
        >
          <div className="mt-10 md:mt-20 mb-2 md:mb-20 text-center flex flex-col gap-5">
            <h2 className="text-2xl md:text-3xl font-semibold">
              Featured Products
            </h2>
            <p className="text-[#888] text-lg">
              Handpicked items from our latest collection, loved by our
              customers.
            </p>
          </div>
          <div className="flex flex-row flex-wrap items-center justify-between ">
            {Products.map((product) => (
              <div
                key={product.id}
                className="w-[48%] md:w-[24%] min-h-20 bg-[#fff5fa] mb-5 rounded-lg"
              >
                <div className="w-full h-[200px] relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full rounded-t-lg"
                  />
                  {product.tag && (
                    <div className="absolute w-[50px] h-[30px] bg-linear-to-b from-[#e0ebf5] to-white rounded-lg z-10 top-1 left-1 flex justify-center items-center text-[#7A2048] text-sm uppercase font-bold">
                      <p>{product.tag}</p>
                    </div>
                  )}
                </div>
                <div className="px-3 py-3 flex flex-col gap-3 mt-5">
                  <h2 className="uppercase text-[#707070] text-sm ">
                    {product.category}
                  </h2>
                  <p className="text-sm font-semibold">{product.name}</p>
                  <div className="flex gap-3 text-[#7A2048] font-bold">
                    {product.discount && <p>{product?.discount}</p>}
                    <p
                      className={`${
                        product.discount ? "text-[#707070] line-through " : ""
                      }`}
                    >
                      {product.price}
                    </p>
                  </div>
                  <p>{product.rating}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <style jsx>{`
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </div>
    </AnimatePresence>
  );
};
