"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Mail, Phone, MapPin } from "lucide-react";

export default function ContactLayout() {
  const elementVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2 } },
  };
  const rightElement = {
    hidden: { opacity: 0, x: 100 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, delay: 0.2 } },
  };
  const leftElement = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2 } },
  };
  return (
    <AnimatePresence>
      <div className="pb-20 px-5 md:px-10 bg-linear-to-b from-[#e0ebf5] to-white pt-30">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* LEFT SIDE */}
          <div className="flex flex-col gap-6">
            {/* Top Image */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              variants={leftElement}
              viewport={{ once: true }}
            >
              <img
                src="/images/contact.jpg"
                className="w-full h-[300px] md:h-[380px] object-cover rounded-xl shadow-sm"
              />
            </motion.div>

            {/* Contact Info Card */}
            <motion.div
              whileInView="visible"
              initial="hidden"
              variants={elementVariants}
              viewport={{ once: true }}
              className="p-6 rounded-xl border border-[#ccc] bg-white shadow-sm flex flex-col gap-6"
            >
              {/* Email */}
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#7A2048] text-[#fff]">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-gray-600">hi@modapazari.com</p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#7A2048] text-[#fff]">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="font-medium">Phone</p>
                  <p className="text-sm text-gray-600">+234 801 234 5678</p>
                </div>
              </div>

              {/* Office */}
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#7A2048] text-[#fff]">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="font-medium">Office</p>
                  <p className="text-sm text-gray-600">Lagos, Nigeria</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* RIGHT SIDE – FORM */}
          <motion.div
            whileInView="visible"
            initial="hidden"
            variants={rightElement}
            viewport={{ once: true }}
            className="p-6 rounded-xl border border-[#ccc] bg-white shadow-sm"
          >
            <h2 className="text-2xl font-semibold">Get in touch</h2>
            <p className="text-gray-600 mt-1 mb-6">
              Our friendly team would love to hear from you.
            </p>

            <form className="flex flex-col gap-4">
              {/* First Name */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">First name</label>
                <input
                  type="text"
                  className="border border-[#ccc] rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#7A2048]"
                  placeholder="First name"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  className="border border-[#ccc] rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#7A2048]"
                  placeholder="you@company.com"
                />
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Phone number</label>
                <input
                  type="text"
                  className="border border-[#ccc] rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#7A2048]"
                  placeholder="+234 123 456 7890"
                />
              </div>

              {/* Message */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">Message</label>
                <textarea
                  className="border border-[#ccc] rounded-lg px-3 py-2 h-28 resize-none outline-none focus:ring-2 focus:ring-[#7A2048]"
                  placeholder="Leave us a message..."
                />
              </div>

              {/* Privacy Checkbox */}
              <label className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
                <input type="checkbox" />I agree to the friendly privacy policy.
              </label>

              {/* Submit Button */}
              <button className="bg-black hover:bg-[#7A2048] text-white py-3 rounded-lg text-sm font-medium">
                Send message
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
