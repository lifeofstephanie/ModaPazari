"use client";

import { DefaultTopics, FrequentlyAskedQuestions } from "@/data/helpTopics";
import { ArrowRight, Minus, Plus, Search } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { PageHeader } from "../_components/pageHeader";

export default function HelpCenter() {
  const [activeFilter, setActiveFilter] = useState("General");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const filters = ["General", "Buyers", "Vendors"];

  const filteredQuestions =
    activeFilter === "General"
      ? FrequentlyAskedQuestions
      : FrequentlyAskedQuestions.filter((q) => q.category === activeFilter);

  const toggle = (index: number) =>
    setOpenIndex(openIndex === index ? null : index);

  return (
    <div className="min-h-screen px-5 py-8 sm:px-8">
      <PageHeader
        eyebrow="Support"
        title="Help Center"
        subtitle="Answers for selling and managing your store on Moda Pazari."
      />

      {/* Search */}
      <div className="rounded-xl border border-border bg-card p-6">
        <label className="flex items-center gap-3 rounded-md border border-border bg-background px-4 py-3">
          <Search size={18} className="text-muted" />
          <input
            placeholder="Search help articles…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted"
          />
        </label>
      </div>

      {/* Topics */}
      <h2 className="mb-4 mt-10 text-lg font-semibold">Explore topics</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {DefaultTopics.map((topic, index) => (
          <div
            key={index}
            className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6 transition-colors hover:border-accent"
          >
            <span className="grid h-10 w-10 place-items-center rounded-md bg-accent-soft text-accent">
              <ArrowRight size={18} />
            </span>
            <p className="text-base font-semibold text-accent">{topic.name}</p>
            <p className="text-sm text-muted">{topic.body}</p>
            <button
              onClick={() => toast(`Opening “${topic.name}”`)}
              className="mt-auto inline-flex w-fit items-center gap-1.5 border-b border-accent pb-0.5 text-sm font-medium text-accent"
            >
              See details
              <ArrowRight size={15} />
            </button>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="mt-12">
        <h2 className="text-lg font-semibold">Frequently asked questions</h2>

        <div className="mt-4 inline-flex rounded-md border border-border bg-card p-1">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => {
                setActiveFilter(filter);
                setOpenIndex(null);
              }}
              className={`rounded px-4 py-1.5 text-sm transition-colors ${
                activeFilter === filter
                  ? "bg-accent-solid text-white"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
          {filteredQuestions.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="h-fit rounded-xl border border-border bg-card"
              >
                <button
                  onClick={() => toggle(index)}
                  className="flex w-full items-center justify-between gap-4 p-4 text-left"
                >
                  <span className="text-sm font-medium">{item.question}</span>
                  {isOpen ? (
                    <Minus size={18} className="shrink-0 text-accent" />
                  ) : (
                    <Plus size={18} className="shrink-0 text-accent" />
                  )}
                </button>
                <div
                  className={`overflow-hidden px-4 transition-all duration-300 ${
                    isOpen ? "max-h-48 pb-4 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="text-sm text-muted">{item.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
