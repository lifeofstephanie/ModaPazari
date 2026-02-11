"use client";

import { DefaultTopics, FrequentlyAskedQuestions } from "@/data/helpTopics";
import { ArrowRight, Plus, Minus } from "lucide-react";
import { useState } from "react";

export default function HelpCenter() {
  const [activeFilter, setActiveFilter] = useState("General");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const filters = ["General", "Buyers", "Vendors"];

  const filteredQuestions =
    activeFilter === "General"
      ? FrequentlyAskedQuestions
      : FrequentlyAskedQuestions.filter((q) => q.category === activeFilter);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-[#e0ebf5] to-white pt-5 px-5">
      <div className="mt-5 flex flex-col items-center gap-5">
        <h3 className="text-4xl bg-linear-to-r from-[#7A2048] to-black bg-clip-text text-transparent font-bold">
          Help Center
        </h3>

        <p className="text-sm max-md:text-xs text-[#7A2048] max-md:text-center">
          Got a question about using Moda Pazari to shop or sell? We&apos;ve got
          you covered
        </p>

        <input
          className="w-[80%] max-md:w-[90%] h-15 border border-[#ccc] rounded-md p-5 text-sm md:mt-5"
          placeholder="Enter your questions"
        />
      </div>

      <div className="mt-10">
        <h3 className="text-2xl md:text-3xl font-bold p-5">
          Explore all topics
        </h3>

        <div className="grid md:grid-cols-3 grid-cols-1 gap-5 p-5">
          {DefaultTopics.map((topic, index) => (
            <div
              key={index}
              className="py-5 px-8 bg-white shadow-md rounded-xl h-[300px] mb-2 flex flex-col gap-5"
            >
              <div className="p-1 rounded-full border-2 w-fit relative">
                <div className="w-full h-full bg-[#7A2048]/40 rounded-full absolute top-2.5"></div>
                <ArrowRight size={30} />
              </div>

              <p className="text-xl text-[#7A2048] font-extrabold">
                {topic.name}
              </p>

              <p className="text-md font-semibold">{topic.body}</p>

              <div className="flex gap-3 items-center mt-auto border-b-2 w-fit cursor-pointer">
                <p className="font-bold">See details</p>
                <ArrowRight />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10 flex flex-col gap-5 items-center ">
        <div className="relative">
          <img
            src="/images/Question1.jpg"
            className="w-6 absolute opacity-20 -left-5 "
          />
          <img
            src="/images/Question2.jpg"
            className="w-6 absolute opacity-20 -right-5 "
          />

          <img
            src="/images/Question3.jpg"
            className="w-6 absolute opacity-20 -top-5 left-[50%] "
          />

          <h3 className="text-2xl md:text-3xl font-bold text-center z-10">
            Frequently Asked Questions
          </h3>
        </div>

        <div className="w-full md:w-[40%] grid grid-cols-3 border rounded-md text-center h-12 items-center my-5 overflow-hidden px-2 py-1">
          {filters.map((filter) => (
            <div
              key={filter}
              onClick={() => {
                setActiveFilter(filter);
                setOpenIndex(null);
              }}
              className={`flex items-center justify-center cursor-pointer transition-all h-full duration-200 rounded-md ${
                activeFilter === filter
                  ? "bg-[#7A2048] text-white"
                  : "hover:bg-gray-100"
              }`}
            >
              {filter}
            </div>
          ))}
        </div>

        <div className="w-full md:w-[80%] grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          {filteredQuestions.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className="border rounded-md overflow-hidden transition-all duration-300 mb-5"
              >
                <div
                  onClick={() => toggleAccordion(index)}
                  className="flex justify-between items-center p-4 cursor-pointer"
                >
                  <p className="font-medium">{item.question}</p>

                  {isOpen ? (
                    <Minus size={18} className="text-[#7A2048]" />
                  ) : (
                    <Plus size={18} className="text-[#7A2048]" />
                  )}
                </div>

                <div
                  className={`px-4 transition-all duration-300 ease-in-out ${
                    isOpen ? "max-h-40 opacity-100 pb-4" : "max-h-0 opacity-0"
                  } overflow-hidden`}
                >
                  <p className="text-sm text-gray-600">{item.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
