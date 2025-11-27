import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import Image from "next/image";

export const Footer = () => {
  return (
    <div className="w-full min-h-[200px] bg-linear-to-t from-[#e0ebf5] to-white md:px-10 py-10 px-5">
      <div className="flex gap-10 flex-wrap md:flex-nowrap ">
        <section className="flex flex-col gap-5">
          <Image src={"/images/logo.svg"} width={200} height={50} alt="Logo" />
          <p className="w-[350px] text-[#707070] ">
            Your premier destination for International fashion. Quality, style
            and affordability in one place
          </p>
          <div className="flex gap-5 items-center">
            <div className="p-2 bg-white rounded-lg w-fit text-[#7A2048]">
              <Facebook />
            </div>
            <div className="p-2 bg-white rounded-lg w-fit text-[#7A2048]">
              <Instagram />
            </div>
            <div className="p-2 bg-white rounded-lg w-fit text-[#7A2048]">
              <Twitter />
            </div>
            <div className="p-2 bg-white rounded-lg w-fit text-[#7A2048]">
              <Youtube />
            </div>
          </div>
        </section>
        <section className="flex justify-between w-full flex-wrap md:px-10">
          <div className="flex flex-col gap-5">
            <h2 className="font-semibold">Quick Links</h2>
            <ul className="flex flex-col gap-3 text-[#707070] ">
              <li className="hover:text-[#7A2048] cursor-pointer">About Us</li>
              <li className="hover:text-[#7A2048] cursor-pointer">Contact</li>
              <li className="hover:text-[#7A2048] cursor-pointer">
                Size Guide
              </li>
              <li className="hover:text-[#7A2048] cursor-pointer">
                Shipping Info
              </li>
              <li className="hover:text-[#7A2048] cursor-pointer">Returns</li>
            </ul>
          </div>
          <div className="flex flex-col gap-5">
            <h2 className="font-semibold">Customer Service</h2>
            <ul className="flex flex-col gap-3 text-[#707070] ">
              <li className="hover:text-[#7A2048] cursor-pointer">
                Help Center
              </li>
              <li className="hover:text-[#7A2048] cursor-pointer">
                Track Your Order
              </li>
              <li className="hover:text-[#7A2048] cursor-pointer">
                Privacy Policy
              </li>
              <li className="hover:text-[#7A2048] cursor-pointer">
                Terms of Service
              </li>
              <li className="hover:text-[#7A2048] cursor-pointer">
                Become a Vendor
              </li>
            </ul>
          </div>
          <div className="flex flex-col gap-5">
            <h2 className="font-semibold">Stay Updated</h2>
            <div className="flex flex-col gap-3 text-[#707070] w-[250px]">
              <p>Subscribe to get special offers and updates</p>
              <input
                placeholder="Enter your email"
                className="h-10 shadow-sm rounded-lg px-2 text-sm w-full"
              />
              <button
                type="submit"
                className="h-10 bg-[#7A2048] rounded-lg w-full text-white flex justify-center items-center"
              >
                <p>Subscribe</p>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
