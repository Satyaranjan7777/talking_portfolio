import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";

export default function ResumeManager() {
  const { csrfToken } = useAuth();
  const [data, setData] = useState({
    live: null,
    draft: null,
    history: [],
    downloadName: "Satyaranjan_Moharana_Resume.pdf",
    maxSizeMb: 5,
    keepVersions: 10,
  });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [publishing, setPublishing] = useState(false);
  const [restoringId, setRestoringId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [previewModalUrl, setPreviewModalUrl] = useState(null);
  const [downloadNameInput, setDownloadNameInput] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);

  const fileInputRef = useRef(null);

  const loadResumeData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/resume", {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
        setDownloadNameInput(json.data.downloadName || "Satyaranjan_Moharana_Resume.pdf");
      } else {
        setErrorMessage(json.message || "Failed to load resume details.");
      }
    } catch (err) {
      setErrorMessage("Network error connecting to backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResumeData();
  }, []);

  const clearAlerts = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleFileSelect = async (file) => {
    clearAlerts();
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf") {
      setErrorMessage("Only PDF files are supported. Please select a valid .pdf file.");
      return;
    }

    const maxBytes = (data.maxSizeMb || 5) * 1024 * 1024;
    if (file.size > maxBytes) {
      setErrorMessage(`File exceeds ${data.maxSizeMb || 5} MB size limit.`);
      return;
    }

    // Binary magic byte client-side pre-check for instant feedback
    try {
      const slice = file.slice(0, 4);
      const buffer = await slice.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      if (!(bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46)) {
        setErrorMessage("Binary check failed: Selected file does not have valid PDF magic bytes (%PDF-).");
        return;
      }
    } catch (e) {
      // If slice fails, let server inspect
    }

    // Upload with simulated progress indicator
    setUploading(true);
    setUploadProgress(10);
    const progressTimer = setInterval(() => {
      setUploadProgress((prev) => (prev >= 90 ? prev : prev + 15));
    }, 250);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const headers = {};
      if (csrfToken) headers["X-CSRF-Token"] = csrfToken;

      const res = await fetch("/api/admin/resume/upload", {
        method: "POST",
        headers,
        body: formData,
        credentials: "include",
      });

      clearInterval(progressTimer);
      setUploadProgress(100);

      const json = await res.json();
      if (json.success) {
        setSuccessMessage(`Draft resume version ${json.data.version} uploaded successfully. Preview below and click 'Publish' to make live.`);
        loadResumeData();
      } else {
        setErrorMessage(json.message || "Failed to upload resume.");
      }
    } catch (err) {
      clearInterval(progressTimer);
      setErrorMessage("Network error during file upload.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handlePublish = async (id) => {
    clearAlerts();
    setPublishing(true);
    try {
      const headers = { "Content-Type": "application/json" };
      if (csrfToken) headers["X-CSRF-Token"] = csrfToken;

      const res = await fetch(`/api/admin/resume/${id}/publish`, {
        method: "POST",
        headers,
        credentials: "include",
      });
      const json = await res.json();
      if (json.success) {
        setSuccessMessage(json.message || "Resume published live to all public clients!");
        loadResumeData();
      } else {
        setErrorMessage(json.message || "Failed to publish resume.");
      }
    } catch (err) {
      setErrorMessage("Network error publishing resume.");
    } finally {
      setPublishing(false);
    }
  };

  const handleDiscardDraft = async (draftId) => {
    clearAlerts();
    if (!confirm("Are you sure you want to discard this draft? It will be removed from Cloudinary.")) return;
    try {
      const headers = { "Content-Type": "application/json" };
      if (csrfToken) headers["X-CSRF-Token"] = csrfToken;

      const res = await fetch(`/api/admin/resume/${draftId}`, {
        method: "DELETE",
        headers,
        credentials: "include",
      });
      const json = await res.json();
      if (json.success) {
        setSuccessMessage("Draft discarded.");
        loadResumeData();
      } else {
        setErrorMessage(json.message || "Failed to discard draft.");
      }
    } catch (err) {
      setErrorMessage("Network error discarding draft.");
    }
  };

  const handleRestore = async (id, version) => {
    clearAlerts();
    if (!confirm(`Restore Version ${version} as the active live resume? The current live resume will be archived.`)) return;
    setRestoringId(id);
    try {
      const headers = { "Content-Type": "application/json" };
      if (csrfToken) headers["X-CSRF-Token"] = csrfToken;

      const res = await fetch(`/api/admin/resume/${id}/restore`, {
        method: "POST",
        headers,
        credentials: "include",
      });
      const json = await res.json();
      if (json.success) {
        setSuccessMessage(json.message || `Version ${version} restored as live!`);
        loadResumeData();
      } else {
        setErrorMessage(json.message || "Failed to restore version.");
      }
    } catch (err) {
      setErrorMessage("Network error restoring version.");
    } finally {
      setRestoringId(null);
    }
  };

  const handleDelete = async (id, version) => {
    clearAlerts();
    if (!confirm(`Permanently delete archived version ${version} from Cloudinary and the database?`)) return;
    setDeletingId(id);
    try {
      const headers = { "Content-Type": "application/json" };
      if (csrfToken) headers["X-CSRF-Token"] = csrfToken;

      const res = await fetch(`/api/admin/resume/${id}`, {
        method: "DELETE",
        headers,
        credentials: "include",
      });
      const json = await res.json();
      if (json.success) {
        setSuccessMessage(`Version ${version} permanently deleted.`);
        loadResumeData();
      } else {
        setErrorMessage(json.message || "Failed to delete version.");
      }
    } catch (err) {
      setErrorMessage("Network error deleting version.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    clearAlerts();
    setSavingSettings(true);
    try {
      const headers = { "Content-Type": "application/json" };
      if (csrfToken) headers["X-CSRF-Token"] = csrfToken;

      const res = await fetch("/api/admin/resume/settings", {
        method: "PATCH",
        headers,
        credentials: "include",
        body: JSON.stringify({ downloadName: downloadNameInput }),
      });
      const json = await res.json();
      if (json.success) {
        setSuccessMessage("Download filename updated successfully.");
        loadResumeData();
      } else {
        setErrorMessage(json.message || "Failed to update filename.");
      }
    } catch (err) {
      setErrorMessage("Network error updating settings.");
    } finally {
      setSavingSettings(false);
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return "0 KB";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const formatDate = (isoString) => {
    if (!isoString) return "Bundled / Initial";
    const d = new Date(isoString);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="p-8 text-center font-mono text-xs text-[#77756f]">
        Loading Resume Configuration...
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-black/10 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">📄</span>
            <h1 className="text-2xl font-bold tracking-tight text-[#0d0d0d]">Resume Management</h1>
          </div>
          <p className="text-xs font-mono text-[#77756f] mt-1">
            Admin $\rightarrow$ Cloudinary $\rightarrow$ Real-time sync to public site (Hero, About, Nav)
          </p>
        </div>

        <button
          onClick={loadResumeData}
          className="admin-btn-secondary text-xs font-mono flex items-center gap-1.5 self-start sm:self-auto"
        >
          <span>↻</span> Refresh
        </button>
      </div>

      {/* Messages */}
      {errorMessage && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-800 text-xs rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage("")} className="font-mono text-xs opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 text-xs rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>✓</span>
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage("")} className="font-mono text-xs opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Grid: Current Live Resume + Upload Box */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Active Live Resume */}
        <div className="admin-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono uppercase tracking-wider text-[#77756f]">Current Live Resume</span>
              {data.live ? (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Live in Production (v{data.live.version})
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  Static Bundled Fallback
                </span>
              )}
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between py-2 border-b border-black/5">
                <span className="text-[#77756f]">Filename:</span>
                <span className="font-bold text-[#0d0d0d] truncate max-w-[220px]">
                  {data.live ? data.live.originalName : "resume.pdf"}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-black/5">
                <span className="text-[#77756f]">Download Name:</span>
                <span className="text-[#0d0d0d] truncate max-w-[220px]">
                  {data.downloadName}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-black/5">
                <span className="text-[#77756f]">File Size:</span>
                <span className="text-[#0d0d0d]">
                  {data.live ? formatBytes(data.live.bytes) : "Bundled"}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-black/5">
                <span className="text-[#77756f]">Published Date:</span>
                <span className="text-[#0d0d0d]">
                  {data.live ? formatDate(data.live.updatedAt) : "Initial deployment"}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-black/5">
                <span className="text-[#77756f]">Storage Provider:</span>
                <span className="text-[#0d0d0d]">
                  {data.live ? "Cloudinary (Raw PDF)" : "Static Netlify Assets"}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-black/10 flex items-center gap-3">
            <button
              onClick={() => setPreviewModalUrl(data.live ? data.live.secure_url : "/resume.pdf")}
              className="admin-btn-primary flex-1 text-xs py-2.5 text-center font-mono"
            >
              👁 Inline Preview
            </button>
            <a
              href={data.live ? data.live.secure_url : "/resume.pdf"}
              target="_blank"
              rel="noopener noreferrer"
              className="admin-btn-secondary text-xs py-2.5 px-4 font-mono text-center"
            >
              Open Direct ↗
            </a>
          </div>
        </div>

        {/* Card 2: Upload Dropzone */}
        <div className="admin-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono uppercase tracking-wider text-[#77756f]">Upload New Version</span>
              <span className="text-[11px] font-mono text-[#77756f]">Max {data.maxSizeMb} MB • PDF Only</span>
            </div>

            {/* Dropzone container */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileSelect(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                dragOver
                  ? "border-[#0d0d0d] bg-black/5 scale-[1.01]"
                  : "border-black/15 hover:border-black/30 hover:bg-black/[0.02]"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
              />

              <div className="w-12 h-12 rounded-full bg-black/5 mx-auto flex items-center justify-center text-xl mb-3">
                📄
              </div>

              <div className="font-bold text-sm text-[#0d0d0d] mb-1">
                {uploading ? "Uploading & Validating PDF..." : "Choose PDF or drag & drop"}
              </div>

              <p className="text-xs font-mono text-[#77756f]">
                Strict binary magic byte inspection (%PDF-)
              </p>

              {uploading && (
                <div className="mt-4 max-w-xs mx-auto">
                  <div className="h-1.5 w-full bg-black/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#0d0d0d] transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] font-mono text-[#77756f] mt-1 block">
                    {uploadProgress}%
                  </span>
                </div>
              )}
            </div>
          </div>

          <p className="text-[11px] font-mono text-[#77756f] pt-4 mt-4 border-t border-black/10">
            ℹ️ Uploading creates a draft version. You can preview it inline before clicking "Publish" to sync it live to public users.
          </p>
        </div>
      </div>

      {/* Section: Pending Draft Preview & Publish Banner (If draft exists) */}
      {data.draft && (
        <div className="admin-card p-6 border-2 border-amber-500/40 bg-amber-500/[0.02] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
                <h3 className="font-bold text-sm text-[#0d0d0d]">
                  Unpublished Draft: Version {data.draft.version} ({data.draft.originalName})
                </h3>
              </div>
              <p className="text-xs font-mono text-[#77756f] mt-1">
                Size: {formatBytes(data.draft.bytes)} • Uploaded {formatDate(data.draft.createdAt)}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setPreviewModalUrl(data.draft.secure_url)}
                className="admin-btn-secondary text-xs py-2 px-3 font-mono"
              >
                👁 Preview Draft
              </button>
              <button
                onClick={() => handleDiscardDraft(data.draft._id)}
                className="text-xs font-mono text-red-600 hover:text-red-800 px-3 py-2"
              >
                Discard
              </button>
              <button
                onClick={() => handlePublish(data.draft._id)}
                disabled={publishing}
                className="admin-btn-primary text-xs py-2 px-4 font-mono font-bold"
              >
                {publishing ? "Publishing..." : "🚀 Publish Live (Realtime Sync)"}
              </button>
            </div>
          </div>

          {/* Inline draft PDF preview iframe */}
          <div className="border border-black/10 rounded-xl overflow-hidden bg-white h-[450px]">
            <iframe
              src={data.draft.secure_url}
              title="Draft Resume Preview"
              className="w-full h-full"
            />
          </div>
        </div>
      )}

      {/* Settings: Download Filename Setting */}
      <div className="admin-card p-6">
        <h3 className="text-sm font-bold text-[#0d0d0d] mb-1">Download Filename Setting</h3>
        <p className="text-xs font-mono text-[#77756f] mb-4">
          When visitors click "Download Résumé" on the public site, this clean filename is suggested by their browser.
        </p>

        <form onSubmit={handleSaveSettings} className="flex flex-col sm:flex-row gap-3 max-w-xl">
          <input
            type="text"
            value={downloadNameInput}
            onChange={(e) => setDownloadNameInput(e.target.value)}
            placeholder="Satyaranjan_Moharana_Resume.pdf"
            className="admin-input flex-1 font-mono text-xs"
            required
          />
          <button
            type="submit"
            disabled={savingSettings}
            className="admin-btn-secondary text-xs py-2 px-4 font-mono"
          >
            {savingSettings ? "Saving..." : "Save Filename"}
          </button>
        </form>
      </div>

      {/* Section: Version History & Rollback Table */}
      <div className="admin-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#0d0d0d]">Version History & Rollback</h3>
            <p className="text-xs font-mono text-[#77756f]">
              Retains the last {data.keepVersions} versions in Cloudinary and DB. Older archives are automatically pruned.
            </p>
          </div>
          <span className="font-mono text-xs text-[#77756f]">
            {data.history.length} versions logged
          </span>
        </div>

        {data.history.length === 0 ? (
          <div className="p-8 text-center font-mono text-xs text-[#77756f] border border-dashed border-black/10 rounded-xl">
            No previous versions stored in database. Uploading your first PDF will start version tracking.
          </div>
        ) : (
          <div className="overflow-x-auto border border-black/10 rounded-xl">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-black/[0.03] border-b border-black/10 text-[#77756f]">
                <tr>
                  <th className="py-3 px-4 font-medium">Version</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium">Original Filename</th>
                  <th className="py-3 px-4 font-medium">Size</th>
                  <th className="py-3 px-4 font-medium">Uploaded Date</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {data.history.map((item) => (
                  <tr key={item._id} className="hover:bg-black/[0.01]">
                    <td className="py-3 px-4 font-bold text-[#0d0d0d]">
                      v{item.version}
                    </td>
                    <td className="py-3 px-4">
                      {item.status === "live" ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active Live
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[10px] text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded-full border border-zinc-200">
                          Archived
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[#0d0d0d] truncate max-w-[180px]">
                      {item.originalName}
                    </td>
                    <td className="py-3 px-4 text-[#77756f]">
                      {formatBytes(item.bytes)}
                    </td>
                    <td className="py-3 px-4 text-[#77756f]">
                      {formatDate(item.uploadedAt || item.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => setPreviewModalUrl(item.secure_url)}
                        className="text-xs hover:underline text-[#0d0d0d]"
                      >
                        Preview
                      </button>

                      {item.status !== "live" && (
                        <>
                          <button
                            onClick={() => handleRestore(item._id, item.version)}
                            disabled={restoringId === item._id}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            {restoringId === item._id ? "Restoring..." : "Restore"}
                          </button>
                          <button
                            onClick={() => handleDelete(item._id, item.version)}
                            disabled={deletingId === item._id}
                            className="text-xs text-red-600 hover:underline"
                          >
                            {deletingId === item._id ? "..." : "Delete"}
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Full Modal PDF Viewer (if open) */}
      {previewModalUrl && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#f4f2ee] border border-black/20 rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="px-6 py-3 border-b border-black/10 flex items-center justify-between bg-white">
              <span className="font-mono text-xs font-bold text-[#0d0d0d]">
                📄 PDF Preview Inspector
              </span>
              <div className="flex items-center gap-3">
                <a
                  href={previewModalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs underline text-[#77756f] hover:text-[#0d0d0d]"
                >
                  Open in New Tab ↗
                </a>
                <button
                  onClick={() => setPreviewModalUrl(null)}
                  className="w-7 h-7 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-xs font-mono"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="flex-1 bg-white">
              <iframe
                src={previewModalUrl}
                title="Resume Full Modal Preview"
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
