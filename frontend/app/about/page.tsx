"use client";
import { Testimonials } from "@/data/testimonials";
import { Values } from "@/data/values";
import { Compass, Globe, Medal, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function AboutPage() {
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
  return (
    <div className="pt-20">
      <section className="bg-linear-to-b from-[#e0ebf5] to-white min-h-[500px] w-full px-5 py-10 md:py-[100px]  flex flex-col justify-center">
        <h1 className="text-4xl md:text-6xl font-semibold flex flex-col gap-3 mb-10">
          Empowering The World With{" "}
          <span className="font-[MomoSignature] text-[#7A2048] text-3xl md:text-5xl block mt-2">
            Personalized Fashion
          </span>
        </h1>
        <p className="text-[#5a5757]">
          At Moda Pazari, we&apos;re not just selling fashion accessories, we
          are curating the future of personal expression and style. Our mission
          is to make advanced fashion, ethical sourcing, and effortless style
          accessible, inspiring and impactful for everyone.
        </p>
        <div className="mt-10 flex gap-3 md:gap-10">
          <div className="w-full md:w-[25%] min-h-[100px] rounded-lg backdrop-blur-2xl shadow-md p-5 text-[10px] md:text-lg">
            <User className="text-[#7A2048]" />
            <p>100k+</p>
            <p>Trusted by users worldwide</p>
          </div>
          <div className="w-full md:w-[25%] min-h-[100px] rounded-lg backdrop-blur-2xl shadow-md p-5 text-[10px]  md:text-lg">
            <Globe className="text-[#7A2048]" />
            <p>150+</p>
            <p>Global Brands and Artisans</p>
          </div>
          <div className="w-full md:w-[25%] min-h-[100px] rounded-lg backdrop-blur-2xl shadow-md p-5 text-[10px]  md:text-lg">
            <Medal className="text-[#7A2048]" />
            <p>10+</p>
            <p>Years of Expertise</p>
          </div>
        </div>
      </section>
      <section className="px-5">
        <div className="flex flex-col md:flex-row gap-20 items-center justify-center">
          <div className="w-full md:w-[45%] flex flex-col gap-5">
            <div className="w-[130px] min-h-5 rounded-2xl border border-[#ccc] p-1 flex justify-center gap-2 items-center mb-3">
              <Compass size={14} />
              <p className="text-xs">Our Mission</p>
            </div>
            <h2 className="text-3xl md:text-4xl bg-linear-to-r from-[#7A2048] to-black bg-clip-text text-transparent font-bold">
              Building Africa&apos;s Most Trusted Fashion Marketplace
            </h2>
            <p>
              We exist to solve the core challenges of online fashion retail
              across the region: trust accessibility and variety.
            </p>
            <p>
              Our mission is to operate the most reliable and efficient platform
              that empowers everyone, from emerging local designers to
              style-conscious shoppers, to participate in the future of fashion
            </p>
            <ul className="list-disc flex flex-col gap-3 px-5">
              <li>
                For the Shopper: To guarantee genuine quality and provide
                hassle-free experience from click to delivery, making the latest
                trends and timeless classics accessible to every household.{" "}
              </li>
              <li>
                For the Vendor: To provide an unrivaled digital infrastructure
                and logistics network that enables small businesses and artisans
                to scale their brand and reach millions of customers ethically
                and profitably.{" "}
              </li>
            </ul>
          </div>
          <img
            src="/images/about1.jpg"
            alt=""
            className="w-full md:w-[30%] rounded-lg bg-contain"
          />
        </div>
        <div className="flex flex-col md:flex-row-reverse gap-20 items-center justify-center mt-10 mb-10">
          <div className="w-full md:w-[45%] flex flex-col gap-5">
            <div className="w-[130px] min-h-5 rounded-2xl border border-[#ccc] p-1 flex justify-center gap-2 items-center mb-3">
              <Compass size={14} />
              <p className="text-xs">Our Vision</p>
            </div>
            <h2 className="text-3xl md:text-4xl bg-linear-to-r from-[#7A2048] to-black bg-clip-text text-transparent font-bold">
              A Stylized, Seamless Continent
            </h2>
            <p>
              We envision a future where geographical barriers and logistics are
              no longer obstacles to self-expression.
            </p>
            <p>
              Our vision is to be a central style hub of africa, a dynamic
              ecosystem where local creativity meets global demand, and where
              personalized style is achieved effortlessly and reliably.
            </p>
            <p>We aim to:</p>
            <ul className="list-decimal flex flex-col gap-3 px-5">
              <li>
                Lead in Trust: Set the regional standard for product
                authenticity, secure payments, and transparent returns.
              </li>
              <li>
                Innovate in Delivery: Utilize cutting-edge logistics to shrink
                delivery times and expand reach into the every corner of the
                market.
              </li>
              <li>
                Champion Local Talent: Be the primary platform driving the
                growth and global recognition of African fashion designers and
                brands.
              </li>
            </ul>
          </div>
          <img
            src="/images/about2.jpg"
            alt=""
            className="w-full md:w-[30%] rounded-lg"
          />
        </div>
        <div className=" flex flex-col my-20">
          <h2 className="text-4xl font-bold text-center">Our Values</h2>
          <p className="my-2 text-[#707070] text-center">
            The principles that guide us in the building a better e-commerce
            society.
          </p>
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
              {Values.map((category) => {
                const Icon = category.icon;
                return (
                  <div
                    key={category.id}
                    className="min-w-[70%] min-h-[200px] md:min-w-[300px] md:min-h-[230px]  rounded-2xl px-2 md:px-5  shadow-md py-5 md:py-10"
                  >
                    <div className="min-w-20 px-5 py-2 h-[30px] bg-white rounded-lg text-xs  ">
                      <Icon
                        className="mb-2 text-[#7A2048]"
                        size={30}
                        strokeWidth={1.5}
                      />
                      <p className="font-bold mb-2">{category.name}</p>
                      {/* <p className="text-[#707070]">{category.location}</p> */}
                      <p>{category.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className=" flex flex-col my-10">
          <h2 className="text-4xl font-bold text-center">Testimonials</h2>
          <p className="my-2 text-[#707070] text-center mb-10">
            Great words that our clients have to say about us.
          </p>
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
              {Testimonials.map((category) => (
                <div
                  key={category.id}
                  className="min-w-[70%] min-h-[200px] md:min-w-[300px] md:min-h-[230px]  rounded-2xl  md:px-5 px-0  shadow-md md:py-10 py-2"
                >
                  <div className="min-w-20 px-5 py-2 h-[30px] bg-white rounded-lg text-xs  ">
                    <p className="font-bold mb-2">{category.name}</p>
                    <p className="text-[#707070]">{category.location}</p>
                    <p>{category.testimonial}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

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
  );
}
