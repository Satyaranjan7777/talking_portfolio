import React, { useState } from "react";
import { useSectionEditor } from "../../hooks/useSectionEditor";
import EditorToolbar from "./EditorToolbar";

export default function SkillsEditor() {
  const editor = useSectionEditor("skills");
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

  const [activeGroupIdx, setActiveGroupIdx] = useState(0);
  const [activeSkillIdx, setActiveSkillIdx] = useState(0);

  if (loading) {
    return (
      <div className="admin-card p-12 text-center text-[#77756f] font-mono text-xs animate-pulse">
        Loading Skills Editor...
      </div>
    );
  }

  const groups = data?.groups || [];
  const currentGroup = groups[activeGroupIdx] || groups[0] || null;
  const currentSkill = currentGroup?.skills?.[activeSkillIdx] || currentGroup?.skills?.[0] || null;

  const updateGroups = (newGroups) => {
    setData({ ...data, groups: newGroups });
  };

  const handleAddGroup = () => {
    const newGroup = {
      family: "New Category",
      skills: [
        {
          symbol: "Sk",
          name: "New Skill",
          detail: "Description",
          isBrand: false,
          conceptKey: "general",
          usedIn: [],
        },
      ],
    };
    const updated = [...groups, newGroup];
    updateGroups(updated);
    setActiveGroupIdx(updated.length - 1);
    setActiveSkillIdx(0);
  };

  const handleDeleteGroup = (idx) => {
    if (groups.length <= 1) {
      alert("At least one skill group must remain.");
      return;
    }
    if (!confirm(`Delete family "${groups[idx]?.family}" and all its skills?`))
      return;
    const filtered = groups.filter((_, i) => i !== idx);
    updateGroups(filtered);
    setActiveGroupIdx(Math.max(0, idx - 1));
    setActiveSkillIdx(0);
  };

  const updateCurrentSkill = (updates) => {
    if (!currentGroup) return;
    const updatedSkills = (currentGroup.skills || []).map((sk, i) => {
      if (i === activeSkillIdx) {
        return { ...sk, ...updates };
      }
      return sk;
    });

    const updatedGroups = groups.map((g, i) => {
      if (i === activeGroupIdx) {
        return { ...g, skills: updatedSkills };
      }
      return g;
    });

    updateGroups(updatedGroups);
  };

  const handleAddSkill = () => {
    if (!currentGroup) return;
    const newSkill = {
      symbol: "Nx",
      name: "New Technology",
      detail: "Competency detail",
      isBrand: true,
      brandKey: "react",
      usedIn: [],
    };
    const updatedSkills = [...(currentGroup.skills || []), newSkill];
    const updatedGroups = groups.map((g, i) => {
      if (i === activeGroupIdx) {
        return { ...g, skills: updatedSkills };
      }
      return g;
    });
    updateGroups(updatedGroups);
    setActiveSkillIdx(updatedSkills.length - 1);
  };

  const handleDeleteSkill = (sIdx) => {
    if ((currentGroup?.skills || []).length <= 1) {
      alert("A group must contain at least one skill.");
      return;
    }
    const filteredSkills = currentGroup.skills.filter((_, i) => i !== sIdx);
    const updatedGroups = groups.map((g, i) => {
      if (i === activeGroupIdx) {
        return { ...g, skills: filteredSkills };
      }
      return g;
    });
    updateGroups(updatedGroups);
    setActiveSkillIdx(Math.max(0, sIdx - 1));
  };

  return (
    <div className="space-y-6">
      <EditorToolbar
        sectionKey="skills"
        title="Skills Periodic Table"
        subtitle="Manage periodic-table families, element symbols, brand vectors, and project links."
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

      {/* Group selector tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-black/5">
        {groups.map((group, idx) => {
          const isSelected = idx === activeGroupIdx;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setActiveGroupIdx(idx);
                setActiveSkillIdx(0);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium whitespace-nowrap transition-all ${
                isSelected
                  ? "bg-[#0d0d0d] text-white"
                  : "bg-white/80 hover:bg-white text-[#77756f] border border-black/10"
              }`}
            >
              {group.family} ({group.skills?.length || 0})
            </button>
          );
        })}
        <button
          type="button"
          onClick={handleAddGroup}
          className="admin-btn-secondary text-xs px-2.5 py-1 whitespace-nowrap"
        >
          + Add Group
        </button>
      </div>

      {/* Editor Body */}
      {currentGroup && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Skills Grid in Selected Family (Left) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="admin-card p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-black/5">
                <div>
                  <span className="font-mono text-[11px] text-[#77756f] uppercase">
                    Family Name
                  </span>
                  <input
                    type="text"
                    value={currentGroup.family || ""}
                    onChange={(e) => {
                      const updated = groups.map((g, i) =>
                        i === activeGroupIdx ? { ...g, family: e.target.value } : g
                      );
                      updateGroups(updated);
                    }}
                    className="admin-input text-xs font-bold mt-1"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteGroup(activeGroupIdx)}
                  className="text-xs text-rose-600 hover:text-rose-800 font-mono px-2 py-1"
                >
                  Delete Group
                </button>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="font-mono text-xs uppercase tracking-wider text-[#77756f]">
                  Skills ({currentGroup.skills?.length || 0})
                </span>
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="admin-btn-primary text-xs px-2 py-1"
                >
                  + Add Skill
                </button>
              </div>

              {/* Skill items list */}
              <div className="space-y-1.5 max-h-[480px] overflow-y-auto pr-1">
                {(currentGroup.skills || []).map((sk, idx) => {
                  const isSelected = idx === activeSkillIdx;
                  return (
                    <div
                      key={idx}
                      onClick={() => setActiveSkillIdx(idx)}
                      className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? "bg-[#0d0d0d] text-white border-[#0d0d0d]"
                          : "bg-white hover:bg-neutral-50 border-black/10 text-[#0d0d0d]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <span
                          className={`w-7 h-7 rounded border flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                            isSelected
                              ? "bg-neutral-800 border-neutral-700 text-white"
                              : "bg-neutral-100 border-black/10 text-[#0d0d0d]"
                          }`}
                        >
                          {sk.symbol}
                        </span>
                        <div className="truncate">
                          <div className="font-semibold text-xs truncate">
                            {sk.name}
                          </div>
                          <div
                            className={`font-mono text-[10px] truncate ${
                              isSelected ? "text-neutral-400" : "text-[#77756f]"
                            }`}
                          >
                            {sk.detail || "No detail"}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSkill(idx);
                        }}
                        className={`text-xs px-1.5 py-0.5 rounded ${
                          isSelected
                            ? "text-neutral-400 hover:text-rose-400"
                            : "text-[#77756f] hover:text-rose-600"
                        }`}
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Skill detail form (Right) */}
          <div className="lg:col-span-7">
            {currentSkill ? (
              <div className="admin-card p-6 sm:p-8 space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b border-black/5">
                  <div className="w-12 h-12 rounded-xl bg-[#0d0d0d] text-white font-mono text-lg font-bold flex items-center justify-center">
                    {currentSkill.symbol}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-[#0d0d0d]">
                      {currentSkill.name}
                    </h4>
                    <span className="font-mono text-xs text-[#77756f]">
                      {currentGroup.family} element
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#0d0d0d] mb-1">
                      Periodic Element Symbol (2-3 chars)
                    </label>
                    <input
                      type="text"
                      maxLength={3}
                      value={currentSkill.symbol || ""}
                      onChange={(e) =>
                        updateCurrentSkill({ symbol: e.target.value })
                      }
                      className="admin-input font-mono font-bold uppercase text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0d0d0d] mb-1">
                      Skill Name
                    </label>
                    <input
                      type="text"
                      value={currentSkill.name || ""}
                      onChange={(e) =>
                        updateCurrentSkill({ name: e.target.value })
                      }
                      className="admin-input"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#0d0d0d] mb-1">
                      Detail / Specialty (Rendered on card hover)
                    </label>
                    <input
                      type="text"
                      value={currentSkill.detail || ""}
                      onChange={(e) =>
                        updateCurrentSkill({ detail: e.target.value })
                      }
                      placeholder="e.g. Hooks, Redux Toolkit, Performance"
                      className="admin-input"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0d0d0d] mb-1">
                      Icon Type
                    </label>
                    <div className="flex items-center gap-4 mt-2">
                      <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentSkill.isBrand || false}
                          onChange={(e) =>
                            updateCurrentSkill({ isBrand: e.target.checked })
                          }
                          className="rounded border-black/20"
                        />
                        <span>Official Brand SVG Logo</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#0d0d0d] mb-1">
                      Brand / Concept Key
                    </label>
                    <input
                      type="text"
                      value={
                        (currentSkill.isBrand
                          ? currentSkill.brandKey
                          : currentSkill.conceptKey) || ""
                      }
                      onChange={(e) =>
                        updateCurrentSkill(
                          currentSkill.isBrand
                            ? { brandKey: e.target.value }
                            : { conceptKey: e.target.value }
                        )
                      }
                      placeholder="e.g. react, nodejs, security"
                      className="admin-input font-mono text-xs"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="admin-card p-12 text-center text-xs text-[#77756f]">
                Select a skill on the left to edit its details.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
