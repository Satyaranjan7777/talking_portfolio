import React, { useEffect } from "react";
import { initLenis } from "./lib/scroll";
import { useSettings, useSeo } from "./lib/content";
import Navigation from "./components/Navigation";
import Hero from "./components/hero/Hero";
import About from "./components/sections/About";
import Skills from "./components/sections/Skills";
import Work from "./components/sections/Work";
import Certifications from "./components/sections/Certifications";
import Experience from "./components/sections/Experience";
import Contact from "./components/sections/Contact";

export default function App() {
  const settings = useSettings();
  const visibility = settings?.visibility || {};
  const seo = useSeo();

  useEffect(() => {
    // 1. Initialize Lenis smooth scroll
    initLenis();
  }, []);

  // Synchronize dynamic SEO metadata from admin to document head
  useEffect(() => {
    if (!seo) return;
    if (seo.title) {
      document.title = seo.title;
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute("content", seo.title);
    }
    if (seo.description) {
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute("content", seo.description);
      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute("content", seo.description);
    }
    if (seo.ogImage) {
      const ogImg = document.querySelector('meta[property="og:image"]');
      if (ogImg) ogImg.setAttribute("content", seo.ogImage);
    }
    if (seo.themeColor) {
      const themeColor = document.querySelector('meta[name="theme-color"]');
      if (themeColor) themeColor.setAttribute("content", seo.themeColor);
    }
  }, [seo]);

  useEffect(() => {
    // 2. Global RevealObserver for .rv and .rv-mask, re-bound whenever sections toggle
    const revealElements = document.querySelectorAll(".rv, .rv-mask");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    revealElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [visibility]);

  return (
    <div className="relative min-h-screen bg-[#f4f2ee] text-[#0d0d0d] font-sans selection:bg-[#0d0d0d] selection:text-[#f4f2ee]">
      {/* Navigation Header & Progress Bar */}
      <Navigation />

      {/* Main Continuous Scroll Surface */}
      <main className="w-full">
        {/* 4.1 Hero */}
        <Hero />

        {/* 4.2 About */}
        {visibility.about !== false && <About />}

        {/* 4.3 Skills */}
        {visibility.skills !== false && <Skills />}

        {/* 4.4 Work */}
        {visibility.work !== false && <Work />}

        {/* 4.5 Certifications */}
        {visibility.certifications !== false && <Certifications />}

        {/* 4.6 Experience */}
        {visibility.experience !== false && <Experience />}

        {/* 4.7 Contact & Footer */}
        {visibility.contact !== false && <Contact />}
      </main>
    </div>
  );
}
