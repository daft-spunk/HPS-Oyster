"use client";

import { useState } from "react";

export function FaqList({ faqs }: { faqs: { q: string; a: string }[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className="grid md:grid-cols-2 gap-3 max-w-5xl mx-auto">
      {faqs.map((faq, i) => {
        const open = openIdx === i;
        return (
          <div
            key={i}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden self-start"
          >
            <button
              type="button"
              aria-expanded={open}
              onClick={() => setOpenIdx(open ? null : i)}
              className="w-full px-4 py-3 bg-[#004B9C] text-white font-medium flex justify-between items-center text-left"
            >
              <span className="pr-3">{faq.q}</span>
              <span
                className={`text-xl transition-transform flex-shrink-0 ${
                  open ? "rotate-180" : ""
                }`}
              >
                ▾
              </span>
            </button>
            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <p className="px-4 py-3 text-sm leading-relaxed text-gray-700">
                  {faq.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
