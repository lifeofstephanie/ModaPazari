// components/Hero.jsx (or wherever your file is located)
"use client"; // Required for client-side interactions in Next.js App Router

import Image from "next/image";
import { Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export const Hero = () => {
  const [isAnimatingIn, setIsAnimatingIn] = useState(true);

  // Mark animation as complete after a duration
  useEffect(() => {
    const timer = setTimeout(() => setIsAnimatingIn(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const otherElementsVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2 } },
  };

  const leftElement = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2 } },
  };
  const rightElement = {
    hidden: { opacity: 0, x: 100 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, delay: 0.2 } },
  };
  return (
    <AnimatePresence>
      <div className="bg-linear-to-b from-[#e0ebf5]  to-white h-fit overflow-hidden   px-5 relative">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={otherElementsVariants}
        >
          <div className="text-center mt-8 mb-5 text-2xl md:text-5xl lg:text-6xl flex flex-col gap-2">
            <h1>GEAR UP EVERY SEASON</h1>
            <h1>
              EVERY{" "}
              <span className="font-[MomoSignature] text-[#7A2048] text-xl md:text-[4xl] lg:text-5xl">
                FASHION!
              </span>
            </h1>
          </div>
          <div className="flex gap-3 justify-center items-center text-sm ">
            <div className="py-3 px-5 bg-black text-white rounded-4xl cursor-pointer hover:bg-[#7A2048]">
              SHOP NOW
            </div>
            <div className="py-3 px-5 bg-white rounded-4xl cursor-pointer hover:text-[#7A2048]">
              EXPLORE ALL
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col md:flex-row gap-4 md:gap-0 justify-between items-center mt-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={leftElement}
            className="w-[300px]"
          >
            <div className="flex mb-2 ">
              <div className="h-10 w-10 rounded-full bg-black overflow-hidden">
                <img src="/images/brush.png" alt="" className="w-full" />
              </div>
              <div className="h-10 w-10 rounded-full bg-black -ml-2.5 overflow-hidden">
                <img src="/images/shoes.png" alt="" className="w-full" />
              </div>
              <div className="h-10 w-10 rounded-full bg-black -ml-2.5 overflow-hidden">
                <img src="/images/bag.png" alt="" className="w-full" />
              </div>
            </div>
            <p>
              stay cozy without compromising your range of motion. Our
              women&apos;s winter range for those chilly outdoor hangouts.
            </p>
          </motion.div>

          <motion.div
            initial={{
              position: "fixed",
              top: "50%",
              left: "50%",
              translateX: "-50%",
              translateY: "-50%",
              zIndex: 10,
              scale: 1.2,
            }}
            animate={{
              position: "static",
              top: "auto",
              left: "auto",
              translateX: "0%",
              translateY: "0%",
              scale: 1,
              transition: {
                duration: 0.5,
                ease: "easeInOut",
              },
            }}
            className="hidden md:block"
          >
            <Image
              src={"/images/croppedHeroImage3.png"}
              alt="Hero Image"
              height={500}
              width={500}
            />
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={rightElement}
          >
            <div className=" h-[150px] md:h-[200px] w-[300px] md:w-[400px] bg-black rounded-lg flex justify-center items-center cursor-pointer">
              <Play size={30} color="#fff" fill="#fff" />
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
