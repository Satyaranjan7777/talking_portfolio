import React, { useState } from "react";
import { useProjects } from "../../lib/content";

export default function Work() {
  const PROJECTS = useProjects();
  const [activeId, setActiveId] = useState(PROJECTS[0]?.id || "draft-chat");
  const currentActiveId = PROJECTS.some((p) => p.id === activeId) ? activeId : (PROJECTS[0]?.id || "draft-chat");

  return (
    <section id="work" className="py-24 sm:py-32 px-[var(--gutter)] max-w-[1320px] mx-auto w-full">
      {/* Section Tag */}
      <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#77756f] mb-3">
        <span>03</span>
        <span>—</span>
        <span>Selected Work</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12 sm:mb-16">
        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#0d0d0d]">
          Things I've <span className="font-serif-italic font-normal text-[#77756f]">built.</span>
        </h2>
        <span className="font-mono text-xs text-[#77756f]">
          {PROJECTS.length} Systems Engineered
        </span>
      </div>

      {/* Expanding Accordion Gallery */}
      <div className="flex flex-col md:flex-row gap-4 h-auto md:h-[min(78svh,620px)] w-full">
        {PROJECTS.map((project) => {
          const isOpen = currentActiveId === project.id;

          return (
            <div
              key={project.id}
              tabIndex={0}
              role="button"
              aria-expanded={isOpen}
              onClick={() => setActiveId(project.id)}
              onFocus={() => setActiveId(project.id)}
              className={`portfolio-card overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col md:flex-row ${
                isOpen
                  ? "md:flex-[8] min-h-[500px] md:min-h-0 bg-white"
                  : "md:flex-[1] min-h-[70px] md:min-h-0 bg-neutral-100/70 hover:bg-white cursor-pointer"
              }`}
            >
              {/* Collapsed Spine view (Visible when closed on desktop) */}
              {!isOpen && (
                <div className="w-full h-full p-4 md:p-6 flex flex-row md:flex-col justify-between items-center select-none">
                  <span className="font-mono text-xs font-semibold text-[#0d0d0d]">
                    {project.index}
                  </span>
                  <span className="font-medium text-sm text-[#3a3a3a] md:[writing-mode:vertical-rl] md:rotate-180 truncate">
                    {project.title}
                  </span>
                  <div className="w-8 h-8 rounded-full border border-black/15 flex items-center justify-center text-sm font-mono transition-transform duration-300 hover:rotate-90">
                    +
                  </div>
                </div>
              )}

              {/* Expanded Content View */}
              {isOpen && (
                <div className="w-full h-full p-6 sm:p-10 flex flex-col lg:flex-row gap-8 justify-between overflow-y-auto no-scrollbar">
                  {/* Left Column: Details */}
                  <div className="flex-1 flex flex-col justify-between space-y-6">
                    <div>
                      <div className="flex items-center gap-3 font-mono text-xs text-[#77756f] uppercase tracking-wider mb-2">
                        <span>{project.index}</span>
                        <span>•</span>
                        <span>{project.kicker}</span>
                        <span>•</span>
                        <span>{project.date}</span>
                      </div>

                      <h3 className="text-2xl sm:text-3xl font-bold text-[#0d0d0d] tracking-tight mb-3">
                        {project.title}
                      </h3>

                      <p className="text-sm text-[#3a3a3a] leading-relaxed mb-6">
                        {project.description}
                      </p>

                      {/* 2-Column Feature List */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-4 border-t border-black/5">
                        {project.features.map((feat, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-[#3a3a3a]">
                            <span className="text-[#0d0d0d] font-bold">✓</span>
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tech Chips & GitHub CTA */}
                    <div className="pt-6 border-t border-black/5 space-y-4">
                      <div className="flex flex-wrap gap-1.5">
                        {project.tech.map((t) => (
                          <span
                            key={t}
                            className="px-2.5 py-1 rounded-full bg-black/5 text-[#0d0d0d] font-mono text-[11px]"
                          >
                            {t}
                          </span>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-3">
                        {project.github && (
                          <a
                            href={project.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-primary text-xs py-2 px-5"
                          >
                            View on GitHub ↗
                          </a>
                        )}
                        {project.live && (
                          <a
                            href={project.live}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-secondary text-xs py-2 px-5"
                          >
                            Live Demo ↗
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Illustrative Mini-UI (Pure CSS/JSX Grayscale) */}
                  <div className="w-full lg:w-[380px] shrink-0 flex flex-col items-center justify-center">
                    <div className="relative w-full aspect-[4/3] rounded-2xl bg-neutral-900 border border-neutral-800 p-4 shadow-xl flex flex-col justify-between overflow-hidden">
                      {/* Top Bar */}
                      <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                        <div className="flex gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-neutral-700" />
                          <span className="w-2 h-2 rounded-full bg-neutral-700" />
                          <span className="w-2 h-2 rounded-full bg-neutral-700" />
                        </div>
                        <span className="font-mono text-[9px] uppercase tracking-wider text-neutral-400">
                          {project.title.slice(0, 15)} — preview
                        </span>
                      </div>

                      {/* Illustrative Canvas */}
                      <div className="my-auto space-y-2 py-2">
                        {((project.miniUiVariant === "chat") || (!project.miniUiVariant && project.id === "draft-chat")) ? (
                          /* Chat Mockup */
                          <div className="space-y-2 font-mono text-[10px]">
                            <div className="bg-neutral-800 text-neutral-200 p-2 rounded-lg max-w-[80%]">
                              Socket.io connected (latency: 18ms)
                            </div>
                            <div className="bg-white text-black p-2 rounded-lg max-w-[80%] ml-auto text-right">
                              Message encrypted & synced.
                            </div>
                            <div className="flex items-center gap-2 pt-2 text-neutral-500 text-[9px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              2 users online • tab session isolated
                            </div>
                          </div>
                        ) : ((project.miniUiVariant === "store") || (!project.miniUiVariant && project.id === "ezzyshop")) ? (
                          /* E-commerce Mockup */
                          <div className="space-y-2 font-mono text-[10px]">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="bg-neutral-800 p-2 rounded border border-neutral-700 text-neutral-300">
                                Item #402 • ₹1,299
                              </div>
                              <div className="bg-neutral-800 p-2 rounded border border-neutral-700 text-neutral-300">
                                Stock: In Cart
                              </div>
                            </div>
                            <div className="bg-neutral-800/80 p-2 rounded text-neutral-400 text-[9px]">
                              RBAC Authorization: Admin Verified
                            </div>
                          </div>
                        ) : ((project.miniUiVariant === "kanban") || (!project.miniUiVariant && project.id === "cms-recruitment")) ? (
                          /* 8-stage pipeline mockup */
                          <div className="space-y-2 font-mono text-[9px]">
                            <div className="flex gap-1 overflow-hidden">
                              {["Sourced", "Screen", "Tech", "Offer"].map((stage, i) => (
                                <div key={i} className="flex-1 bg-neutral-800 p-1 rounded text-center text-neutral-300">
                                  {stage}
                                </div>
                              ))}
                            </div>
                            <div className="bg-neutral-800 p-2 rounded text-neutral-300 text-center">
                              Groq/Gemini ATS Score: 94% Match
                            </div>
                          </div>
                        ) : (
                          /* Generic / Systems Mockup */
                          <div className="space-y-2 font-mono text-[10px]">
                            <div className="bg-neutral-800 p-2 rounded text-neutral-300 flex justify-between">
                              <span>Service: Active</span>
                              <span className="text-emerald-400">Synced</span>
                            </div>
                            <div className="bg-neutral-800 p-2 rounded text-neutral-400 text-[9px]">
                              Zero-Downtime Microservices • Verified
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Footer Badge */}
                      <div className="text-center font-mono text-[9px] uppercase tracking-wider text-neutral-500">
                        Illustrative UI
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
