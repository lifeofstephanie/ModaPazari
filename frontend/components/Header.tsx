"use client";
import { Handbag } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
export const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <div
      className={`px-5 sticky top-0 transition-all duration-300  justify-between items-center z-50 flex w-full h-20 ${
        scrolled ? " backdrop-blur-sm" : "bg-[#e0ebf5]"
      }`}
    >
      <ul className="hidden gap-3 items-center text-sm md:flex">
        <li className="cursor-pointer hover:text-[#7A2048]">SHOP</li>
        <li className="cursor-pointer hover:text-[#7A2048]">MEN</li>
        <li className="cursor-pointer hover:text-[#7A2048]">WOMEN</li>
        <li className="cursor-pointer hover:text-[#7A2048]">TRENDING</li>
      </ul>
      <div
        className={`  text-center w-[500px] h-20 ${
          scrolled ? "bg-transparent" : "bg-white"
        }  [clip-path:polygon(0%_0%,100%_0%,80%_100%,20%_100%)] flex justify-center items-center`}
      >
        <Image alt="logo" src="/images/logo.svg" width={200} height={50} />
      </div>
      <ul className="hidden md:flex gap-3 items-center text-sm">
        <li className="cursor-pointer hover:text-[#7A2048]">SEASONAL</li>
        <li className="cursor-pointer hover:text-[#7A2048]">ACCESSORIES</li>
        <div className="p-2 rounded-2xl bg-black text-white text-xs cursor-pointer hover:bg-[#7A2048]">
          <p>SIGN IN/UP</p>
        </div>
        <div className="h-[30px] w-[30px] rounded-full bg-black text-white tex-xs flex justify-center items-center cursor-pointer hover:bg-[#7A2048]">
          <Handbag size={18} />
        </div>
      </ul>
    </div>
  );
};
