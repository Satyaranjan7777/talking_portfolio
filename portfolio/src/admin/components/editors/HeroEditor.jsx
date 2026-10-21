import React, { useState } from "react";
import { useSectionEditor } from "../../hooks/useSectionEditor";
import EditorToolbar from "./EditorToolbar";
import HeroVideoManager from "../hero/HeroVideoManager";

export default function HeroEditor({ initialSubTab = "content" }) {
  const [subTab, setSubTab] = useState(initialSubTab);
  const editor = useSectionEditor("hero");
  const {
    data,
    setData,
    status,
    version,
    loading,
    saving,
    publishing,
    discarding,
    hasUnsavedChanges,
    error,
    validationErrors,
    successMsg,
    saveDraft,
    publish,
    discard,
  } = editor;

  if (loading) {
    return (
      <div className="admin-card p-12 text-center text-[#77756f] font-mono text-xs animate-pulse">
        Loading Hero Content...
      </div>
    );
  }

  const updateField = (field, value) => {
    setData({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-2 border-b border-black/10 pb-3">
        <button
          onClick={() => setSubTab("content")}
          className={`px-4 py-2 rounded-xl font-mono text-xs font-semibold transition-all ${
            subTab === "content"
              ? "bg-[#0d0d0d] text-[#f4f2ee] shadow-sm"
              : "text-[#77756f] hover:text-[#0d0d0d] hover:bg-black/5"
          }`}
        >
          ✨ Identity & Headline
        </button>
        <button
          onClick={() => setSubTab("video")}
          className={`px-4 py-2 rounded-xl font-mono text-xs font-semibold transition-all ${
            subTab === "video"
              ? "bg-[#0d0d0d] text-[#f4f2ee] shadow-sm"
              : "text-[#77756f] hover:text-[#0d0d0d] hover:bg-black/5"
          }`}
        >
          🎬 Hero Video (16:9)
        </button>
      </div>

      {subTab === "video" ? (
        <HeroVideoManager />
      ) : (
        <div className="space-y-6">
          <EditorToolbar
            sectionKey="hero"
            title="Hero Content"
            subtitle="Manage landing view identity, roles, ghost watermark, status pill, and value quote."
            currentData={data}
            isRevisionsOpen={editor.isRevisionsOpen}
            onOpenRevisions={editor.openRevisions}
            onCloseRevisions={editor.closeRevisions}
            onRestoreSuccess={editor.refetch}
            hasConflict={editor.hasConflict}
            remoteVersion={editor.remoteVersion}
            onReloadLatest={editor.reloadLatest}
            version={version}
            status={status}
            hasUnsavedChanges={hasUnsavedChanges}
            saving={saving}
            publishing={publishing}
            discarding={discarding}
            error={error}
            validationErrors={validationErrors}
            successMsg={successMsg}
            onSaveDraft={saveDraft}
            onPublish={publish}
            onDiscard={discard}
          />

          <div className="admin-card p-6 sm:p-8 space-y-6">
            <h3 className="text-base font-bold text-[#0d0d0d] pb-3 border-b border-black/5">
              Identity & Headline
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#0d0d0d] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={data?.name || ""}
                  onChange={(e) => updateField("name", e.target.value)}
                  className="admin-input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0d0d0d] mb-1">
                  First Name Watermark (All-Caps Ghost Text)
                </label>
                <input
                  type="text"
                  value={data?.firstName || ""}
                  onChange={(e) => updateField("firstName", e.target.value)}
                  className="admin-input font-mono uppercase"
                />
                <p className="text-[11px] text-[#77756f] mt-1">
                  Rendered in huge 16vw typography behind the video on desktop.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0d0d0d] mb-1">
                  Role / Subtitle
                </label>
                <input
                  type="text"
                  value={data?.role || ""}
                  onChange={(e) => updateField("role", e.target.value)}
                  className="admin-input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0d0d0d] mb-1">
                  Short Role (Navbar badge)
                </label>
                <input
                  type="text"
                  value={data?.roleShort || ""}
                  onChange={(e) => updateField("roleShort", e.target.value)}
                  className="admin-input font-mono text-xs"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#0d0d0d] mb-1">
                  Status Tag Pill
                </label>
                <input
                  type="text"
                  value={data?.statusTag || ""}
                  onChange={(e) => updateField("statusTag", e.target.value)}
                  placeholder="e.g. Available for Full-Stack Opportunities"
                  className="admin-input"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#0d0d0d] mb-1">
                  Hero Quote / Value Statement
                </label>
                <textarea
                  rows={3}
                  value={data?.quote || ""}
                  onChange={(e) => updateField("quote", e.target.value)}
                  className="admin-input"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
