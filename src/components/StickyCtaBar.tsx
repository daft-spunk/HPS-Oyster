"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export interface StickyCta {
  label: string;
  href: string;
}

export function StickyCtaBar({ ctas }: { ctas: StickyCta[] }) {
  // Hide while the user is at the very top (the hero already has the CTAs).
  // Reveal once they scroll past so the sticky bar has a purpose.
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (ctas.length === 0) return;
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.55);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [ctas.length]);

  if (ctas.length === 0) return null;

  return (
    <>
      {/* Mobile: fixed bottom bar */}
      <div
        className={`md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] px-3 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] transition-transform duration-300 ${
          show ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex gap-2 overflow-x-auto">
          {ctas.map((c, i) => (
            <Link
              key={i}
              href={c.href}
              className="flex-1 min-w-fit text-center px-4 py-3 bg-[#BD974A] hover:bg-[#a4843d] active:bg-[#8a6f33] text-white rounded-lg font-semibold text-sm whitespace-nowrap transition"
            >
              {c.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Desktop: fixed on right side, vertically centered */}
      <div
        className={`hidden md:flex fixed right-4 top-1/2 -translate-y-1/2 z-50 flex-col gap-2 max-w-[260px] transition-all duration-300 ${
          show ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4 pointer-events-none"
        }`}
      >
        {ctas.map((c, i) => (
          <Link
            key={i}
            href={c.href}
            className="px-4 py-3 bg-[#BD974A] hover:bg-[#a4843d] text-white rounded-lg font-semibold text-sm shadow-lg ring-1 ring-black/5 transition leading-snug text-center"
          >
            {c.label}
          </Link>
        ))}
      </div>
    </>
  );
}
