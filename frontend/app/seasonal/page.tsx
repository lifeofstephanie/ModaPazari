import SummerCollections from "@/components/collections/SummerCollection";
import WinterCollection from "@/components/collections/WinterCollection";

export default function Shop() {
  return (
    <main className="">
      <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute z-0 min-w-full min-h-full object-cover"
        >
          <source src="/images/Shopping.mp4" type="video/mp4" />
        </video>

        <div
          className="absolute inset-0 z-10 bg-black/50"
          aria-hidden="true"
        ></div>

        <div className="relative z-20 text-center text-white px-4 max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight">
            Focus on the Vision
          </h1>
          <p className="text-lg md:text-2xl font-light">
            Beyond trends. Beyond boundaries. Redefining the modern wardrobe.
          </p>
        </div>
      </section>
      <section className="bg-linear-to-b from-[#e0ebf5] to-white py-20 px-6 md:px-12">
        <WinterCollection />
        <SummerCollections />
      </section>
    </main>
  );
}
