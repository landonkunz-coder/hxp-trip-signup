"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Layered wave transition at the bottom of the hero. As you scroll past, the
 * three cream layers rise and drift at different rates — a "wave crash" scrub
 * tied to scroll position. Static (no motion) for reduced-motion users.
 */
export function HeroWaves() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root, start: "top bottom", end: "bottom top", scrub: 0.6 },
      });
      tl.to("[data-wave='back']", { xPercent: -8, yPercent: -20, ease: "none" }, 0)
        .to("[data-wave='mid']", { xPercent: 7, yPercent: -34, ease: "none" }, 0)
        .to("[data-wave='front']", { xPercent: -5, yPercent: -48, ease: "none" }, 0);
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={rootRef}
      className="pointer-events-none absolute inset-x-0 bottom-[-1px] h-[110px] overflow-hidden sm:h-[160px]"
      aria-hidden="true"
    >
      <svg viewBox="0 0 1440 220" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <path
          data-wave="back"
          d="M0,128 C240,178 480,178 720,143 C960,108 1200,108 1440,138 L1440,220 L0,220 Z"
          fill="#f5f0e6"
          fillOpacity="0.5"
        />
        <path
          data-wave="mid"
          d="M0,150 C240,196 480,196 720,160 C960,124 1200,130 1440,155 L1440,220 L0,220 Z"
          fill="#f5f0e6"
          fillOpacity="0.8"
        />
        <path
          data-wave="front"
          d="M0,172 C240,214 480,214 720,180 C960,146 1200,150 1440,174 L1440,220 L0,220 Z"
          fill="#f5f0e6"
        />
      </svg>
    </div>
  );
}
