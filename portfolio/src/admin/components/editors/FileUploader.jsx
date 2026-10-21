import React, { useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function FileUploader({
  label,
  value,
  onChange,
  accept = "image/*,video/*,application/pdf",
  section = "general",
  helperText,
}) {
  const { csrfToken } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const isVideo =
    accept.includes("video") ||
    (value && (value.endsWith(".mp4") || value.endsWith(".webm") || value.includes("/video/")));
  const isPdf =
    accept.includes("pdf") ||
    (value && (value.endsWith(".pdf") || value.includes(".pdf")));
  const isImage =
    accept.includes("image") ||
    (value && (value.endsWith(".jpg") || value.endsWith(".png") || value.endsWith(".webp") || value.endsWith(".svg")));

  const handleUploadFile = async (file) => {
    if (!file) return;

    setUploading(true);
    setUploadProgress(15);
    setUploadError("");

    const progressTimer = setInterval(() => {
      setUploadProgress((prev) => (prev >= 90 ? prev : prev + 15));
    }, 200);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("section", section);

      const headers = {};
      if (csrfToken) headers["X-CSRF-Token"] = csrfToken;

      const res = await fetch(`${API_BASE}/api/admin/upload`, {
        method: "POST",
        headers,
        credentials: "include",
        body: formData,
      });

      clearInterval(progressTimer);
      setUploadProgress(100);

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || json.message || "File upload failed");
      }

      onChange(json.url);
    } catch (err) {
      clearInterval(progressTimer);
      setUploadError(err.message || "Network error while uploading");
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 300);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUploadFile(e.dataTransfer.files[0]);
    }
  };

  const formatFilename = (url) => {
    if (!url) return "";
    try {
      const clean = url.split("?")[0];
      return clean.substring(clean.lastIndexOf("/") + 1);
    } catch {
      return url;
    }
  };

  return (
    <div className="bg-white/80 border border-black/10 rounded-2xl p-5 shadow-sm space-y-4 hover:border-black/20 transition-all">
      {/* Header with Title & Badges */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm">
              {isVideo ? "🎬" : isPdf ? "📄" : isImage ? "🖼️" : "📁"}
            </span>
            <label className="text-xs font-bold text-[#0d0d0d] tracking-tight">
              {label || "File Upload"}
            </label>
          </div>
          {helperText && (
            <p className="text-[11px] font-mono text-[#77756f] mt-0.5">
              {helperText}
            </p>
          )}
        </div>

        {value ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Configured
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono text-zinc-500 bg-zinc-100">
            Default / Empty
          </span>
        )}
      </div>

      {/* Interactive Dropzone / Preview Area */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200 overflow-hidden ${
          isDragOver
            ? "border-[#0d0d0d] bg-black/5 scale-[1.008]"
            : "border-black/15 hover:border-black/35 hover:bg-black/[0.015]"
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleUploadFile(e.target.files[0]);
            }
          }}
          accept={accept}
          className="hidden"
        />

        {/* Uploading Progress State */}
        {uploading ? (
          <div className="py-4 space-y-2 max-w-xs mx-auto">
            <div className="w-8 h-8 rounded-full border-2 border-black/20 border-t-black animate-spin mx-auto mb-2" />
            <div className="text-xs font-bold text-[#0d0d0d]">
              Uploading & processing...
            </div>
            <div className="h-1.5 w-full bg-black/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#0d0d0d] transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-[#77756f]">
              {uploadProgress}% complete
            </span>
          </div>
        ) : (
          /* Idle / Configured State */
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-black/5 flex items-center justify-center shrink-0 text-base">
                {isVideo ? "▶️" : isPdf ? "📑" : "📤"}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#0d0d0d] truncate">
                  {value ? formatFilename(value) : "Select or drag & drop file"}
                </div>
                <div className="text-[10px] font-mono text-[#77756f] truncate">
                  {value ? value : `Supports ${accept.replace(/[*]/g, "").slice(0, 35)}`}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="admin-btn-secondary text-xs py-1.5 px-3 font-mono flex items-center gap-1.5 shadow-sm"
              >
                <span>↑</span>
                <span>{value ? "Replace" : "Browse"}</span>
              </button>

              {value && (
                <a
                  href={value}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="w-8 h-8 rounded-lg border border-black/10 hover:border-black/30 bg-white flex items-center justify-center text-xs text-[#0d0d0d] transition-colors"
                  title="View / Open File"
                >
                  ↗
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Live Inline Preview (if media exists) */}
      {value && !uploading && (
        <div className="pt-2 border-t border-black/5">
          {isVideo ? (
            <div className="rounded-xl overflow-hidden bg-[#f4f2ee] p-2 border border-black/10 max-w-sm">
              <span className="text-[10px] font-mono text-[#77756f] block mb-1">
                Preview with blend mode:
              </span>
              <video
                src={value}
                controls
                muted
                playsInline
                className="w-full h-36 object-contain rounded-lg"
                style={{
                  mixBlendMode: "multiply",
                }}
              />
            </div>
          ) : isPdf ? (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/[0.02] border border-black/5 font-mono text-xs">
              <div className="flex items-center gap-2">
                <span className="text-red-500 font-bold">PDF</span>
                <span className="text-[#0d0d0d] text-[11px] truncate max-w-[240px]">
                  {formatFilename(value)}
                </span>
              </div>
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] underline text-[#0d0d0d] hover:text-black font-semibold"
              >
                Open Preview ↗
              </a>
            </div>
          ) : isImage ? (
            <div className="w-16 h-16 rounded-xl overflow-hidden border border-black/10 bg-white p-1">
              <img
                src={value}
                alt="Uploaded Asset"
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          ) : null}
        </div>
      )}

      {/* Manual URL path edit fallback */}
      <div className="pt-1 flex items-center gap-2">
        <span className="text-[10px] font-mono text-[#77756f] shrink-0">Path:</span>
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="/uploads/... or https://..."
          className="admin-input flex-1 py-1 text-[11px] font-mono bg-black/[0.02] border-black/10"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-[11px] font-mono text-red-500 hover:text-red-700 px-1.5"
            title="Clear"
          >
            Clear
          </button>
        )}
      </div>

      {/* Error Message */}
      {uploadError && (
        <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-mono flex items-center gap-2">
          <span>⚠️</span>
          <span>{uploadError}</span>
        </div>
      )}
    </div>
  );
}
