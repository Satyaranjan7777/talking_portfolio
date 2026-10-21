import React, { useState, useEffect } from "react";
import { useProfile, useNav, useResume } from "../lib/content";
import { scrollToTarget } from "../lib/scroll";

export default function Navigation() {
  const PROFILE = useProfile();
  const NAV = useNav();
  const resume = useResume();
  const [scrolled, setScrolled] = useState(false);

  const [activeSection, setActiveSection] = useState("hero");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [progress, setProgress] = useState(0);

  // Scroll tracking for progress bar and scrolled threshold (40px)
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);

      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total > 0) {
        setProgress(Math.min(100, Math.max(0, (y / total) * 100)));
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Section tracking with rootMargin: -45% 0px -50% 0px
  useEffect(() => {
    const sectionIds = ["hero", ...NAV.map((n) => n.id)];
    const observers = [];

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(id);
          }
        },
        { rootMargin: "-45% 0px -50% 0px" }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((obs) => obs.disconnect());
  }, [NAV]);

  // Lock body scroll when mobile menu is open + close on Esc
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };

    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const handleNavClick = (e, id) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    scrollToTarget(`#${id}`);
  };

  return (
    <>
      {/* 2px ink scroll-progress bar */}
      <div
        className="fixed top-0 left-0 h-[2px] bg-[#0d0d0d] z-50 transition-all duration-75 pointer-events-none"
        style={{ width: `${progress}%` }}
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
      />

      {/* Main floating navigation header */}
      <header className="fixed top-0 left-0 right-0 z-40 transition-all duration-300 py-4 px-[var(--gutter)] flex items-center justify-between pointer-events-none">
        {/* Left: Initials mark + full name */}
        <div className="flex items-center gap-3 pointer-events-auto">
          {(() => {
            const initials = PROFILE.name
              ? PROFILE.name
                  .split(" ")
                  .map((w) => w[0])
                  .filter(Boolean)
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()
              : "SM";
            return (
              <a
                href="#hero"
                onClick={(e) => handleNavClick(e, "hero")}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-mono text-xs font-semibold tracking-wider transition-all duration-500 hover:rotate-[360deg] ${
                  scrolled
                    ? "bg-[#0d0d0d] text-[#f4f2ee] shadow-sm"
                    : "border border-[#0d0d0d] text-[#0d0d0d] bg-transparent"
                }`}
                aria-label="Back to top"
              >
                {initials}
              </a>
            );
          })()}
          <span
            className={`text-sm font-medium tracking-tight text-[#0d0d0d] transition-opacity duration-300 hidden sm:inline-block ${
              scrolled ? "opacity-0 pointer-events-none" : "opacity-100"
            }`}
          >
            {PROFILE.name}
          </span>
        </div>

        {/* Center / Right: Nav pill desktop */}
        <nav
          className={`hidden md:flex items-center gap-1 p-1.5 rounded-full transition-all duration-500 pointer-events-auto ${
            scrolled ? "glass-pill shadow-lg border border-black/5" : "bg-transparent"
          }`}
          aria-label="Primary Navigation"
        >
          {NAV.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(e) => handleNavClick(e, item.id)}
                className={`relative px-4 py-2 text-[13.5px] font-medium tracking-tight rounded-full transition-colors duration-200 ${
                  isActive ? "text-[#f4f2ee]" : "text-[#3a3a3a] hover:text-[#0d0d0d]"
                }`}
              >
                {isActive && (
                  <span
                    className="absolute inset-0 bg-[#0d0d0d] rounded-full -z-10 transition-all duration-300"
                    style={{
                      boxShadow: "0 2px 8px rgba(13,13,13,0.18)",
                    }}
                  />
                )}
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Mobile menu trigger */}
        <div className="md:hidden pointer-events-auto">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="glass-pill px-4 py-2 rounded-full text-xs font-mono font-medium tracking-wider text-[#0d0d0d] uppercase border border-black/10 shadow-sm"
            aria-expanded={mobileMenuOpen}
            aria-label="Open mobile navigation"
          >
            Menu
          </button>
        </div>
      </header>

      {/* Mobile full-screen paper overlay */}
      <div
        className={`fixed inset-0 bg-[#f4f2ee] z-50 flex flex-col justify-between p-8 transition-all duration-500 md:hidden ${
          mobileMenuOpen
            ? "opacity-100 pointer-events-auto [clip-path:polygon(0_0,100%_0,100%_100%,0_100%)]"
            : "opacity-0 pointer-events-none [clip-path:polygon(0_0,100%_0,100%_0,0_0)]"
        }`}
        aria-hidden={!mobileMenuOpen}
      >
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs uppercase tracking-widest text-[#77756f]">Navigation</span>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="w-10 h-10 rounded-full border border-black/15 flex items-center justify-center text-sm font-mono text-[#0d0d0d]"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <nav className="flex flex-col gap-6 my-auto">
          {NAV.map((item, idx) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => handleNavClick(e, item.id)}
              className="group flex items-baseline gap-4 text-3xl font-bold tracking-tight text-[#0d0d0d] transition-transform duration-200 hover:translate-x-2"
            >
              <span className="font-mono text-xs text-[#77756f]">0{idx + 1}</span>
              <span>{item.label}</span>
            </a>
          ))}
        </nav>

        <div className="pt-6 border-t border-black/10 flex items-center justify-between text-xs font-mono text-[#77756f]">
          <span>{PROFILE.name}</span>
          <a
            href={resume?.url || PROFILE.resumePath}
            download={resume?.downloadName || true}
            className="underline hover:text-[#0d0d0d]"
          >
            Résumé ↓
          </a>
        </div>

      </div>
    </>
  );
}
