import React, { useState, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * Computes a simple line diff between two JSON objects
 */
function computeDiff(currentObj, historicalObj) {
  const currentLines = JSON.stringify(currentObj, null, 2).split("\n");
  const histLines = JSON.stringify(historicalObj, null, 2).split("\n");

  const diffResult = [];
  const maxLen = Math.max(currentLines.length, histLines.length);

  for (let i = 0; i < maxLen; i++) {
    const cur = currentLines[i];
    const hist = histLines[i];

    if (cur === hist) {
      diffResult.push({ type: "same", text: cur });
    } else {
      if (hist !== undefined) {
        diffResult.push({ type: "removed", text: `- ${hist}` });
      }
      if (cur !== undefined) {
        diffResult.push({ type: "added", text: `+ ${cur}` });
      }
    }
  }

  return diffResult;
}

export default function RevisionsDrawer({
  isOpen,
  onClose,
  sectionKey,
  currentData,
  currentVersion,
  onRestoreSuccess,
}) {
  const [revisions, setRevisions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeDiffRevId, setActiveDiffRevId] = useState(null);
  const [restoringId, setRestoringId] = useState(null);
  const [restoreNotice, setRestoreNotice] = useState("");

  useEffect(() => {
    if (!isOpen || !sectionKey) return;

    const fetchRevisions = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(
          `${API_BASE}/api/admin/content/${sectionKey}/revisions`,
          { credentials: "include" }
        );
        const json = await res.json();
        if (json.success) {
          setRevisions(json.data || []);
        } else {
          setError(json.error || "Failed to load revisions");
        }
      } catch (err) {
        setError(err.message || "Failed to fetch revisions");
      } finally {
        setLoading(false);
      }
    };

    fetchRevisions();
  }, [isOpen, sectionKey]);

  if (!isOpen) return null;

  const handleRestore = async (revision) => {
    if (
      !confirm(
        `Are you sure you want to restore Version ${revision.version} into your draft for '${sectionKey}'? Current uncommitted changes will be overwritten.`
      )
    ) {
      return;
    }

    setRestoringId(revision._id);
    setError("");
    try {
      const res = await fetch(
        `${API_BASE}/api/admin/content/${sectionKey}/restore`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ revisionId: revision._id }),
        }
      );

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to restore revision");
      }

      setRestoreNotice(`Restored v${revision.version} to draft successfully.`);
      setTimeout(() => {
        setRestoreNotice("");
        if (onRestoreSuccess) onRestoreSuccess();
        onClose();
      }, 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setRestoringId(null);
    }
  };

  const selectedRevisionForDiff = revisions.find(
    (r) => r._id === activeDiffRevId
  );
  const diffLines = selectedRevisionForDiff
    ? computeDiff(currentData, selectedRevisionForDiff.snapshot)
    : [];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end animate-fadeIn">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Flyout Drawer Panel */}
      <div className="relative w-full max-w-2xl bg-[#f4f2ee] shadow-2xl h-full flex flex-col z-10 border-l border-black/15">
        {/* Drawer Header */}
        <div className="p-5 border-b border-black/10 bg-white/90 backdrop-blur flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono text-base">📜</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-[#0d0d0d] capitalize">
                  {sectionKey} Revisions
                </h3>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-black/5 font-semibold text-[#0d0d0d]">
                  Current: v{currentVersion}
                </span>
              </div>
              <p className="text-xs text-[#77756f]">
                Historical snapshots retained on every live publish (max 30).
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-black/15 flex items-center justify-center text-xs hover:bg-black/5 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Notices */}
        {restoreNotice && (
          <div className="p-3 bg-emerald-100 text-emerald-900 border-b border-emerald-200 text-xs font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>{restoreNotice}</span>
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-100 text-rose-900 border-b border-rose-200 text-xs font-medium">
            ⚠ {error}
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {loading ? (
            <div className="p-12 text-center text-xs font-mono text-[#77756f] animate-pulse">
              Loading revision snapshots...
            </div>
          ) : revisions.length === 0 ? (
            <div className="admin-card p-12 text-center text-xs text-[#77756f] space-y-2">
              <p className="font-semibold text-sm text-[#0d0d0d]">
                No historical revisions yet.
              </p>
              <p>
                A revision snapshot is automatically archived every time you click
                "Publish to Live".
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {revisions.map((rev) => {
                const isDiffOpen = activeDiffRevId === rev._id;
                const isRestoring = restoringId === rev._id;
                const createdDate = new Date(rev.createdAt).toLocaleString(
                  undefined,
                  {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                );

                return (
                  <div
                    key={rev._id}
                    className="admin-card p-4 space-y-3 transition-all"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs px-2.5 py-1 rounded bg-[#0d0d0d] text-white font-bold">
                          v{rev.version}
                        </span>
                        <div>
                          <div className="font-semibold text-xs text-[#0d0d0d]">
                            {rev.note || "Published update"}
                          </div>
                          <div className="font-mono text-[11px] text-[#77756f]">
                            {createdDate}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setActiveDiffRevId(isDiffOpen ? null : rev._id)
                          }
                          className="admin-btn-secondary text-xs px-2.5 py-1"
                        >
                          {isDiffOpen ? "Hide Diff" : "Compare Diff"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRestore(rev)}
                          disabled={isRestoring}
                          className="admin-btn-primary text-xs px-3 py-1 flex items-center gap-1"
                        >
                          {isRestoring ? "Restoring..." : "Restore"}
                        </button>
                      </div>
                    </div>

                    {/* Diff Viewer Accordion */}
                    {isDiffOpen && (
                      <div className="pt-3 border-t border-black/10 space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-mono text-[#77756f]">
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                            Red = Historical v{rev.version}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                            Green = Current Editor State
                          </span>
                        </div>

                        <div className="p-3 bg-neutral-900 text-neutral-100 rounded-xl font-mono text-[11px] max-h-72 overflow-y-auto leading-relaxed select-text space-y-0.5">
                          {diffLines.slice(0, 300).map((line, idx) => (
                            <div
                              key={idx}
                              className={`px-1 rounded ${
                                line.type === "added"
                                  ? "bg-emerald-950 text-emerald-300"
                                  : line.type === "removed"
                                  ? "bg-rose-950 text-rose-300"
                                  : "text-neutral-400"
                              }`}
                            >
                              {line.text}
                            </div>
                          ))}
                          {diffLines.length > 300 && (
                            <div className="text-neutral-500 italic pt-1">
                              ... ({diffLines.length - 300} lines truncated)
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-black/10 bg-white/80 flex items-center justify-between">
          <span className="font-mono text-xs text-[#77756f]">
            Revisions are stored immutably in MongoDB.
          </span>
          <button onClick={onClose} className="admin-btn-secondary text-xs px-4 py-1.5">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
