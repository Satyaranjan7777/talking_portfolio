import React, { useState } from "react";
import { useSkills } from "../../lib/content";
import TechLogo from "../ui/TechLogo";

export default function Skills() {
  const { ALL_SKILLS, SKILL_GROUPS } = useSkills();
  const [selectedFamily, setSelectedFamily] = useState("All");
  const [selectedSkill, setSelectedSkill] = useState(null);

  const activeSkill = selectedSkill || ALL_SKILLS?.[0];
  const families = ["All", ...(SKILL_GROUPS || []).map((g) => g.family)];

  return (
    <section id="skills" className="py-24 sm:py-32 px-[var(--gutter)] max-w-[1320px] mx-auto w-full">
      {/* Section Tag */}
      <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#77756f] mb-3">
        <span>02</span>
        <span>—</span>
        <span>The Stack</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#0d0d0d]">
          Periodic table of <span className="font-serif-italic font-normal text-[#77756f]">my stack.</span>
        </h2>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2">
          {families.map((fam) => (
            <button
              key={fam}
              onClick={() => setSelectedFamily(fam)}
              className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all duration-200 ${
                selectedFamily === fam
                  ? "bg-[#0d0d0d] text-white"
                  : "bg-white border border-black/10 text-[#77756f] hover:text-[#0d0d0d] hover:border-black/30"
              }`}
            >
              {fam}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid + Inspector Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-8 items-start">
        {/* Periodic Grid: 8 columns on desktop, 4 on mobile */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2.5">
          {ALL_SKILLS.map((skill, idx) => {
            const row = Math.floor(idx / 8);
            const col = idx % 8;
            const delayMs = (row + col) * 40;
            const isMatch = selectedFamily === "All" || skill.family === selectedFamily;
            const isCurrent = activeSkill?.name === skill.name;

            return (
              <div
                key={skill.name}
                tabIndex={0}
                role="button"
                aria-label={`Skill: ${skill.name}`}
                onMouseEnter={() => setSelectedSkill(skill)}
                onFocus={() => setSelectedSkill(skill)}
                className={`relative aspect-square p-2 rounded-xl transition-all duration-300 cursor-pointer flex flex-col justify-between select-none ${
                  isMatch ? "opacity-100" : "opacity-25 scale-95"
                } ${
                  isCurrent
                    ? "bg-[#0d0d0d] text-white shadow-lg ring-2 ring-black"
                    : "bg-white text-[#0d0d0d] border border-black/10 hover:border-black/40 hover:-translate-y-0.5"
                }`}
                style={{
                  transitionDelay: `${delayMs}ms`,
                }}
              >
                <div className="flex items-start justify-between font-mono text-[9px] leading-none opacity-60">
                  <span>{skill.atomicNumber}</span>
                  <span className="hidden sm:inline">{skill.family.slice(0, 3)}</span>
                </div>

                <div className="text-center font-bold text-base sm:text-lg tracking-tight my-auto">
                  {skill.symbol}
                </div>

                <div className="text-[10px] truncate text-center font-medium opacity-80 leading-tight">
                  {skill.name}
                </div>
              </div>
            );
          })}
        </div>

        {/* Inspector Panel: sticky on right */}
        <aside
          className="portfolio-card p-6 lg:sticky lg:top-28 flex flex-col items-center text-center space-y-6"
          aria-live="polite"
        >
          <div className="w-full flex items-center justify-between text-xs font-mono text-[#77756f] border-b border-black/5 pb-3">
            <span>ELEMENT INSPECTOR</span>
            <span>№ {activeSkill?.atomicNumber || "00"}</span>
          </div>

          {/* 150px Logo with pop animation */}
          <div className="w-[150px] h-[150px] rounded-2xl bg-neutral-50 border border-black/5 flex items-center justify-center p-6 shadow-inner transition-transform duration-300 hover:scale-105">
            <TechLogo
              brandKey={activeSkill?.brandKey}
              conceptKey={activeSkill?.conceptKey}
              size={96}
            />
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-[#0d0d0d] tracking-tight">
              {activeSkill?.name}
            </h3>
            <div className="inline-block px-3 py-1 bg-black/5 rounded-full font-mono text-xs text-[#77756f]">
              {activeSkill?.family}
            </div>
            <p className="text-xs text-[#3a3a3a] pt-1">{activeSkill?.detail}</p>
          </div>

          {/* Projects using this skill */}
          <div className="w-full text-left pt-4 border-t border-black/5 space-y-2">
            <div className="font-mono text-[11px] text-[#77756f] uppercase tracking-wider">
              Used in Projects:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {activeSkill?.usedIn?.map((p) => (
                <span
                  key={p}
                  className="px-2.5 py-1 rounded-md bg-[#0d0d0d] text-white text-[11px] font-medium"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
