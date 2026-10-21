import React from "react";
import { useSectionEditor } from "../../hooks/useSectionEditor";
import EditorToolbar from "./EditorToolbar";

const SECTION_TOGGLES = [
  {
    key: "about",
    icon: "🪪",
    label: "About & 3D ID Card",
    desc: "Interactive identity badge, quick facts and summary.",
  },
  {
    key: "skills",
    icon: "⚛️",
    label: "Skills Periodic Table",
    desc: "Interactive chemistry element cards, filter chips and detail dialog.",
  },
  {
    key: "work",
    icon: "💼",
    label: "Selected Work & Projects",
    desc: "Expanding horizontal accordion showcase, mini-UI previews, tech stack chips.",
  },
  {
    key: "certifications",
    icon: "📜",
    label: "Certifications & Credentials",
    desc: "Professional licenses and verified training badges.",
  },
  {
    key: "experience",
    icon: "⏳",
    label: "Experience & Timeline",
    desc: "Career journey and internship deliverables.",
  },
  {
    key: "contact",
    icon: "✉️",
    label: "Contact & Footer",
    desc: "Direct outreach channels, email, tel, social links.",
  },
];

const FEATURE_TOGGLES = [
  {
    key: "enableSound",
    icon: "🔊",
    label: "Hero Video Audio & Toggle Button",
    desc: "Display audio toggle (▶/❚❚) and enable autoplay sound unlocking on the 16:9 hero video.",
  },
  {
    key: "showStatusBadge",
    icon: "🟢",
    label: "Hero Status Kicker Badge",
    desc: "Display the pulsing green dot status tag ('Available for Full-Stack Opportunities') at the top of the hero section.",
  },
  {
    key: "showGhostWatermark",
    icon: "🔤",
    label: "Hero Ghost Typography Watermark",
    desc: "Display the large 19vw transparent first-name watermark behind the hero video.",
  },
  {
    key: "enableIdCardFlip",
    icon: "🔄",
    label: "About 3D Lanyard Card Flip",
    desc: "Allow visitors to hover or click the 3D ID Card in the About section to flip and inspect achievements.",
  },
];

