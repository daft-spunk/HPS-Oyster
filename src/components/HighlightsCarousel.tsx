"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const SLIDES = [
  { src: "/assets/image-1.png", alt: "HPS internship highlights — slide 1" },
  { src: "/assets/image-3.png", alt: "HPS internship highlights — slide 2" },
  { src: "/assets/image-2.png", alt: "HPS internship highlights — slide 3" },
];

export function HighlightsCarousel() {
  const [idx, setIdx] = useState(0);

  // Auto-advance every 5s
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);

  const go = (n: number) => setIdx((n + SLIDES.length) % SLIDES.length);

  return (
    <div className="relative rounded-lg overflow-hidden shadow-md aspect-[16/10] bg-gray-100">
      {SLIDES.map((s, i) => (
        <div
          key={s.src}
          aria-hidden={i !== idx}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === idx ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image src={s.src} alt={s.alt} fill className="object-cover" priority={i === 0} />
        </div>
      ))}

      {/* Prev / next buttons */}
      <button
        type="button"
        onClick={() => go(idx - 1)}
        aria-label="Previous slide"
        className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition"
      >
        ‹
      </button>
      <button
        type="button"
        onClick={() => go(idx + 1)}
        aria-label="Next slide"
        className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition"
      >
        ›
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIdx(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`w-2.5 h-2.5 rounded-full transition ${
              i === idx ? "bg-white" : "bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
