import React from "react";
import RevisionsDrawer from "../revisions/RevisionsDrawer";

export default function EditorToolbar({
  sectionKey,
  title,
  subtitle,
  version,
  status,
  hasUnsavedChanges,
  saving,
  publishing,
  discarding,
  error,
  validationErrors,
  successMsg,
  currentData,
  isRevisionsOpen,
  onOpenRevisions,
  onCloseRevisions,
  onRestoreSuccess,
  hasConflict,
  remoteVersion,
  onReloadLatest,
  onSaveDraft,
  onPublish,
  onDiscard,
}) {
  const isChanged = status === "changed" || hasUnsavedChanges;

  return (
    <div className="space-y-4">
      {/* Version Conflict Warning Banner */}
      {hasConflict && (
        <div className="p-4 bg-amber-50 border-2 border-amber-300 text-amber-950 rounded-xl space-y-2 animate-fadeIn shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <span className="text-lg">⚠️</span>
              <div>
                <span className="font-bold text-xs uppercase tracking-wider block">
                  Version Conflict Warning
                </span>
                <p className="text-xs text-amber-900 mt-0.5">
                  A newer version (<strong>v{remoteVersion}</strong>) of this section was published by another session. You are currently viewing <strong>v{version}</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {onReloadLatest && (
                <button
                  type="button"
                  onClick={onReloadLatest}
                  className="px-3 py-1.5 rounded-lg bg-amber-900 text-white font-mono text-xs hover:bg-amber-800 transition-colors"
                >
                  Reload Latest v{remoteVersion}
                </button>
              )}
              {onOpenRevisions && (
                <button
                  type="button"
                  onClick={onOpenRevisions}
                  className="px-3 py-1.5 rounded-lg border border-amber-400 bg-white/80 text-amber-900 font-mono text-xs hover:bg-white transition-colors"
                >
                  Inspect Diff
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Top Banner Toolbar */}
      <div className="admin-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs uppercase tracking-wider text-[#77756f]">
              Section Editor
            </span>
            <span className="text-[#77756f]">•</span>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-black/5 text-[#0d0d0d] font-semibold">
              v{version}
            </span>
            <span
              className={`font-mono text-[11px] px-2 py-0.5 rounded-full uppercase tracking-wider font-medium ${
                hasUnsavedChanges
                  ? "bg-amber-100 text-amber-900 border border-amber-300"
                  : status === "changed"
                  ? "bg-blue-100 text-blue-900 border border-blue-300"
                  : "bg-emerald-100 text-emerald-900 border border-emerald-300"
              }`}
            >
              {hasUnsavedChanges
                ? "Unsaved Edits"
                : status === "changed"
                ? "Draft (Not Live)"
                : "Live Published"}
            </span>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-[#0d0d0d]">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-[#77756f] mt-0.5">{subtitle}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Revisions History Drawer Trigger */}
          {onOpenRevisions && (
            <button
              type="button"
              onClick={onOpenRevisions}
              className="admin-btn-secondary text-xs px-3 py-2 flex items-center gap-1.5 font-mono"
              title="Open Revision History & Visual Diff"
            >
              <span>📜</span>
              <span>Revisions</span>
            </button>
          )}

          {isChanged && (
            <button
              type="button"
              onClick={onDiscard}
              disabled={discarding || saving || publishing}
              className="admin-btn-secondary text-xs px-3 py-2 text-rose-700 hover:bg-rose-50 border-rose-200"
              title="Revert draft changes to currently published version"
            >
              {discarding ? "Reverting..." : "Discard"}
            </button>
          )}

          <button
            type="button"
            onClick={onSaveDraft}
            disabled={saving || publishing || discarding}
            className="admin-btn-secondary text-xs px-4 py-2"
          >
            {saving ? "Saving Draft..." : "Save Draft"}
          </button>

          <button
            type="button"
            onClick={() => onPublish()}
            disabled={publishing || saving || discarding}
            className="admin-btn-primary text-xs px-5 py-2 flex items-center gap-2"
          >
            {publishing ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Publish to Live
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-medium">{successMsg}</span>
          </div>
          <span className="font-mono text-[10px] text-emerald-700">SSE active</span>
        </div>
      )}

      {/* Error & Validation Notifications */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-900 text-xs rounded-xl space-y-2">
          <div className="font-semibold flex items-center gap-2">
            <span>⚠</span>
            <span>{error}</span>
          </div>
          {validationErrors && validationErrors.length > 0 && (
            <ul className="list-disc pl-5 space-y-1 font-mono text-[11px] text-rose-800">
              {validationErrors.map((err, i) => (
                <li key={i}>{typeof err === "string" ? err : JSON.stringify(err)}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Attached Revisions Drawer */}
      {isRevisionsOpen && (
        <RevisionsDrawer
          isOpen={isRevisionsOpen}
          onClose={onCloseRevisions}
          sectionKey={sectionKey}
          currentData={currentData}
          currentVersion={version}
          onRestoreSuccess={onRestoreSuccess}
        />
      )}
    </div>
  );
}
