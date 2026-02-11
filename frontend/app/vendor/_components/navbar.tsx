"use client";

import { BellIcon, Search, User } from "lucide-react";
import { useEffect, useState } from "react";

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const search = <Search color="#ccc" />;
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <div
      className={`flex justify-between items-center bg-transparent px-5 md:px-10 fixed top-0 left-0 right-0 z-50  transition-colors duration-500  ${
        scrolled ? "bg-white/70 backdrop-blur-md shadow-sm" : ""
      }`}
    >
      <div className="flex gap-5 items-center">
        <img src={"/images/Moda2.png"} className="w-25 h-25 max-md:ml-10" />
        <p className="font-bold text-2xl bg-linear-to-r from-[#666] to-[#7a2048] text-transparent bg-clip-text tracking-tight block max-md:hidden">
          Good Morning, Stephanie
        </p>
      </div>
      <div className="flex gap-5 max-md:justify-end items-center">
        <div className="w-fit h-fit p-2 shadow-md rounded-full bg-[#ccc]">
          <BellIcon />
        </div>
        <div className="flex gap-2 items-center">
          <div className="w-fit h-fit rounded-full bg-[#ccc] p-2 shadow-md">
            <User />
          </div>
          <div className="max-md:hidden">
            <p className="text-sm font-bold">Anyanwu Stephanie</p>
            <p className="text-[#666] italic text-xs font-bold">Vendor</p>
          </div>
        </div>
      </div>
    </div>
  );
};
