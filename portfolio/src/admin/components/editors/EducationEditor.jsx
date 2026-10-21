import React, { useState } from "react";
import { useSectionEditor } from "../../hooks/useSectionEditor";
import EditorToolbar from "./EditorToolbar";

export default function EducationEditor() {
  const editor = useSectionEditor("education");
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
        Loading Education Editor...
      </div>
    );
  }

  const education = data?.education || [];
  const currentItem = education[activeIndex] || education[0] || null;

  const updateItem = (updates) => {
    const updated = education.map((item, idx) =>
      idx === activeIndex ? { ...item, ...updates } : item
    );
    setData({ ...data, education: updated });
  };

  const handleAddEducation = () => {
    const newItem = {
      degree: "Degree / Course Name",
      institution: "University / College Name",
      cgpa: "8.00 CGPA",
      year: "2025",
    };
    const updated = [...education, newItem];
    setData({ ...data, education: updated });
    setActiveIndex(updated.length - 1);
  };

  const handleDeleteEducation = (idx) => {
    if (education.length <= 1) {
      alert("At least one education record must remain.");
      return;
    }
    if (!confirm(`Delete degree "${education[idx]?.degree}"?`)) return;
    const filtered = education.filter((_, i) => i !== idx);
    setData({ ...data, education: filtered });
    setActiveIndex(Math.max(0, idx - 1));
  };

  return (
    <div className="space-y-6">
      <EditorToolbar
        sectionKey="education"
        title="Education Section"
        subtitle="Manage academic qualifications, university records, and GPA/CGPA scores."
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
        {/* Left Column: Education List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="admin-card p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-black/5">
              <span className="font-mono text-xs uppercase tracking-wider text-[#77756f]">
                Degrees ({education.length})
              </span>
              <button
                type="button"
                onClick={handleAddEducation}
                className="admin-btn-primary text-xs px-2.5 py-1"
              >
                + Add Degree
              </button>
            </div>

            <div className="space-y-2">
              {education.map((item, idx) => {
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
                    <div className="truncate">
                      <div className="font-semibold text-xs truncate">
                        {item.degree}
                      </div>
                      <div
                        className={`font-mono text-[10px] truncate ${
                          isSelected ? "text-neutral-400" : "text-[#77756f]"
                        }`}
                      >
                        {item.year} • {item.cgpa}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteEducation(idx);
                      }}
                      className={`text-xs px-1.5 py-0.5 rounded ${
                        isSelected
                          ? "text-neutral-400 hover:text-rose-400"
                          : "text-[#77756f] hover:text-rose-600"
                      }`}
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Detail Form */}
        <div className="lg:col-span-8">
          {currentItem ? (
            <div className="admin-card p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-black/5">
                <div>
                  <div className="font-mono text-xs text-[#77756f] uppercase">
                    Academic Degree #{activeIndex + 1}
                  </div>
                  <h3 className="text-xl font-bold text-[#0d0d0d]">
                    {currentItem.degree}
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#0d0d0d] mb-1">
                    Degree / Qualification Name
                  </label>
                  <input
                    type="text"
                    value={currentItem.degree || ""}
                    onChange={(e) => updateItem({ degree: e.target.value })}
                    className="admin-input"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#0d0d0d] mb-1">
                    Institution / University
                  </label>
                  <input
                    type="text"
                    value={currentItem.institution || ""}
                    onChange={(e) =>
                      updateItem({ institution: e.target.value })
                    }
                    className="admin-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0d0d0d] mb-1">
                    CGPA / Percentage Score
                  </label>
                  <input
                    type="text"
                    value={currentItem.cgpa || ""}
                    onChange={(e) => updateItem({ cgpa: e.target.value })}
                    placeholder="e.g. 8.51 CGPA"
                    className="admin-input font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0d0d0d] mb-1">
                    Completion Year / Period
                  </label>
                  <input
                    type="text"
                    value={currentItem.year || ""}
                    onChange={(e) => updateItem({ year: e.target.value })}
                    placeholder="e.g. 2025"
                    className="admin-input font-mono text-xs"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="admin-card p-12 text-center text-[#77756f] text-xs">
              Select or add a degree on the left to begin editing.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
