import React, { useRef, useEffect, useState } from "react";
import { useExperience, useProfile } from "../../lib/content";

export default function Experience() {
  const EXPERIENCE = useExperience();
  const PROFILE = useProfile();
  const sectionRef = useRef(null);
  const [lineProgress, setLineProgress] = useState(0);

  // Track scroll progress through this section to animate the spine
  useEffect(() => {
    const handleScroll = () => {
      const el = sectionRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const windowH = window.innerHeight;

      // Start drawing when top enters 70% of viewport, finish near bottom
      const start = windowH * 0.7;
      const end = -rect.height * 0.2;

      const progress = (start - rect.top) / (start - end + rect.height);
      setLineProgress(Math.min(1, Math.max(0, progress)));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      id="experience"
      ref={sectionRef}
      className="py-24 sm:py-32 px-[var(--gutter)] max-w-[1320px] mx-auto w-full"
    >
      {/* Section Tag */}
      <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#77756f] mb-3">
        <span>05</span>
        <span>—</span>
        <span>Chronology</span>
      </div>

      <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#0d0d0d] mb-16 sm:mb-20">
        Experience & <span className="font-serif-italic font-normal text-[#77756f]">education.</span>
      </h2>

      {/* Vertical Timeline */}
      <div className="relative pl-6 sm:pl-10 space-y-12 sm:space-y-16">
        {/* Background spine track */}
        <div
          className="absolute left-[11px] sm:left-[19px] top-2 bottom-6 w-[2px] bg-black/10 -z-10"
          aria-hidden="true"
        />

        {/* Dynamic active spine line scaled by scroll progress */}
        <div
          className="absolute left-[11px] sm:left-[19px] top-2 w-[2px] bg-[#0d0d0d] transition-all duration-75 -z-10"
          style={{ height: `${lineProgress * 100}%` }}
          aria-hidden="true"
        />

        {/* Timeline Items */}
        {EXPERIENCE.map((item, idx) => {
          const itemProgressThreshold = (idx + 0.5) / (EXPERIENCE.length + 1);
          const isReached = lineProgress >= itemProgressThreshold;

          return (
            <div key={idx} className="relative group">
              {/* Spine Node Dot */}
              <div
                className={`absolute -left-[29px] sm:-left-[45px] top-1.5 w-4 h-4 rounded-full border-2 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex items-center justify-center ${
                  isReached
                    ? "bg-[#0d0d0d] border-[#0d0d0d] shadow-sm scale-105 group-hover:scale-115 group-hover:ring-4 group-hover:ring-black/10"
                    : "bg-white border-black/20 group-hover:border-[#0d0d0d] group-hover:scale-110"
                }`}
              >
                {isReached && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white transition-transform duration-300 group-hover:scale-110" />
                )}
              </div>

              {/* Stop card */}
              <div
                className={`portfolio-card p-6 sm:p-8 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-default ${
                  isReached ? "opacity-100" : "opacity-75"
                } hover:opacity-100 hover:-translate-y-1 hover:shadow-[0_16px_36px_-8px_rgba(13,13,13,0.08),inset_0_0_0_1px_rgba(13,13,13,0.14)]`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded bg-black/5 text-[#0d0d0d] w-fit">
                    {item.year}
                  </span>
                  <span className="font-mono text-xs text-[#77756f]">
                    {item.type === "experience" ? "Internship" : "Degree"}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-[#0d0d0d] tracking-tight group-hover:text-black transition-colors duration-200">
                  {item.title}
                </h3>

                <div className="text-sm font-medium text-[#77756f] mt-1 mb-3">
                  {item.place}
                </div>

                <p className="text-sm text-[#3a3a3a] leading-relaxed">
                  {item.detail}
                </p>
              </div>
            </div>
          );
        })}

        {/* Next Stop: Dashed card */}
        <div className="relative group">
          <div className="absolute -left-[29px] sm:-left-[45px] top-4 w-4 h-4 rounded-full border-2 border-dashed border-[#0d0d0d] bg-white transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-115 group-hover:bg-[#0d0d0d] group-hover:border-solid" />
          <div className="p-6 sm:p-8 rounded-[24px] border-2 border-dashed border-black/20 bg-white/50 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-black/50 hover:bg-white hover:shadow-[0_16px_36px_-8px_rgba(13,13,13,0.06)] hover:-translate-y-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-default">
            <div>
              <div className="font-mono text-xs text-[#77756f] uppercase tracking-wider mb-1">
                Next Chapter
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-[#0d0d0d] tracking-tight">
                {PROFILE.ctaNextTeam || "Next — Your team?"}
              </h3>
              <p className="text-xs sm:text-sm text-[#77756f] mt-1">
                Open for {PROFILE.role || "Full Stack Developer"} roles in {PROFILE.location || "Hyderabad"} and remote.
              </p>
            </div>
            <a
              href="#contact"
              className="btn-primary text-xs py-2.5 px-6 self-start sm:self-auto shrink-0 transition-transform duration-200 hover:scale-105 active:scale-95"
            >
              Get in touch →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
