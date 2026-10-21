import React from "react";
import { useSectionEditor } from "../../hooks/useSectionEditor";
import EditorToolbar from "./EditorToolbar";

export default function ContactEditor() {
  const editor = useSectionEditor("contact");
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
        Loading Contact Editor...
      </div>
    );
  }

  const updateField = (field, value) => {
    setData({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <EditorToolbar
        sectionKey="contact"
        title="Contact & Channels Section"
        subtitle="Manage communication channels, phone numbers, direct email, social URLs, and final CTA."
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
          Communication Endpoints
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#0d0d0d] mb-1">
              Primary Email Address
            </label>
            <input
              type="email"
              value={data?.email || ""}
              onChange={(e) => updateField("email", e.target.value)}
              className="admin-input"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0d0d0d] mb-1">
              Phone Display String
            </label>
            <input
              type="text"
              value={data?.phone || ""}
              onChange={(e) => updateField("phone", e.target.value)}
              placeholder="+91 8456087796"
              className="admin-input font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0d0d0d] mb-1">
              Phone Href (tel link)
            </label>
            <input
              type="text"
              value={data?.phoneHref || ""}
              onChange={(e) => updateField("phoneHref", e.target.value)}
              placeholder="tel:+918456087796"
              className="admin-input font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0d0d0d] mb-1">
              Base Location / Timezone
            </label>
            <input
              type="text"
              value={data?.location || ""}
              onChange={(e) => updateField("location", e.target.value)}
              placeholder="Hyderabad, Telangana"
              className="admin-input"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-[#0d0d0d] mb-1">
              CTA Header / Banner Line
            </label>
            <input
              type="text"
              value={data?.ctaNextTeam || ""}
              onChange={(e) => updateField("ctaNextTeam", e.target.value)}
              placeholder="Next — Your team?"
              className="admin-input"
            />
          </div>
        </div>

        <h3 className="text-base font-bold text-[#0d0d0d] pt-4 pb-3 border-b border-black/5">
          Social & Public Profiles
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#0d0d0d] mb-1">
              GitHub Profile Link
            </label>
            <input
              type="url"
              value={data?.github || ""}
              onChange={(e) => updateField("github", e.target.value)}
              placeholder="https://github.com/..."
              className="admin-input font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0d0d0d] mb-1">
              LinkedIn Profile Link
            </label>
            <input
              type="url"
              value={data?.linkedin || ""}
              onChange={(e) => updateField("linkedin", e.target.value)}
              placeholder="https://www.linkedin.com/in/..."
              className="admin-input font-mono text-xs"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-[#0d0d0d] mb-1">
              Live Production Portfolio URL
            </label>
            <input
              type="url"
              value={data?.portfolioUrl || ""}
              onChange={(e) => updateField("portfolioUrl", e.target.value)}
              placeholder="https://satyaranjan7777.netlify.app/"
              className="admin-input font-mono text-xs"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
