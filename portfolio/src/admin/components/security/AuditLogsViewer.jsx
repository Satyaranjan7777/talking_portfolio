import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ACTION_BADGES = {
  LOGIN_SUCCESS: { bg: "bg-emerald-100 text-emerald-900 border-emerald-300", label: "Login Success" },
  LOGIN_SUCCESS_2FA: { bg: "bg-emerald-100 text-emerald-900 border-emerald-300", label: "Login 2FA" },
  LOGIN_FAILED: { bg: "bg-rose-100 text-rose-900 border-rose-300", label: "Login Failed" },
  PUBLISH: { bg: "bg-emerald-100 text-emerald-900 border-emerald-300", label: "Published" },
  SAVE_DRAFT: { bg: "bg-blue-100 text-blue-900 border-blue-300", label: "Draft Saved" },
  DISCARD_DRAFT: { bg: "bg-neutral-100 text-neutral-800 border-neutral-300", label: "Draft Discarded" },
  RESTORE_REVISION: { bg: "bg-purple-100 text-purple-900 border-purple-300", label: "Revision Restored" },
  UPLOAD_ASSET: { bg: "bg-indigo-100 text-indigo-900 border-indigo-300", label: "Asset Uploaded" },
  "2FA_ENABLED": { bg: "bg-amber-100 text-amber-900 border-amber-300", label: "2FA Activated" },
  "2FA_DISABLED": { bg: "bg-rose-100 text-rose-900 border-rose-300", label: "2FA Deactivated" },
  PASSWORD_CHANGED: { bg: "bg-amber-100 text-amber-900 border-amber-300", label: "Password Changed" },
};

