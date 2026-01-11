import { CLOTHES_DATA } from "@/data/constants";
import Link from "next/link";

export default function Shop() {
  return (
    <main className="">
      <section className="relative w-full overflow-hidden pb-20 px-5 md:px-10 bg-linear-to-b from-[#e0ebf5] to-white pt-30">
        <div className="h-[50%] md:h-[60%] w-full overflow-hidden flex justify-between items-center bg-[#4f6d7a] px-2 md:px-10 rounded-2xl">
          <div>
            <p className="text-white text-lg md:text-3xl lg:text-5xl font-bold font-serif italic mb-4">
              Shop/Fashion for all
            </p>
            <p className="text-sm md:text-2xl font-bold font-serif italic text-[#f1dac4]">
              Dress Bold, Live Confident
            </p>
          </div>
          <img
            src={"/images/shop_hero.png"}
            className=" w-[50%] h-fit bg-center bg-contain"
            loading="lazy"
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-12 my-5 md:my-10">
          {CLOTHES_DATA.map((item) => (
            <Link href={`/shop/${item.id}`} key={item.id} className="group">
              <div className="relative">
                <div className="relative aspect-3/4 overflow-hidden rounded-[40px] border-12 border-[#7A2048]/5">
                  <img
                    src={item.img}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    loading="lazy"
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
                    {item.currency} {item.price}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* </div> */}
      </section>
    </main>
  );
}
