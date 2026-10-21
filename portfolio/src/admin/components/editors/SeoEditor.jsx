import React from "react";
import { useSectionEditor } from "../../hooks/useSectionEditor";
import EditorToolbar from "./EditorToolbar";
import FileUploader from "./FileUploader";

export default function SeoEditor() {
  const editor = useSectionEditor("seo");
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
        Loading SEO Editor...
      </div>
    );
  }

  const updateField = (field, value) => {
    setData({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <EditorToolbar
        sectionKey="seo"
        title="SEO & OpenGraph Metadata"
        subtitle="Manage meta tags, search engine descriptions, social preview cards, and browser theme color."
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
          Meta Tags & Social Snippet
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-[#0d0d0d] mb-1">
              Document Title (&lt;title&gt;)
            </label>
            <input
              type="text"
              value={data?.title || ""}
              onChange={(e) => updateField("title", e.target.value)}
              className="admin-input"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-[#0d0d0d] mb-1">
              Meta Description (Search Snippet)
            </label>
            <textarea
              rows={3}
              value={data?.description || ""}
              onChange={(e) => updateField("description", e.target.value)}
              className="admin-input"
            />
          </div>

          <div className="sm:col-span-2">
            <FileUploader
              label="OpenGraph Social Sharing Banner (og:image)"
              value={data?.ogImage}
              onChange={(url) => updateField("ogImage", url)}
              accept="image/*"
              section="seo"
              helperText="Image displayed when sharing the portfolio on Twitter / LinkedIn / WhatsApp (recommended 1200x630px)"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0d0d0d] mb-1">
              Browser Theme Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={data?.themeColor || "#f4f2ee"}
                onChange={(e) => updateField("themeColor", e.target.value)}
                className="w-10 h-10 p-1 rounded-lg border border-black/10 cursor-pointer bg-white"
              />
              <input
                type="text"
                value={data?.themeColor || "#f4f2ee"}
                onChange={(e) => updateField("themeColor", e.target.value)}
                className="admin-input font-mono text-xs flex-1"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
