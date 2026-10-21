import React, { useState } from "react";
import { useSectionEditor } from "../../hooks/useSectionEditor";
import EditorToolbar from "./EditorToolbar";

export default function ExperienceEditor() {
  const editor = useSectionEditor("experience");
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

  const [activeIndex, setActiveIndex] = useState(0);

  if (loading) {
    return (
      <div className="admin-card p-12 text-center text-[#77756f] font-mono text-xs animate-pulse">
        Loading Experience Editor...
      </div>
    );
  }

  const timeline = data?.timeline || [];
  const currentItem = timeline[activeIndex] || timeline[0] || null;

  const updateItem = (updates) => {
    const updated = timeline.map((item, idx) =>
      idx === activeIndex ? { ...item, ...updates } : item
    );
    setData({ ...data, timeline: updated });
  };

  const handleMove = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= timeline.length) return;
    const copy = [...timeline];
    const [moved] = copy.splice(index, 1);
    copy.splice(target, 0, moved);
    setData({ ...data, timeline: copy });
    setActiveIndex(target);
  };

  const handleAddItem = () => {
    const newItem = {
      type: "experience",
      year: "2026",
      period: "Present",
      title: "Full Stack Engineer",
      place: "Company / Organization Name",
      detail:
        "Engineered scalable full-stack features, optimized API latencies, and collaborated on architecture.",
    };
    const updated = [...timeline, newItem];
    setData({ ...data, timeline: updated });
    setActiveIndex(updated.length - 1);
  };

  const handleDeleteItem = (idx) => {
    if (timeline.length <= 1) {
      alert("At least one timeline entry must remain.");
      return;
    }
    if (!confirm(`Delete entry "${timeline[idx]?.title}"?`)) return;
    const filtered = timeline.filter((_, i) => i !== idx);
    setData({ ...data, timeline: filtered });
    setActiveIndex(Math.max(0, idx - 1));
  };

  return (
    <div className="space-y-6">
      <EditorToolbar
        sectionKey="experience"
        title="Experience & Journey Timeline"
        subtitle="Manage chronological career milestones, internship achievements, and company details."
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Timeline items */}
        <div className="lg:col-span-4 space-y-3">
          <div className="admin-card p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-black/5">
              <span className="font-mono text-xs uppercase tracking-wider text-[#77756f]">
                Timeline ({timeline.length})
              </span>
              <button
                type="button"
                onClick={handleAddItem}
                className="admin-btn-primary text-xs px-2.5 py-1"
              >
                + Add Item
              </button>
            </div>

            <div className="space-y-2">
              {timeline.map((item, idx) => {
                const isSelected = idx === activeIndex;
                return (
                  <div
                    key={idx}
                    onClick={() => setActiveIndex(idx)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? "bg-[#0d0d0d] text-white border-[#0d0d0d]"
                        : "bg-white hover:bg-neutral-50 border-black/10 text-[#0d0d0d]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <span
                        className={`font-mono text-[10px] uppercase px-1.5 py-0.5 rounded font-bold shrink-0 ${
                          isSelected
                            ? "bg-neutral-800 text-neutral-300"
                            : "bg-black/5 text-[#77756f]"
                        }`}
                      >
                        {item.year}
                      </span>
                      <div className="truncate">
                        <div className="font-semibold text-xs truncate">
                          {item.title}
                        </div>
                        <div
                          className={`font-mono text-[10px] truncate ${
                            isSelected ? "text-neutral-400" : "text-[#77756f]"
                          }`}
                        >
                          {item.place}
                        </div>
                      </div>
                    </div>

                    <div
                      className="flex items-center gap-1 shrink-0 ml-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => handleMove(idx, -1)}
                        disabled={idx === 0}
                        title="Move Up"
                        className={`w-6 h-6 rounded flex items-center justify-center font-mono text-xs ${
                          isSelected
                            ? "hover:bg-neutral-800 disabled:opacity-30"
                            : "hover:bg-neutral-100 disabled:opacity-30"
                        }`}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMove(idx, 1)}
                        disabled={idx === timeline.length - 1}
                        title="Move Down"
                        className={`w-6 h-6 rounded flex items-center justify-center font-mono text-xs ${
                          isSelected
                            ? "hover:bg-neutral-800 disabled:opacity-30"
                            : "hover:bg-neutral-100 disabled:opacity-30"
                        }`}
                      >
                        ↓
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Timeline Item Details */}
        <div className="lg:col-span-8">
          {currentItem ? (
            <div className="admin-card p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-black/5">
                <div>
                  <div className="font-mono text-xs text-[#77756f] uppercase">
                    Timeline Item #{activeIndex + 1}
                  </div>
                  <h3 className="text-xl font-bold text-[#0d0d0d]">
                    {currentItem.title}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteItem(activeIndex)}
                  className="text-xs text-rose-600 hover:text-rose-800 font-mono px-2 py-1"
                >
                  Delete Item
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#0d0d0d] mb-1">
                    Entry Type
                  </label>
                  <select
                    value={currentItem.type || "experience"}
                    onChange={(e) => updateItem({ type: e.target.value })}
                    className="admin-input font-mono text-xs"
                  >
                    <option value="experience">Professional Experience</option>
                    <option value="education">Academic / Education</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0d0d0d] mb-1">
                    Year / Timeline Marker
                  </label>
                  <input
                    type="text"
                    value={currentItem.year || ""}
                    onChange={(e) => updateItem({ year: e.target.value })}
                    placeholder="e.g. 2026"
                    className="admin-input font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0d0d0d] mb-1">
                    Job Title / Role
                  </label>
                  <input
                    type="text"
                    value={currentItem.title || ""}
                    onChange={(e) => updateItem({ title: e.target.value })}
                    className="admin-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0d0d0d] mb-1">
                    Company / Institution
                  </label>
                  <input
                    type="text"
                    value={currentItem.place || ""}
                    onChange={(e) => updateItem({ place: e.target.value })}
                    className="admin-input"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#0d0d0d] mb-1">
                    Active Period (Optional)
                  </label>
                  <input
                    type="text"
                    value={currentItem.period || ""}
                    onChange={(e) => updateItem({ period: e.target.value })}
                    placeholder="e.g. Apr 2026 – Jul 2026"
                    className="admin-input"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#0d0d0d] mb-1">
                    Description & Key Deliverables
                  </label>
                  <textarea
                    rows={4}
                    value={currentItem.detail || ""}
                    onChange={(e) => updateItem({ detail: e.target.value })}
                    className="admin-input"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="admin-card p-12 text-center text-[#77756f] text-xs">
              Select or add a timeline item on the left to begin editing.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
