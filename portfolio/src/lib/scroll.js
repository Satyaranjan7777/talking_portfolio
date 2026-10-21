import Lenis from "lenis";

let lenisInstance = null;

export function initLenis() {
  if (typeof window === "undefined") return null;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) return null;

  if (!lenisInstance) {
    lenisInstance = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    function raf(time) {
      lenisInstance?.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  return lenisInstance;
}

export function scrollToTarget(target) {
  if (!target) return;
  const el = typeof target === "string" ? document.querySelector(target) : target;
  if (!el) return;

  if (lenisInstance) {
    lenisInstance.scrollTo(el, { offset: -32, duration: 1.2 });
  } else {
    el.scrollIntoView({ behavior: "smooth" });
  }
}
