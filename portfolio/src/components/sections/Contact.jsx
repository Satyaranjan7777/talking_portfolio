import React, { useState } from "react";
import { useProfile } from "../../lib/content";
import { scrollToTarget } from "../../lib/scroll";

function BouncyWord({ text }) {
  return (
    <span className="inline-block whitespace-nowrap">
      {text.split("").map((char, i) => (
        <span
          key={i}
          className="inline-block transition-transform duration-300 ease-out hover:-translate-y-3 cursor-default"
        >
          {char}
        </span>
      ))}
    </span>
  );
}

export default function Contact() {
  const PROFILE = useProfile();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(PROFILE.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  };

  return (
    <footer id="contact" className="w-full pt-28 pb-12 px-[var(--gutter)] max-w-[1320px] mx-auto flex flex-col justify-between">
      {/* Top micro tag */}
      <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-[#77756f] mb-6">
        <span>06</span>
        <span>—</span>
        <span>Get in touch</span>
      </div>

      {/* Main Interactive Bouncy Heading + Spinning Badge */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 mb-16">
        <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-[#0d0d0d] leading-[1.05]">
          <div>
            <BouncyWord text="Let's build" />
          </div>
          <div>
            <span className="font-serif-italic font-normal text-[#77756f] mr-4">
              <BouncyWord text="something" />
            </span>
            <BouncyWord text="together." />
          </div>
        </h2>

        {/* Circular Spinning "Say Hello" badge */}
        <div className="relative w-32 h-32 shrink-0 self-start lg:self-center select-none">
          <div
            className="w-full h-full rounded-full border border-black/15 flex items-center justify-center animate-[spin_18s_linear_infinite]"
            aria-hidden="true"
          >
            <svg viewBox="0 0 100 100" className="w-full h-full p-2">
              <path
                id="textPath"
                d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
                fill="none"
              />
              <text className="text-[10.5px] font-mono uppercase tracking-[2.8px] fill-[#0d0d0d]">
                <textPath href="#textPath">
                  • SAY HELLO • OPEN TO OPPORTUNITIES
                </textPath>
              </text>
            </svg>
          </div>
          <div className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-[#0d0d0d] text-white flex items-center justify-center text-sm">
            ↗
          </div>
        </div>
      </div>

      {/* Direct Email with Copy Chip */}
      <div className="space-y-3 mb-16">
        <span className="font-mono text-xs text-[#77756f] uppercase tracking-wider block">
          Direct Inquiries
        </span>
        <div className="flex flex-wrap items-center gap-4">
          <a
            href={`mailto:${PROFILE.email}`}
            className="text-2xl sm:text-4xl md:text-5xl font-bold text-[#0d0d0d] tracking-tight underline underline-offset-8 decoration-black/20 hover:decoration-black transition-colors"
          >
            {PROFILE.email}
          </a>
          <button
            onClick={handleCopy}
            className="btn-secondary text-xs py-2 px-3.5 font-mono"
            aria-live="polite"
          >
            {copied ? "Copied ✓" : "Copy email"}
          </button>
        </div>
      </div>

      {/* Connectivity Channels: Phone, Location, GitHub, LinkedIn */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-8 border-t border-black/10 mb-20 text-sm">
        <div>
          <span className="font-mono text-xs text-[#77756f] block mb-1">Phone</span>
          <a href={PROFILE.phoneHref} className="font-medium text-[#0d0d0d] hover:underline">
            {PROFILE.phone}
          </a>
        </div>
        <div>
          <span className="font-mono text-xs text-[#77756f] block mb-1">Location</span>
          <span className="font-medium text-[#0d0d0d] block">
            {PROFILE.location || "Hyderabad, Telangana"}
          </span>
        </div>
        <div>
          <span className="font-mono text-xs text-[#77756f] block mb-1">GitHub</span>
          <a
            href={PROFILE.github}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[#0d0d0d] hover:underline truncate block"
          >
            {PROFILE.github ? `${PROFILE.github.replace(/^https?:\/\/(www\.)?/, "")} ↗` : "GitHub ↗"}
          </a>
        </div>
        <div>
          <span className="font-mono text-xs text-[#77756f] block mb-1">LinkedIn</span>
          <a
            href={PROFILE.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-[#0d0d0d] hover:underline truncate block"
          >
            {PROFILE.linkedin ? `${PROFILE.linkedin.replace(/^https?:\/\/(www\.)?/, "")} ↗` : "LinkedIn ↗"}
          </a>
        </div>
      </div>

      {/* Bottom Bar: Copyright, Back to top, Stack credit */}
      <div className="pt-8 border-t border-black/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#77756f]">
        <div>
          © {new Date().getFullYear()} {PROFILE.name}. All rights reserved.
        </div>
        <button
          onClick={() => scrollToTarget("#hero")}
          className="hover:text-[#0d0d0d] underline transition-colors"
        >
          Back to top ↑
        </button>
        <div>
          Designed & Built with React & Vite
        </div>
      </div>
    </footer>
  );
}
