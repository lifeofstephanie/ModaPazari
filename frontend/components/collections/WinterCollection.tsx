"use client";
import { CLOTHES_DATA } from "@/data/constants";
import Link from "next/link";
import { useState } from "react";

export default function WinterCollection() {
  const [selectedCategory, setSelectedCategory] = useState("Winter");

  const filteredClothes = CLOTHES_DATA.filter((item) =>
    item.category.includes(selectedCategory)
  );
  return (
    <section>
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-black/5 pb-8">
        <div>
          <span className="text-[#7A2048] text-xs font-bold tracking-[0.3em] uppercase">
            01 / Curated
          </span>
          <h2 className="text-4xl md:text-5xl font-serif tracking-tight mt-2 italic bg-linear-to-r from-[#7A2048] to-black bg-clip-text text-transparent font-bold">
            Winter Collection
          </h2>
        </div>
        <p className="text-gray-600 text-sm max-w-xs mt-4 md:mt-0 font-light italic">
          Where Beauty and Elegance Speak Louder
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
        {filteredClothes.map((item) => (
          <Link href={`/shop/${item.id}`} key={item.id} className="group">
            <div className="relative">
              <div className="relative aspect-[3/4] overflow-hidden rounded-[40px] border-[12px] border-[#7A2048]/5">
                <img
                  src={item.img}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute bottom-6 right-6 w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg transform transition-transform group-hover:rotate-45">
                  <span className="text-[10px] font-bold tracking-tighter text-center leading-none uppercase">
                    Moda <br /> Pazari
                  </span>
                  <div className="absolute -top-1 -right-1 bg-[#7A2048] text-white rounded-full p-1">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <path d="M7 17L17 7M17 7H7M17 7V17" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="mt-6 text-center">
                <h3 className="text-xl font-serif text-[#7A2048] italic">
                  {item.name}
                </h3>
                <p className="text-[#7A2048] font-bold mt-1 tracking-widest text-sm">
                  {item.price}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <div className="flex justify-end items-end mt-5">
        <Link href={"/"}>
          <p className="hover:underline text-right text-[#7A2048]">
            See More...
          </p>
        </Link>
      </div>
    </section>
  );
}
