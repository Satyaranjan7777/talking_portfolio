import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import AdminToastContainer from "./notifications/AdminToastContainer";

export default function AdminLayout({ activeTab, onSelectTab, children }) {
  const { admin, logout } = useAuth();
  const { connected } = useSocket();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "hero", label: "Hero Content", icon: "✨" },
    { id: "about", label: "About & ID", icon: "🪪" },
    { id: "skills", label: "Skills Matrix", icon: "⚛️" },
    { id: "projects", label: "Selected Work", icon: "💼" },
    { id: "certifications", label: "Certifications", icon: "📜" },
    { id: "experience", label: "Chronology", icon: "⏳" },
    { id: "education", label: "Education", icon: "🎓" },
    { id: "contact", label: "Contact & Footer", icon: "✉️" },
    { id: "resume", label: "Resume (Cloudinary)", icon: "📄" },
    { id: "seo", label: "SEO & Meta", icon: "🌐" },
    { id: "security", label: "Security & Audit", icon: "🛡️" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];


  return (
    <div className="h-screen h-[100svh] bg-[#f4f2ee] flex flex-col text-[#0d0d0d] overflow-hidden">
      {/* Realtime Toast Notifications Container */}
      <AdminToastContainer />

      {/* Frosted Glass Top Bar */}
      <header className="admin-glass-bar shrink-0 sticky top-0 z-40 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="md:hidden w-8 h-8 rounded-full border border-black/15 flex items-center justify-center text-xs cursor-pointer hover:bg-black/5"
            aria-label="Toggle Navigation"
          >
            ☰
          </button>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#0d0d0d] text-[#f4f2ee] font-mono text-[11px] font-bold flex items-center justify-center">
              SM
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight block">
                Portfolio Admin
              </span>
              <span className="text-[10px] font-mono text-[#77756f] hidden sm:block">
                Production Control Panel
              </span>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Socket Connection Status Pill */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/5 font-mono text-[10px] text-[#77756f]">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                connected ? "bg-emerald-500 animate-pulse" : "bg-neutral-400"
              }`}
            />
            <span>{connected ? "Sync: Connected" : "Sync: Connecting..."}</span>
          </div>

          {/* Live Preview Toggle Button */}
          <button
            onClick={() => setPreviewOpen(!previewOpen)}
            className={`admin-btn-secondary text-xs py-1.5 px-3.5 ${
              previewOpen ? "bg-[#0d0d0d] text-white border-[#0d0d0d]" : ""
            }`}
          >
            {previewOpen ? "Close Preview ✕" : "Live Preview 👁"}
          </button>

          {/* View Public Site */}
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex admin-btn-ghost text-xs"
          >
            View Live ↗
          </a>

          {/* Logout */}
          <button
            onClick={logout}
            className="admin-btn-secondary text-xs py-1.5 px-3 text-rose-700 hover:bg-rose-50 border-rose-200"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Admin Workspace */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Navigation Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/95 backdrop-blur-md border-r border-black/10 flex flex-col p-4 transition-transform duration-300 md:static md:translate-x-0 md:bg-white/80 shrink-0 h-full ${
            mobileSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
          }`}
        >
          <div className="px-3 pb-3 border-b border-black/5 flex items-center justify-between shrink-0">
            <span className="font-mono text-[11px] text-[#77756f] uppercase tracking-wider font-semibold">
              Navigation
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-neutral-400">
                {admin?.role || "Owner"}
              </span>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="md:hidden w-6 h-6 rounded-full bg-black/5 flex items-center justify-center text-xs text-[#77756f] hover:text-black cursor-pointer"
                aria-label="Close sidebar"
              >
                ✕
              </button>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto space-y-1 py-3 pr-1 custom-admin-scrollbar min-h-0">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    setMobileSidebarOpen(false);
                  }}
                  className={`admin-nav-item w-full ${
                    isActive ? "admin-nav-item-active" : ""
                  }`}
                >
                  <span className="text-sm shrink-0">{item.icon}</span>
                  <span className="text-xs font-medium truncate">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Admin Profile Footer */}
          <div className="pt-3 border-t border-black/5 flex items-center gap-2.5 px-2 shrink-0">
            <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center font-mono text-[11px] font-bold shrink-0">
              {admin?.email?.charAt(0).toUpperCase() || "A"}
            </div>
            <div className="truncate flex-1">
              <div className="font-semibold text-xs truncate text-[#0d0d0d]">
                {admin?.email || "Admin User"}
              </div>
              <div className="text-[10px] text-emerald-600 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                Active Session
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile Backdrop */}
        {mobileSidebarOpen && (
          <div
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 bg-black/30 backdrop-blur-xs z-40 md:hidden"
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-10 no-scrollbar min-h-0">
          {children}
        </main>

        {/* Right "Live preview" drawer (iframe) */}
        {previewOpen && (
          <aside className="w-full lg:w-[460px] xl:w-[540px] border-l border-black/10 bg-white flex flex-col shrink-0 transition-all duration-300">
            <div className="p-3 border-b border-black/10 flex items-center justify-between text-xs font-mono bg-neutral-50">
              <span className="font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Preview
              </span>
              <a href="/" target="_blank" className="underline text-[#77756f] hover:text-black">
                Full View ↗
              </a>
            </div>
            <iframe
              src="/"
              title="Public Site Live Preview"
              className="w-full flex-1 border-0"
            />
          </aside>
        )}
      </div>
    </div>
  );
}
