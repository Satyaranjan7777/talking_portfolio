import React, { useState } from "react";
import { useSectionEditor } from "../../hooks/useSectionEditor";
import EditorToolbar from "./EditorToolbar";

export default function CertificationsEditor() {
  const editor = useSectionEditor("certifications");
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

  const [activeCertIdx, setActiveCertIdx] = useState(0);

  if (loading) {
    return (
      <div className="admin-card p-12 text-center text-[#77756f] font-mono text-xs animate-pulse">
        Loading Certifications Editor...
      </div>
    );
  }

  const certs = data?.certifications || [];
  const currentCert = certs[activeCertIdx] || certs[0] || null;

  const updateCert = (updates) => {
    const updated = certs.map((c, i) =>
      i === activeCertIdx ? { ...c, ...updates } : c
    );
    setData({ ...data, certifications: updated });
  };

  const handleMove = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= certs.length) return;
    const copy = [...certs];
    const [moved] = copy.splice(index, 1);
    copy.splice(target, 0, moved);
    const reindexed = copy.map((c, i) => ({
      ...c,
      index: String(i + 1).padStart(2, "0"),
    }));
    setData({ ...data, certifications: reindexed });
    setActiveCertIdx(target);
  };

  const handleAddCert = () => {
    const newIdx = certs.length + 1;
    const newCert = {
      id: `cert-${Date.now().toString().slice(-4)}`,
      index: String(newIdx).padStart(2, "0"),
      title: "New Industry Certification",
      issuer: "Issuing Organization",
      detail: "Credential credential verification detail",
      year: "2025",
    };
    const updated = [...certs, newCert];
    setData({ ...data, certifications: updated });
    setActiveCertIdx(updated.length - 1);
  };

  const handleDeleteCert = (idx) => {
    if (certs.length <= 1) {
      alert("At least one certification must remain.");
      return;
    }
    if (!confirm(`Delete certification "${certs[idx]?.title}"?`)) return;
    const filtered = certs.filter((_, i) => i !== idx);
    const reindexed = filtered.map((c, i) => ({
      ...c,
      index: String(i + 1).padStart(2, "0"),
    }));
    setData({ ...data, certifications: reindexed });
    setActiveCertIdx(Math.max(0, idx - 1));
  };

  return (
    <div className="space-y-6">
      <EditorToolbar
        sectionKey="certifications"
        title="Certifications Section"
        subtitle="Manage professional credentials, verified issuing authorities, and completion years."
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
        {/* Left Column: Certifications List */}
        <div className="lg:col-span-4 space-y-3">
          <div className="admin-card p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-black/5">
              <span className="font-mono text-xs uppercase tracking-wider text-[#77756f]">
                Credentials ({certs.length})
              </span>
              <button
                type="button"
                onClick={handleAddCert}
                className="admin-btn-primary text-xs px-2.5 py-1"
              >
                + Add Cert
              </button>
            </div>

            <div className="space-y-2">
              {certs.map((c, idx) => {
                const isSelected = idx === activeCertIdx;
                return (
                  <div
                    key={c.id || idx}
                    onClick={() => setActiveCertIdx(idx)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? "bg-[#0d0d0d] text-white border-[#0d0d0d]"
                        : "bg-white hover:bg-neutral-50 border-black/10 text-[#0d0d0d]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <span
                        className={`font-mono text-xs font-bold ${
                          isSelected ? "text-neutral-400" : "text-[#77756f]"
                        }`}
                      >
                        {c.index}
                      </span>
                      <div className="truncate">
                        <div className="font-semibold text-xs truncate">
                          {c.title}
                        </div>
                        <div
                          className={`font-mono text-[10px] truncate ${
                            isSelected ? "text-neutral-400" : "text-[#77756f]"
                          }`}
                        >
                          {c.issuer} • {c.year}
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
                        disabled={idx === certs.length - 1}
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

        {/* Right Column: Certification Details Form */}
        <div className="lg:col-span-8">
          {currentCert ? (
            <div className="admin-card p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-black/5">
                <div>
                  <div className="font-mono text-xs text-[#77756f] uppercase">
                    Editing Credential #{currentCert.index}
                  </div>
                  <h3 className="text-xl font-bold text-[#0d0d0d]">
                    {currentCert.title}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteCert(activeCertIdx)}
                  className="text-xs text-rose-600 hover:text-rose-800 font-mono px-2 py-1"
                >
                  Delete Credential
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#0d0d0d] mb-1">
                    Certification Title
                  </label>
                  <input
                    type="text"
                    value={currentCert.title || ""}
                    onChange={(e) => updateCert({ title: e.target.value })}
                    className="admin-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0d0d0d] mb-1">
                    Issuing Authority / Academy
                  </label>
                  <input
                    type="text"
                    value={currentCert.issuer || ""}
                    onChange={(e) => updateCert({ issuer: e.target.value })}
                    placeholder="e.g. Besant Technologies"
                    className="admin-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0d0d0d] mb-1">
                    Year of Completion
                  </label>
                  <input
                    type="text"
                    value={currentCert.year || ""}
                    onChange={(e) => updateCert({ year: e.target.value })}
                    placeholder="e.g. 2025"
                    className="admin-input font-mono text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#0d0d0d] mb-1">
                    Credential Detail / Scope
                  </label>
                  <textarea
                    rows={3}
                    value={currentCert.detail || ""}
                    onChange={(e) => updateCert({ detail: e.target.value })}
                    placeholder="Description of skills covered, verification ID, or coursework."
                    className="admin-input"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="admin-card p-12 text-center text-[#77756f] text-xs">
              Select or add a credential from the left panel to begin editing.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
