import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Login({ onLoginSuccess }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [show2FA, setShow2FA] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSubmitting(true);

    const res = await login(email, password, totpCode);
    setSubmitting(false);

    if (res.success) {
      if (onLoginSuccess) onLoginSuccess();
    } else if (res.require2FA) {
      setShow2FA(true);
      setErrorMessage("Two-Factor Authentication is active. Enter your 6-digit code.");
    } else {
      setErrorMessage(res.error || "Invalid email or password");
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-6 bg-[#f4f2ee] overflow-hidden select-none">
      {/* Ghost word: uppercase "ADMIN" outlined behind the card */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none leading-none font-black text-center tracking-tighter"
        aria-hidden="true"
        style={{
          fontSize: "clamp(100px, 22vw, 360px)",
          color: "transparent",
          WebkitTextStroke: "1.5px rgba(13, 13, 13, 0.07)",
        }}
      >
        ADMIN
      </div>

      {/* Centered Login Card */}
      <div className="relative z-10 w-full max-w-[420px] bg-white rounded-[24px] p-8 sm:p-10 shadow-2xl border border-black/10">
        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#0d0d0d] text-[#f4f2ee] font-mono text-xs font-semibold flex items-center justify-center shadow-md">
            SM
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0d0d0d]">
            Portfolio <span className="font-serif-italic font-normal text-[#77756f]">Console.</span>
          </h1>
          <p className="text-xs font-mono text-[#77756f]">
            Restricted administrative access
          </p>
        </div>

        {/* Error message banner */}
        {errorMessage && (
          <div
            className="mb-6 p-3 rounded-xl bg-neutral-100 border border-neutral-300 text-neutral-800 text-xs font-mono flex items-start gap-2"
            role="alert"
          >
            <span className="font-bold">!</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-mono uppercase tracking-wider text-[#77756f]">
              Email Address
            </label>
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@domain.com"
              className="admin-input"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-mono uppercase tracking-wider text-[#77756f]">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="admin-input"
            />
          </div>

          {show2FA && (
            <div className="space-y-1 pt-1">
              <label className="block text-xs font-mono uppercase tracking-wider text-[#77756f]">
                Two-Factor Code (6 digits)
              </label>
              <input
                type="text"
                maxLength={6}
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
                placeholder="123456"
                className="admin-input text-center tracking-widest font-mono text-base"
              />
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="admin-btn-primary w-full py-3"
            >
              {submitting ? "Verifying..." : "Sign in to console →"}
            </button>
          </div>

          <div className="pt-4 text-center">
            <button
              type="button"
              onClick={() => setShow2FA(!show2FA)}
              className="text-[11px] font-mono text-[#77756f] hover:text-[#0d0d0d] underline transition-colors"
            >
              {show2FA ? "Hide 2FA field" : "Have a 2FA code?"}
            </button>
          </div>
        </form>

        {/* Footer info */}
        <div className="mt-8 pt-4 border-t border-black/5 text-center text-[10px] font-mono text-[#a9a6a0]">
          Rate-limited and monitored · Single session control
        </div>
      </div>
    </div>
  );
}
