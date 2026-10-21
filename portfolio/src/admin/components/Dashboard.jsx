import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function Dashboard({ onNavigate }) {
  const { admin } = useAuth();
  const [sections, setSections] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOverview() {
      try {
        const res = await fetch("/api/content");
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setSections(json.data);
          }
        }
      } catch (err) {
        console.error("Failed to load content overview", err);
      } finally {
        setLoading(false);
      }
    }

    loadOverview();
  }, []);

  const sectionCards = [
    { key: "hero", name: "Hero Content", icon: "✨", desc: "Identity, role, ghost watermark, quote, and Cloudinary 16:9 hero video" },
    { key: "about", name: "About & ID Card", icon: "🪪", desc: "Profile summary, 3D hanging lanyard card & quick facts" },
    { key: "skills", name: "Skills Matrix", icon: "⚛️", desc: "Periodic table elements, tech stack & family categories" },
    { key: "projects", name: "Selected Work", icon: "💼", desc: "Project accordion cards, tech chips & mini-UI previews" },
    { key: "certifications", name: "Certifications", icon: "📜", desc: "Ink-flood certifications list & verified credentials" },
    { key: "experience", name: "Chronology", icon: "⏳", desc: "Scroll-drawn timeline of experience & academic stops" },
    { key: "contact", name: "Contact & Footer", icon: "✉️", desc: "Inquiry email, telephone, socials & bouncy header" },
    { key: "resume", name: "Resume & PDF Sync", icon: "📄", desc: "Cloudinary raw PDF upload, versioning, rollback & realtime sync" },
    { key: "seo", name: "SEO & Social Card", icon: "🌐", desc: "OpenGraph preview, title tags & meta descriptions" },
    { key: "settings", name: "System Settings", icon: "⚙️", desc: "Section visibility toggles and security controls" },
  ];


  return (
    <div className="space-y-8 max-w-[1200px]">
      {/* Welcome Card */}
      <div className="admin-card p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-[#77756f]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            CONSOLE ACTIVE
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0d0d0d]">
            Welcome, <span className="font-serif-italic font-normal text-[#77756f]">{admin?.email.split("@")[0]}</span>
          </h2>
          <p className="text-xs text-[#77756f] font-mono">
            Last authenticated: {admin?.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleString() : "First session"}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="admin-btn-secondary text-xs"
          >
            Open Public Site ↗
          </a>
        </div>
      </div>

      {/* Section Grid Overview */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#0d0d0d] tracking-tight">
            Managed Content Sections
          </h3>
          <span className="text-xs font-mono text-[#77756f]">
            {sectionCards.length} Sections Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sectionCards.map((sec) => {
            const secData = sections[sec.key];
            const version = secData?.version || 1;
            const updatedAt = secData?.updatedAt;

            return (
              <div
                key={sec.key}
                onClick={() => onNavigate(sec.key)}
                className="admin-card p-5 cursor-pointer flex flex-col justify-between space-y-4 hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center text-lg">
                    {sec.icon}
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Published
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-black/5 text-[#77756f]">
                      v{version}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-base text-[#0d0d0d] tracking-tight">
                    {sec.name}
                  </h4>
                  <p className="text-xs text-[#77756f] line-clamp-2 mt-0.5">
                    {sec.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-black/5 flex items-center justify-between text-[11px] font-mono text-[#a9a6a0]">
                  <span>{updatedAt ? `Updated ${new Date(updatedAt).toLocaleDateString()}` : "Seeded data"}</span>
                  <span className="text-[#0d0d0d] font-semibold">Edit →</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Activity / System Status */}
      <div className="admin-card p-6 space-y-4">
        <h3 className="text-base font-bold text-[#0d0d0d] tracking-tight">
          System & Storage Health
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-3 rounded-xl bg-neutral-50 border border-black/5">
            <span className="text-[#77756f] block">Realtime SSE</span>
            <span className="text-emerald-700 font-bold">Online & Broadcasting</span>
          </div>
          <div className="p-3 rounded-xl bg-neutral-50 border border-black/5">
            <span className="text-[#77756f] block">Database Engine</span>
            <span className="text-[#0d0d0d] font-bold">MongoDB Atlas / Local</span>
          </div>
          <div className="p-3 rounded-xl bg-neutral-50 border border-black/5">
            <span className="text-[#77756f] block">Version Snapshots</span>
            <span className="text-[#0d0d0d] font-bold">30 Revisions / Section</span>
          </div>
        </div>
      </div>
    </div>
  );
}
