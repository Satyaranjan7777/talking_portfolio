import React, { useState } from "react";
import { useSectionEditor } from "../../hooks/useSectionEditor";
import EditorToolbar from "./EditorToolbar";
import FileUploader from "./FileUploader";

export default function AboutEditor() {
  const editor = useSectionEditor("about");
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

  const [newBackPoint, setNewBackPoint] = useState("");

  if (loading) {
    return (
      <div className="admin-card p-12 text-center text-[#77756f] font-mono text-xs animate-pulse">
        Loading About Editor...
      </div>
    );
  }

  const updateField = (field, value) => {
    setData({ ...data, [field]: value });
  };

  const updateIdCard = (field, value) => {
    setData({
      ...data,
      idCard: {
        ...(data?.idCard || {}),
        [field]: value,
      },
    });
  };

  const handleAddBackPoint = (e) => {
    if (e.key === "Enter" || e.type === "click") {
      e.preventDefault();
      const trimmed = newBackPoint.trim();
      if (!trimmed) return;
      const currentPoints = data?.idCard?.backPoints || [];
      updateIdCard("backPoints", [...currentPoints, trimmed]);
      setNewBackPoint("");
    }
  };

  const handleRemoveBackPoint = (idx) => {
    const currentPoints = data?.idCard?.backPoints || [];
    updateIdCard(
      "backPoints",
      currentPoints.filter((_, i) => i !== idx)
    );
  };

  return (
    <div className="space-y-6">
      <EditorToolbar
        sectionKey="about"
        title="About & Identity Card"
        subtitle="Manage personal profile facts, executive summary, 3D ID badge details, and back points."
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

      <div className="space-y-6">
        {/* Profile Biography Card */}
        <div className="admin-card p-6 sm:p-8 space-y-4">
          <h3 className="text-base font-bold text-[#0d0d0d] pb-3 border-b border-black/5">
            Profile Biography & Focus
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#0d0d0d] mb-1">
                Executive Résumé Summary
              </label>
              <textarea
                rows={4}
                value={data?.resumeSummary || ""}
                onChange={(e) => updateField("resumeSummary", e.target.value)}
                className="admin-input"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#0d0d0d] mb-1">
                Core Engineering Focus
              </label>
              <input
                type="text"
                value={data?.focus || ""}
                onChange={(e) => updateField("focus", e.target.value)}
                className="admin-input"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#0d0d0d] mb-1">
                Featured Philosophy Quote
              </label>
              <textarea
                rows={2}
                value={data?.quote || ""}
                onChange={(e) => updateField("quote", e.target.value)}
                className="admin-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0d0d0d] mb-1">
                Location
              </label>
              <input
                type="text"
                value={data?.location || ""}
                onChange={(e) => updateField("location", e.target.value)}
                className="admin-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0d0d0d] mb-1">
                Primary Education (Degree)
              </label>
              <input
                type="text"
                value={data?.education || ""}
                onChange={(e) => updateField("education", e.target.value)}
                placeholder="e.g. Master of Computer Applications (MCA)"
                className="admin-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0d0d0d] mb-1">
                Undergraduate Degree
              </label>
              <input
                type="text"
                value={data?.undergrad || ""}
                onChange={(e) => updateField("undergrad", e.target.value)}
                placeholder="e.g. B.Sc. IT (8.51 CGPA)"
                className="admin-input"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0d0d0d] mb-1">
                Recent Internship
              </label>
              <input
                type="text"
                value={data?.internship || ""}
                onChange={(e) => updateField("internship", e.target.value)}
                placeholder="e.g. Arah Infotech"
                className="admin-input"
              />
            </div>
          </div>
        </div>

        {/* 3D Lanyard ID Card */}
        <div className="admin-card p-6 sm:p-8 space-y-4">
          <h3 className="text-base font-bold text-[#0d0d0d] pb-3 border-b border-black/5">
            3D Lanyard ID Card Badge
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#0d0d0d] mb-1">
                ID Number
              </label>
              <input
                type="text"
                value={data?.idCard?.idNo || ""}
                onChange={(e) => updateIdCard("idNo", e.target.value)}
                className="admin-input font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0d0d0d] mb-1">
                Department
              </label>
              <input
                type="text"
                value={data?.idCard?.dept || ""}
                onChange={(e) => updateIdCard("dept", e.target.value)}
                className="admin-input font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0d0d0d] mb-1">
                Valid Till
              </label>
              <input
                type="text"
                value={data?.idCard?.validTill || ""}
                onChange={(e) => updateIdCard("validTill", e.target.value)}
                className="admin-input font-mono text-xs"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-[#0d0d0d] mb-1">
                Back Credential / Certification Footnote
              </label>
              <input
                type="text"
                value={data?.idCard?.certifiedText || ""}
                onChange={(e) => updateIdCard("certifiedText", e.target.value)}
                placeholder="e.g. Certified MERN Stack Developer — Naresh i Tech"
                className="admin-input text-xs"
              />
            </div>

            <div className="sm:col-span-3">
              <FileUploader
                label="Portrait Bust Image"
                value={data?.idCard?.portraitBust}
                onChange={(url) => updateIdCard("portraitBust", url)}
                accept="image/*"
                section="about"
                helperText="Portrait picture rendered on the front of the 3D identity badge"
              />
            </div>
          </div>

          {/* Back points on card */}
          <div className="space-y-2 pt-3 border-t border-black/5">
            <label className="block text-xs font-semibold text-[#0d0d0d]">
              ID Card Back Highlights
            </label>
            <div className="space-y-1.5">
              {(data?.idCard?.backPoints || []).map((pt, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 p-2 bg-black/5 rounded-lg text-xs"
                >
                  <span className="font-mono text-[#77756f] text-[11px] shrink-0">
                    •
                  </span>
                  <span className="flex-1 text-[#0d0d0d]">{pt}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveBackPoint(i)}
                    className="text-[#77756f] hover:text-rose-600 font-bold px-1.5"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newBackPoint}
                onChange={(e) => setNewBackPoint(e.target.value)}
                onKeyDown={handleAddBackPoint}
                placeholder="Add card bullet (e.g. Master of Computer Applications)..."
                className="admin-input text-xs flex-1"
              />
              <button
                type="button"
                onClick={handleAddBackPoint}
                className="admin-btn-secondary text-xs px-3 py-2 shrink-0"
              >
                + Add Point
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