export default function SettingsEditor() {
  const editor = useSectionEditor("settings");
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
        Loading Settings Editor...
      </div>
    );
  }

  const visibility = data?.visibility || {};
  const features = data?.features || {};

  const toggleSection = (sectionKey) => {
    const currentVis = data?.visibility || {};
    const updated = {
      ...currentVis,
      [sectionKey]: currentVis[sectionKey] !== undefined ? !currentVis[sectionKey] : false,
    };
    setData({ ...data, visibility: updated });
  };

  const toggleFeature = (featureKey) => {
    const currentFeat = data?.features || {};
    const updated = {
      ...currentFeat,
      [featureKey]: currentFeat[featureKey] !== undefined ? !currentFeat[featureKey] : false,
    };
    setData({ ...data, features: updated });
  };

  const enableAllSections = () => {
    const allOn = {};
    SECTION_TOGGLES.forEach((s) => {
      allOn[s.key] = true;
    });
    setData({ ...data, visibility: allOn });
  };

  const disableAllSections = () => {
    const allOff = {};
    SECTION_TOGGLES.forEach((s) => {
      allOff[s.key] = false;
    });
    setData({ ...data, visibility: allOff });
  };

  const resetAllDefaults = () => {
    const allOn = {};
    SECTION_TOGGLES.forEach((s) => {
      allOn[s.key] = true;
    });
    const defaultFeatures = {};
    FEATURE_TOGGLES.forEach((f) => {
      defaultFeatures[f.key] = true;
    });
    setData({
      ...data,
      visibility: allOn,
      features: defaultFeatures,
    });
  };

  const activeCount = SECTION_TOGGLES.filter(
    (s) => visibility[s.key] !== false
  ).length;

  return (
    <div className="space-y-6">
      <EditorToolbar
        sectionKey="settings"
        title="Settings & Section Visibility"
        subtitle="Manage live section visibility, navigation links, and public interaction preferences in real time."
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

      {/* Real-time sync feedback banner */}
      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <div>
            <span className="font-semibold text-emerald-950 block">
              Live Real-Time Reflection Enabled
            </span>
            <span className="text-emerald-800 text-[11px] font-mono">
              Changes published here immediately update the public site and navigation menu without page reload via SSE.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-[11px] text-emerald-900 bg-white/70 px-2.5 py-1 rounded-full border border-emerald-300">
          <span>{activeCount} of {SECTION_TOGGLES.length} Sections Visible</span>
        </div>
      </div>

      {/* Section 1: Public Section Toggles */}
      <div className="admin-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/5">
          <div>
            <h3 className="text-base font-bold text-[#0d0d0d] flex items-center gap-2">
              <span>🌐</span> Public Section Toggles
            </h3>
            <p className="text-xs font-mono text-[#77756f] mt-0.5">
              Turning off a section removes it from the page and hides its link from the navigation bar.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={enableAllSections}
              className="admin-btn-secondary text-[11px] font-mono py-1 px-2.5"
            >
              Show All
            </button>
            <button
              onClick={disableAllSections}
              className="admin-btn-secondary text-[11px] font-mono py-1 px-2.5"
            >
              Hide All
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {SECTION_TOGGLES.map((sec) => {
            const isVisible = visibility[sec.key] !== false; // default true
            return (
              <div
                key={sec.key}
                className={`p-4 rounded-xl border transition-all duration-200 flex items-center justify-between gap-4 ${
                  isVisible
                    ? "border-black/10 bg-white/80 shadow-xs"
                    : "border-black/5 bg-neutral-50/70 opacity-60"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-lg shrink-0">{sec.icon}</span>
                  <div>
                    <div className="font-semibold text-xs text-[#0d0d0d] flex items-center gap-2">
                      <span>{sec.label}</span>
                      <span
                        className={`font-mono text-[10px] px-2 py-0.5 rounded-full ${
                          isVisible
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-neutral-200/70 text-[#77756f]"
                        }`}
                      >
                        {isVisible ? "Active / Visible on Public Site" : "Hidden from Public Site & Nav"}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#77756f] mt-0.5">{sec.desc}</p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={isVisible}
                    onChange={() => toggleSection(sec.key)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0d0d0d]"></div>
                </label>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Interactive Feature Preferences */}
      <div className="admin-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-black/5">
          <div>
            <h3 className="text-base font-bold text-[#0d0d0d] flex items-center gap-2">
              <span>✨</span> Hero & Interaction Preferences
            </h3>
            <p className="text-xs font-mono text-[#77756f] mt-0.5">
              Fine-tune micro-interactions and visual elements across the public site.
            </p>
          </div>

          <button
            onClick={resetAllDefaults}
            className="admin-btn-secondary text-[11px] font-mono py-1 px-2.5 self-start sm:self-auto shrink-0"
          >
            Reset Defaults
          </button>
        </div>

        <div className="space-y-3">
          {FEATURE_TOGGLES.map((feat) => {
            const isEnabled = features[feat.key] !== false; // default true
            return (
              <div
                key={feat.key}
                className={`p-4 rounded-xl border transition-all duration-200 flex items-center justify-between gap-4 ${
                  isEnabled
                    ? "border-black/10 bg-white/80 shadow-xs"
                    : "border-black/5 bg-neutral-50/70 opacity-60"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-lg shrink-0">{feat.icon}</span>
                  <div>
                    <div className="font-semibold text-xs text-[#0d0d0d] flex items-center gap-2">
                      <span>{feat.label}</span>
                      <span
                        className={`font-mono text-[10px] px-2 py-0.5 rounded-full ${
                          isEnabled
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-neutral-200/70 text-[#77756f]"
                        }`}
                      >
                        {isEnabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#77756f] mt-0.5">{feat.desc}</p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={() => toggleFeature(feat.key)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0d0d0d]"></div>
                </label>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