export default function AuditLogsViewer() {
  const { admin } = useAuth();
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedLog, setSelectedLog] = useState(null);

  // 2FA Setup State
  const [is2FAEnabled, setIs2FAEnabled] = useState(admin?.isTotpEnabled || false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrCodeData, setQrCodeData] = useState(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [twoFaLoading, setTwoFaLoading] = useState(false);
  const [twoFaError, setTwoFaError] = useState("");
  const [twoFaSuccess, setTwoFaSuccess] = useState("");
  const [disablePassword, setDisablePassword] = useState("");
  const [disableModalOpen, setDisableModalOpen] = useState(false);

  useEffect(() => {
    setIs2FAEnabled(admin?.isTotpEnabled || false);
  }, [admin]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "25",
        action: actionFilter,
        section: sectionFilter,
        search,
      });

      const res = await fetch(`${API_BASE}/api/admin/audit-logs?${params}`, {
        credentials: "include",
      });
      const json = await res.json();
      if (json.success) {
        setLogs(json.data || []);
        if (json.pagination) {
          setTotalPages(json.pagination.totalPages || 1);
        }
      }
    } catch (err) {
      console.error("Failed to load audit logs", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/audit-logs/stats`, {
        credentials: "include",
      });
      const json = await res.json();
      if (json.success) {
        setStats(json.data);
      }
    } catch (err) {
      console.error("Failed to load audit stats", err);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter, sectionFilter, search]);

  useEffect(() => {
    fetchStats();
  }, []);

  // 2FA Handlers
  const handleStart2FASetup = async () => {
    setTwoFaLoading(true);
    setTwoFaError("");
    try {
      const res = await fetch(`${API_BASE}/api/auth/2fa/generate`, {
        method: "POST",
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to generate 2FA secret");
      }
      setQrCodeData(json);
      setQrModalOpen(true);
    } catch (err) {
      setTwoFaError(err.message);
    } finally {
      setTwoFaLoading(false);
    }
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    setTwoFaLoading(true);
    setTwoFaError("");
    try {
      const res = await fetch(`${API_BASE}/api/auth/2fa/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ code: verifyCode }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Verification failed");
      }
      setIs2FAEnabled(true);
      setTwoFaSuccess("Two-factor authentication successfully enabled!");
      setQrModalOpen(false);
      setVerifyCode("");
      fetchLogs();
      fetchStats();
      setTimeout(() => setTwoFaSuccess(""), 4000);
    } catch (err) {
      setTwoFaError(err.message);
    } finally {
      setTwoFaLoading(false);
    }
  };

  const handleDisable2FA = async (e) => {
    e.preventDefault();
    setTwoFaLoading(true);
    setTwoFaError("");
    try {
      const res = await fetch(`${API_BASE}/api/auth/2fa/disable`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password: disablePassword }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to disable 2FA");
      }
      setIs2FAEnabled(false);
      setDisableModalOpen(false);
      setDisablePassword("");
      setTwoFaSuccess("Two-factor authentication disabled.");
      fetchLogs();
      fetchStats();
      setTimeout(() => setTwoFaSuccess(""), 4000);
    } catch (err) {
      setTwoFaError(err.message);
    } finally {
      setTwoFaLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono text-xs uppercase tracking-wider text-[#77756f]">
            Platform Governance
          </span>
          <span className="text-[#77756f]">•</span>
          <span className="font-mono text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Immutable Audit Trail
          </span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-[#0d0d0d]">
          Security & Audit Logs.
        </h2>
        <p className="text-xs text-[#77756f] mt-0.5">
          Real-time activity logs, authorization history, and Two-Factor Authentication (TOTP) management.
        </p>
      </div>

      {twoFaSuccess && (
        <div className="p-3 bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <span className="w-2 h-2 rounded-full bg-emerald-600" />
          <span>{twoFaSuccess}</span>
        </div>
      )}

      {/* Metrics Header Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="admin-card p-4">
          <div className="font-mono text-[11px] text-[#77756f] uppercase">
            Total Audits
          </div>
          <div className="text-2xl font-bold text-[#0d0d0d] mt-1">
            {stats?.totalLogs || 0}
          </div>
          <div className="text-[11px] text-[#77756f] mt-0.5">Recorded events</div>
        </div>

        <div className="admin-card p-4">
          <div className="font-mono text-[11px] text-[#77756f] uppercase">
            Auth Events
          </div>
          <div className="text-2xl font-bold text-[#0d0d0d] mt-1">
            {stats?.loginCount || 0}
          </div>
          <div className="text-[11px] text-[#77756f] mt-0.5">Verified logins</div>
        </div>

        <div className="admin-card p-4">
          <div className="font-mono text-[11px] text-[#77756f] uppercase">
            Live Publishes
          </div>
          <div className="text-2xl font-bold text-[#0d0d0d] mt-1">
            {stats?.publishCount || 0}
          </div>
          <div className="text-[11px] text-[#77756f] mt-0.5">Production deployments</div>
        </div>

        <div className="admin-card p-4">
          <div className="font-mono text-[11px] text-[#77756f] uppercase">
            Draft Saves
          </div>
          <div className="text-2xl font-bold text-[#0d0d0d] mt-1">
            {stats?.draftCount || 0}
          </div>
          <div className="text-[11px] text-[#77756f] mt-0.5">Content updates</div>
        </div>
      </div>

      {/* 2FA Security Configuration Card */}
      <div className="admin-card p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-5 bg-white/90">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#0d0d0d] text-white flex items-center justify-center font-mono text-xl shrink-0">
            🔐
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-[#0d0d0d]">
                Two-Factor Authentication (TOTP)
              </h3>
              <span
                className={`font-mono text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                  is2FAEnabled
                    ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                    : "bg-amber-100 text-amber-900 border border-amber-300"
                }`}
              >
                {is2FAEnabled ? "Protected (Active)" : "Disabled"}
              </span>
            </div>
            <p className="text-xs text-[#77756f] mt-1 leading-relaxed max-w-xl">
              Require a time-based 6-digit one-time password (Google Authenticator, Authy, Microsoft Authenticator) alongside your credentials upon every login.
            </p>
          </div>
        </div>

        <div>
          {is2FAEnabled ? (
            <button
              onClick={() => setDisableModalOpen(true)}
              className="admin-btn-secondary text-xs px-4 py-2 text-rose-700 hover:bg-rose-50 border-rose-200 whitespace-nowrap"
            >
              Disable 2FA
            </button>
          ) : (
            <button
              onClick={handleStart2FASetup}
              disabled={twoFaLoading}
              className="admin-btn-primary text-xs px-4 py-2 whitespace-nowrap"
            >
              {twoFaLoading ? "Generating..." : "Enable 2FA Setup →"}
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-card p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by action, section, or IP address..."
              className="admin-input text-xs"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
              className="admin-input text-xs font-mono w-auto"
            >
              <option value="all">All Actions</option>
              <option value="PUBLISH">PUBLISH</option>
              <option value="SAVE_DRAFT">SAVE_DRAFT</option>
              <option value="DISCARD_DRAFT">DISCARD_DRAFT</option>
              <option value="RESTORE_REVISION">RESTORE_REVISION</option>
              <option value="LOGIN_SUCCESS">LOGIN_SUCCESS</option>
              <option value="LOGIN_FAILED">LOGIN_FAILED</option>
              <option value="2FA_ENABLED">2FA_ENABLED</option>
              <option value="2FA_DISABLED">2FA_DISABLED</option>
              <option value="UPLOAD_ASSET">UPLOAD_ASSET</option>
            </select>

            <select
              value={sectionFilter}
              onChange={(e) => {
                setSectionFilter(e.target.value);
                setPage(1);
              }}
              className="admin-input text-xs font-mono w-auto"
            >
              <option value="all">All Sections</option>
              <option value="projects">Projects</option>
              <option value="hero">Hero</option>
              <option value="about">About</option>
              <option value="skills">Skills</option>
              <option value="certifications">Certifications</option>
              <option value="experience">Experience</option>
              <option value="education">Education</option>
              <option value="contact">Contact</option>
              <option value="seo">SEO</option>
              <option value="settings">Settings</option>
              <option value="auth">Auth</option>
            </select>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-black/10 font-mono text-[11px] text-[#77756f] uppercase">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Section</th>
                <th className="py-2.5 px-3">IP Address</th>
                <th className="py-2.5 px-3 text-right">Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#77756f] font-mono">
                    Loading audit stream...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#77756f]">
                    No matching audit logs found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const badge = ACTION_BADGES[log.action] || {
                    bg: "bg-neutral-100 text-neutral-800 border-neutral-300",
                    label: log.action,
                  };
                  const dateStr = new Date(log.at).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  });

                  return (
                    <tr key={log._id} className="hover:bg-black/[0.02] transition-colors">
                      <td className="py-3 px-3 font-mono text-[11px] text-[#77756f] whitespace-nowrap">
                        {dateStr}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`inline-block font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${badge.bg}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-xs font-semibold text-[#0d0d0d] capitalize">
                        {log.section}
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-[#77756f]">
                        {log.ip || "127.0.0.1"}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {log.details && Object.keys(log.details).length > 0 ? (
                          <button
                            type="button"
                            onClick={() => setSelectedLog(log)}
                            className="font-mono text-[11px] text-[#77756f] hover:text-black underline"
                          >
                            Inspect
                          </button>
                        ) : (
                          <span className="text-[#a9a6a0] font-mono text-[11px]">
                            —
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="pt-3 border-t border-black/5 flex items-center justify-between text-xs font-mono text-[#77756f]">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="admin-btn-secondary text-xs px-3 py-1 disabled:opacity-40"
            >
              ← Prev
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="admin-btn-secondary text-xs px-3 py-1 disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      {/* 2FA Setup QR Code Modal */}
      {qrModalOpen && qrCodeData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-black/15 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <h3 className="text-lg font-bold text-[#0d0d0d]">
                Scan Authenticator QR Code
              </h3>
              <button
                onClick={() => setQrModalOpen(false)}
                className="w-7 h-7 rounded-full border border-black/15 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#77756f] leading-relaxed">
              Open your authenticator app (Google Authenticator, Authy, 1Password) and scan this QR code:
            </p>

            <div className="flex justify-center p-3 bg-neutral-50 rounded-xl border border-black/10">
              <img
                src={qrCodeData.qrCodeDataUrl}
                alt="2FA QR Code"
                className="w-48 h-48 rounded-lg shadow-sm"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono text-[#77756f] uppercase mb-1">
                Manual Entry Secret
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={qrCodeData.secret}
                  className="admin-input font-mono text-xs select-all bg-black/5"
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(qrCodeData.secret);
                    alert("Secret key copied to clipboard");
                  }}
                  className="admin-btn-secondary text-xs px-3 py-2 shrink-0"
                >
                  Copy
                </button>
              </div>
            </div>

            <form onSubmit={handleVerify2FA} className="space-y-3 pt-2">
              <label className="block text-xs font-semibold text-[#0d0d0d]">
                Enter 6-Digit Code from App
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                placeholder="123456"
                className="admin-input text-center font-mono text-lg tracking-widest font-bold"
              />

              {twoFaError && (
                <p className="text-xs text-rose-600 font-semibold">{twoFaError}</p>
              )}

              <button
                type="submit"
                disabled={twoFaLoading || verifyCode.length < 6}
                className="admin-btn-primary w-full py-2.5 text-xs"
              >
                {twoFaLoading ? "Confirming..." : "Activate Two-Factor Protection →"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Disable 2FA Modal */}
      {disableModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-black/15 space-y-4">
            <h3 className="text-lg font-bold text-[#0d0d0d]">Disable 2FA</h3>
            <p className="text-xs text-[#77756f]">
              Enter your current administrative password to confirm disabling two-factor protection:
            </p>

            <form onSubmit={handleDisable2FA} className="space-y-3">
              <input
                type="password"
                required
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                placeholder="Current password"
                className="admin-input"
              />

              {twoFaError && (
                <p className="text-xs text-rose-600 font-semibold">{twoFaError}</p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDisableModalOpen(false)}
                  className="admin-btn-secondary text-xs px-3 py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={twoFaLoading}
                  className="admin-btn-primary text-xs px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white"
                >
                  {twoFaLoading ? "Disabling..." : "Confirm Disable"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detailed Payload Inspector Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 max-w-xl w-full shadow-2xl border border-black/15 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-black/5">
              <h3 className="font-bold text-sm text-[#0d0d0d]">
                Audit Event Payload ({selectedLog.action})
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="w-7 h-7 rounded-full border border-black/15 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <pre className="p-4 bg-neutral-900 text-neutral-100 rounded-xl font-mono text-[11px] overflow-auto max-h-80">
              {JSON.stringify(selectedLog.details, null, 2)}
            </pre>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="admin-btn-secondary text-xs px-4 py-1.5"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
