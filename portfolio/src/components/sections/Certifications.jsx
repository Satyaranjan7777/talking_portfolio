import React from "react";
import { useCertifications } from "../../lib/content";

export default function Certifications() {
  const CERTIFICATIONS = useCertifications();
  return (
    <section
      id="certifications"
      className="w-full bg-white border-y border-black/10 py-24 sm:py-32"
    >
      <div className="max-w-[1320px] mx-auto px-[var(--gutter)] grid grid-cols-1 md:grid-cols-[340px_minmax(0,1fr)] gap-12 items-start">
        {/* Left Sticky Column */}
        <div className="md:sticky md:top-28 space-y-3">
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#77756f]">
            <span>04</span>
            <span>—</span>
            <span>Certifications</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0d0d0d]">
            Always <span className="font-serif-italic font-normal text-[#77756f]">learning.</span>
          </h2>

          <p className="font-mono text-xs text-[#77756f]">
            {CERTIFICATIONS.length} Verified Credential{CERTIFICATIONS.length > 1 ? "s" : ""}
          </p>
        </div>

        {/* Right Column: Numbered ink-flood list */}
        <div className="divide-y divide-black/10 border-y border-black/10">
          {CERTIFICATIONS.map((cert) => (
            <div
              key={cert.id}
              tabIndex={0}
              className="group relative p-6 sm:p-8 cursor-pointer overflow-hidden transition-colors duration-300 select-none outline-none focus-visible:ring-2 focus-visible:ring-black"
            >
              {/* Ink-Flood background (scaleX 0 -> 1 on hover) */}
              <div
                className="absolute inset-0 bg-[#0d0d0d] -z-10 origin-left scale-x-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100 group-focus:scale-x-100"
                aria-hidden="true"
              />

              <div className="flex items-baseline justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-[#77756f] group-hover:text-neutral-400 group-focus:text-neutral-400 transition-colors">
                      {cert.index}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-[#0d0d0d] group-hover:text-white group-focus:text-white transition-colors">
                      {cert.title}
                    </h3>
                  </div>

                  <p className="text-sm text-[#77756f] group-hover:text-neutral-300 group-focus:text-neutral-300 transition-colors">
                    {cert.issuer}
                  </p>

                  <p className="text-xs text-[#a9a6a0] group-hover:text-neutral-400 group-focus:text-neutral-400 transition-colors pt-1">
                    {cert.detail}
                  </p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span className="font-mono text-xs text-[#77756f] group-hover:text-neutral-400 group-focus:text-neutral-400 transition-colors">
                    {cert.year}
                  </span>
                  <span
                    className="text-lg font-bold text-[#0d0d0d] group-hover:text-white group-focus:text-white transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                    aria-hidden="true"
                  >
                    ↗
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
