import React, { useState, useRef, useEffect } from "react";
import { useProfile, useEducation, useResume, useSettings } from "../../lib/content";

export default function About() {
  const PROFILE = useProfile();
  const EDUCATION = useEducation();
  const resume = useResume();
  const settings = useSettings();
  const canFlip = settings?.features?.enableIdCardFlip !== false;
  const [isFlipped, setIsFlipped] = useState(false);

  const [angle, setAngle] = useState(0);
  const cardContainerRef = useRef(null);
  const velocityRef = useRef(0);
  const lastXRef = useRef(0);
  const animationFrameRef = useRef(null);

  // Pendulum spring physics + subtle idle sway
  useEffect(() => {
    let currentAngle = 0;
    let velocity = 0;
    let idleTime = 0;

    const tick = () => {
      idleTime += 0.03;

      // Spring damping physics
      const spring = -0.06 * currentAngle;
      velocity = (velocity + spring) * 0.92;
      currentAngle += velocity;

      // Subtle idle sway when resting
      if (Math.abs(velocity) < 0.01 && Math.abs(currentAngle) < 0.05) {
        currentAngle = Math.sin(idleTime) * 1.8;
      }

      setAngle(currentAngle);
      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    const handlePointerMove = (e) => {
      const deltaX = e.clientX - lastXRef.current;
      lastXRef.current = e.clientX;
      velocity += Math.max(-8, Math.min(8, deltaX * 0.12));
    };

    window.addEventListener("pointermove", handlePointerMove);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsFlipped((prev) => !prev);
    }
  };

  return (
    <section id="about" className="py-24 sm:py-32 px-[var(--gutter)] max-w-[1320px] mx-auto w-full">
      {/* Section Tag */}
      <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#77756f] mb-3">
        <span>01</span>
        <span>—</span>
        <span>About</span>
      </div>

      <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#0d0d0d] mb-12 sm:mb-16">
        Behind the <span className="font-serif-italic font-normal text-[#77756f]">code.</span>
      </h2>

      {/* Three-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px_minmax(0,1fr)] gap-8 lg:gap-10 items-stretch">
        {/* Left Column: Summary and action buttons */}
        <div className="portfolio-card p-6 sm:p-8 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-[#0d0d0d]">
              Hi, I'm {PROFILE.name ? PROFILE.name.split(" ")[0] : "Satyaranjan"}.
            </h3>
            <p className="text-sm sm:text-[15px] text-[#3a3a3a] leading-relaxed">
              {PROFILE.resumeSummary}
            </p>
            <p className="text-xs font-mono text-[#77756f] pt-2 border-t border-black/5">
              Focus: {PROFILE.focus || "High-concurrency WebSockets, role-based multi-tenancy, and LLM-powered candidate intelligence."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-6 mt-6 border-t border-black/5">
            <a
              href={resume?.url || PROFILE.resumePath}
              download={resume?.downloadName || true}
              className="btn-primary text-xs py-2 px-4"
            >
              Résumé ↓
            </a>

            <a
              href={PROFILE.github}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-xs py-2 px-4"
            >
              GitHub ↗
            </a>
            <a
              href={PROFILE.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-xs py-2 px-4"
            >
              LinkedIn ↗
            </a>
          </div>
        </div>

        {/* Center: Hanging Lanyard ID Card */}
        <div
          ref={cardContainerRef}
          className="flex flex-col items-center justify-start select-none py-2"
          style={{ perspective: 1000 }}
        >
          {/* Lanyard Strap (30x56 px with scrolling text and metal clip) */}
          <div className="relative w-[30px] h-[56px] bg-[#1a1a1a] rounded-t overflow-hidden flex flex-col items-center justify-center shadow-md">
            <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:4px_4px]" />
            <div className="text-[7px] font-mono uppercase tracking-widest text-white/70 whitespace-nowrap -rotate-90">
              MERN • DEV
            </div>
          </div>
          {/* Metal Clip */}
          <div className="w-5 h-4 bg-gradient-to-b from-neutral-300 via-neutral-100 to-neutral-400 rounded-sm shadow-sm -mt-0.5 z-10 flex items-center justify-center">
            <div className="w-2.5 h-1 bg-black/40 rounded-full" />
          </div>

          {/* Interactive Swinging Card */}
          <div
            tabIndex={canFlip ? 0 : -1}
            role={canFlip ? "button" : undefined}
            aria-label={canFlip ? "Developer ID card. Press Enter or Space to flip." : "Developer ID card."}
            onClick={() => canFlip && setIsFlipped((prev) => !prev)}
            onKeyDown={canFlip ? handleKeyDown : undefined}
            onMouseEnter={() => canFlip && setIsFlipped(true)}
            onMouseLeave={() => canFlip && setIsFlipped(false)}
            className={`${canFlip ? "cursor-pointer" : "cursor-default"} outline-none transition-transform duration-100 ease-out mt-1`}
            style={{
              transform: `rotate(${angle}deg)`,
              transformOrigin: "top center",
            }}
          >
            <div
              className="relative w-[290px] sm:w-[300px] h-[404px] rounded-[24px] shadow-2xl transition-transform duration-700 [transform-style:preserve-3d]"
              style={{
                transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
              }}
            >
              {/* FRONT OF CARD */}
              <div
                className="absolute inset-0 w-full h-full bg-white rounded-[24px] border border-black/10 overflow-hidden p-5 flex flex-col justify-between [backface-visibility:hidden]"
                style={{
                  boxShadow: "0 10px 30px -5px rgba(0,0,0,0.1), inset 0 0 0 1px rgba(0,0,0,0.05)",
                }}
              >
                {/* Black top band */}
                <div className="bg-[#0d0d0d] text-white text-[10px] font-mono tracking-widest py-1.5 px-3 rounded-md flex items-center justify-between uppercase">
                  <span>DEVELOPER ID</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>

                {/* Portrait centered in 128x156 frame with gradient ring and hover zoom */}
                <div className="relative mx-auto my-2 w-[128px] h-[156px] rounded-xl p-[2px] bg-gradient-to-b from-neutral-300 to-neutral-100 shadow-inner group overflow-hidden">
                  <div className="w-full h-full rounded-[10px] overflow-hidden bg-neutral-100">
                    <img
                      src={PROFILE.idCard?.portraitBust || "/portrait-bust.webp"}
                      alt={PROFILE.name}
                      className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="absolute inset-0 rounded-xl ring-1 ring-black/5 pointer-events-none" />
                </div>

                {/* Identity Info */}
                <div className="text-center space-y-0.5">
                  <div className="font-bold text-sm text-[#0d0d0d] tracking-tight">{PROFILE.name}</div>
                  <div className="font-mono text-[11px] text-[#77756f]">{PROFILE.roleShort}</div>
                </div>

                {/* Rows: ID No, Dept, Valid till */}
                <div className="border-t border-dashed border-black/10 pt-2 grid grid-cols-3 text-center text-[10px] font-mono">
                  <div>
                    <span className="text-[#a9a6a0] block">ID NO</span>
                    <span className="font-semibold text-[#0d0d0d]">{PROFILE.idCard?.idNo || PROFILE.idNo || "SM-2025-DEV"}</span>
                  </div>
                  <div>
                    <span className="text-[#a9a6a0] block">DEPT</span>
                    <span className="font-semibold text-[#0d0d0d]">{PROFILE.idCard?.dept || PROFILE.dept || "ENG"}</span>
                  </div>
                  <div>
                    <span className="text-[#a9a6a0] block">VALID</span>
                    <span className="font-semibold text-[#0d0d0d]">{PROFILE.idCard?.validTill || PROFILE.validTill || "2025"}</span>
                  </div>
                </div>

                {/* Barcode & Holographic sticker */}
                <div className="flex items-center justify-between pt-1 border-t border-black/5">
                  <div className="h-6 flex items-center gap-[2px] opacity-75">
                    {[3, 1, 4, 1, 2, 5, 1, 3, 2, 1, 4, 2, 1, 3, 2, 4, 1].map((w, i) => (
                      <span key={i} className="h-full bg-black" style={{ width: `${w}px` }} />
                    ))}
                  </div>
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-neutral-300 via-neutral-100 to-neutral-400 border border-neutral-300 flex items-center justify-center text-[7px] font-mono text-neutral-600 shadow-sm">
                    ✓
                  </div>
                </div>
              </div>

              {/* BACK OF CARD */}
              <div
                className="absolute inset-0 w-full h-full bg-[#111111] text-white rounded-[24px] p-6 flex flex-col justify-between border border-neutral-800 [backface-visibility:hidden] [transform:rotateY(180deg)]"
              >
                <div>
                  <div className="text-[10px] font-mono tracking-widest uppercase text-neutral-400 mb-2">
                    What I am
                  </div>
                  <div className="space-y-2 text-xs text-neutral-300 font-sans leading-relaxed">
                    {Array.isArray(PROFILE.idCard?.backPoints) && PROFILE.idCard.backPoints.length > 0 ? (
                      PROFILE.idCard.backPoints.map((pt, i) => (
                        <p key={i}>{pt.startsWith("•") ? pt : `• ${pt}`}</p>
                      ))
                    ) : (
                      <>
                        <p>• {PROFILE.role}</p>
                        <p>• MCA (CGPA: 7.21) & B.Sc. IT (CGPA: 8.51)</p>
                        <p>• Engineered Multi-Tenant ATS matching 100+ resumes/day</p>
                        <p>• Real-time architectures: Socket.io, JWT, Zustand, Redis patterns</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-neutral-800">
                  <div className="text-[9px] font-mono text-neutral-500 italic">
                    {PROFILE.idCard?.certifiedText || "Certified MERN Stack Developer — Naresh i Tech"}
                  </div>
                  <div className="font-mono text-[9px] text-neutral-400">
                    If found, say hello · <a href={`mailto:${PROFILE.email}`} className="text-neutral-200 underline">{PROFILE.email}</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <span className="text-[10px] font-mono text-[#a9a6a0] mt-3">Hover or tap card to flip</span>
        </div>

        {/* Right Column: Quick facts + Paraphrased quote */}
        <div className="portfolio-card p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="font-mono text-xs uppercase tracking-wider text-[#77756f] mb-4">
              Quick Facts
            </div>
            <div className="space-y-3 text-sm divide-y divide-black/5">
              <div className="flex justify-between py-2">
                <span className="text-[#77756f]">Location</span>
                <span className="font-medium text-[#0d0d0d]">{PROFILE.location}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[#77756f]">Education</span>
                <span className="font-medium text-[#0d0d0d] text-right">
                  {typeof PROFILE.education === "string"
                    ? PROFILE.education
                    : PROFILE.education?.degree
                    ? `${PROFILE.education.degree}${PROFILE.education.year ? ` (${PROFILE.education.year})` : ""}`
                    : (EDUCATION?.[0]?.degree ? `${EDUCATION[0].degree} (${EDUCATION[0].year})` : "MCA (2025)")}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[#77756f]">Undergraduate</span>
                <span className="font-medium text-[#0d0d0d] text-right">
                  {typeof PROFILE.undergrad === "string"
                    ? PROFILE.undergrad
                    : PROFILE.undergrad?.degree
                    ? `${PROFILE.undergrad.degree} (${PROFILE.undergrad.cgpa ? `${PROFILE.undergrad.cgpa} CGPA` : PROFILE.undergrad.year})`
                    : (EDUCATION?.[1]?.degree ? `${EDUCATION[1].degree} (${EDUCATION[1].cgpa ? `${EDUCATION[1].cgpa} CGPA` : EDUCATION[1].year})` : "B.Sc. IT (8.51 CGPA)")}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[#77756f]">Recent Internship</span>
                <span className="font-medium text-[#0d0d0d] text-right">
                  {PROFILE.internship || "Arah Infotech"}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[#77756f]">Direct Email</span>
                <a href={`mailto:${PROFILE.email}`} className="font-mono text-xs text-[#0d0d0d] underline">
                  {PROFILE.email}
                </a>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-black/5 mt-6">
            <blockquote className="text-xs sm:text-sm text-[#3a3a3a] italic leading-relaxed">
              "{PROFILE.quote}"
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  );
}
