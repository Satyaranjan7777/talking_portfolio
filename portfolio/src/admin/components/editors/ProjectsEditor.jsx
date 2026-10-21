import React, { useState } from "react";
import { useSectionEditor } from "../../hooks/useSectionEditor";
import EditorToolbar from "./EditorToolbar";

const MINI_UI_OPTIONS = [
  { value: "chat", label: "Live Chat (Socket.io Presence)" },
  { value: "store", label: "E-Commerce (Cart & RBAC Catalog)" },
  { value: "kanban", label: "ATS Pipeline (8-Stage ATS Match)" },
  { value: "generic", label: "Systems Architecture (Sync & Microservices)" },
];

export default function ProjectsEditor() {
  const editor = useSectionEditor("projects");
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

  const [activeProjectIndex, setActiveProjectIndex] = useState(0);
  const [newTagInput, setNewTagInput] = useState("");
  const [newFeatureInput, setNewFeatureInput] = useState("");

  if (loading) {
    return (
      <div className="admin-card p-12 text-center text-[#77756f] font-mono text-xs animate-pulse">
        Loading Projects Editor...
      </div>
    );
  }

  const projects = data?.projects || [];
  const currentProject = projects[activeProjectIndex] || projects[0] || null;

  const updateCurrentProject = (updates) => {
    const updatedList = projects.map((proj, idx) => {
      if (idx === activeProjectIndex) {
        return { ...proj, ...updates };
      }
      return proj;
    });
    setData({ ...data, projects: updatedList });
  };

  const handleMove = (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= projects.length) return;

    const copy = [...projects];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIdx, 0, moved);

    // Update indices (e.g. 01, 02...)
    const reindexed = copy.map((p, i) => ({
      ...p,
      index: String(i + 1).padStart(2, "0"),
    }));

    setData({ ...data, projects: reindexed });
    setActiveProjectIndex(targetIdx);
  };

  const handleAddProject = () => {
    const newIdx = projects.length + 1;
    const newId = `project-${Date.now().toString().slice(-4)}`;
    const newProj = {
      id: newId,
      index: String(newIdx).padStart(2, "0"),
      title: "New Featured System",
      kicker: "Full-Stack Application",
      date: "2026",
      description: "Brief summary of architecture, scalability, and impact.",
      features: ["Real-time synchronization", "Role-based authentication"],
      tech: ["React.js", "Node.js", "Express.js", "MongoDB"],
      github: "https://github.com/Satyaranjan7777",
      live: "https://satyaranjan7777.netlify.app",
      miniUiVariant: "generic",
    };

    const updated = [...projects, newProj];
    setData({ ...data, projects: updated });
    setActiveProjectIndex(updated.length - 1);
  };

  const handleDeleteProject = (indexToDelete) => {
    if (projects.length <= 1) {
      alert("At least one project must remain in the showcase.");
      return;
    }
    if (
      !confirm(
        `Are you sure you want to delete "${projects[indexToDelete]?.title}"?`
      )
    )
      return;

    const filtered = projects.filter((_, idx) => idx !== indexToDelete);
    const reindexed = filtered.map((p, i) => ({
      ...p,
      index: String(i + 1).padStart(2, "0"),
    }));

    setData({ ...data, projects: reindexed });
    setActiveProjectIndex(Math.max(0, indexToDelete - 1));
  };

  // Tech tags management
  const handleAddTech = (e) => {
    if (e.key === "Enter" || e.type === "click") {
      e.preventDefault();
      const trimmed = newTagInput.trim();
      if (!trimmed || !currentProject) return;
      const currentTech = currentProject.tech || [];
      if (!currentTech.includes(trimmed)) {
        updateCurrentProject({ tech: [...currentTech, trimmed] });
      }
      setNewTagInput("");
    }
  };

  const handleRemoveTech = (tagToRemove) => {
    if (!currentProject) return;
    const currentTech = currentProject.tech || [];
    updateCurrentProject({
      tech: currentTech.filter((t) => t !== tagToRemove),
    });
  };

  // Features list management
  const handleAddFeature = (e) => {
    if (e.key === "Enter" || e.type === "click") {
      e.preventDefault();
      const trimmed = newFeatureInput.trim();
      if (!trimmed || !currentProject) return;
      const curFeatures = currentProject.features || [];
      updateCurrentProject({ features: [...curFeatures, trimmed] });
      setNewFeatureInput("");
    }
  };

  const handleRemoveFeature = (featIndex) => {
    if (!currentProject) return;
    const curFeatures = currentProject.features || [];
    updateCurrentProject({
      features: curFeatures.filter((_, i) => i !== featIndex),
    });
  };

  return (
    <div className="space-y-6">
      <EditorToolbar
        sectionKey="projects"
        title="Projects & Work Section"
        subtitle="Manage the expanding accordion gallery, interactive mockups, tech stacks, and repo URLs."
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

      {/* Main Two-Column Layout: Project Navigator (Left) + Detail Editor (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Project Selector & Reordering */}
        <div className="lg:col-span-4 space-y-3">
          <div className="admin-card p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-black/5">
              <span className="font-mono text-xs uppercase tracking-wider text-[#77756f]">
                Showcase ({projects.length})
              </span>
              <button
                type="button"
                onClick={handleAddProject}
                className="admin-btn-primary text-xs px-2.5 py-1"
              >
                + Add Project
              </button>
            </div>

            <div className="space-y-2">
              {projects.map((proj, idx) => {
                const isSelected = idx === activeProjectIndex;
                return (
                  <div
                    key={proj.id || idx}
                    onClick={() => setActiveProjectIndex(idx)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? "bg-[#0d0d0d] text-white border-[#0d0d0d] shadow-sm"
                        : "bg-white/80 hover:bg-white border-black/10 text-[#0d0d0d]"
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span
                        className={`font-mono text-xs font-bold ${
                          isSelected ? "text-neutral-400" : "text-[#77756f]"
                        }`}
                      >
                        {proj.index}
                      </span>
                      <div className="truncate">
                        <div className="font-semibold text-xs truncate">
                          {proj.title}
                        </div>
                        <div
                          className={`font-mono text-[10px] truncate ${
                            isSelected ? "text-neutral-400" : "text-[#77756f]"
                          }`}
                        >
                          {proj.kicker}
                        </div>
                      </div>
                    </div>

                    {/* Reorder and Delete controls */}
                    <div
                      className="flex items-center gap-1 shrink-0 ml-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => handleMove(idx, -1)}
                        disabled={idx === 0}
                        title="Move Up"
                        className={`w-6 h-6 rounded flex items-center justify-center font-mono text-xs ${
                          isSelected
                            ? "hover:bg-neutral-800 disabled:opacity-30"
                            : "hover:bg-neutral-100 disabled:opacity-30"
                        }`}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMove(idx, 1)}
                        disabled={idx === projects.length - 1}
                        title="Move Down"
                        className={`w-6 h-6 rounded flex items-center justify-center font-mono text-xs ${
                          isSelected
                            ? "hover:bg-neutral-800 disabled:opacity-30"
                            : "hover:bg-neutral-100 disabled:opacity-30"
                        }`}
                      >
                        ↓
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Project Fields Editor */}
        <div className="lg:col-span-8">
          {currentProject ? (
            <div className="admin-card p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-black/5">
                <div>
                  <div className="font-mono text-xs text-[#77756f] uppercase">
                    Editing Project #{currentProject.index}
                  </div>
                  <h3 className="text-xl font-bold text-[#0d0d0d]">
                    {currentProject.title}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteProject(activeProjectIndex)}
                  className="text-xs text-rose-600 hover:text-rose-800 font-mono px-2 py-1 rounded hover:bg-rose-50"
                >
                  Delete Project
                </button>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#0d0d0d] mb-1">
                    Project Title
                  </label>
                  <input
                    type="text"
                    value={currentProject.title || ""}
                    onChange={(e) =>
                      updateCurrentProject({ title: e.target.value })
                    }
                    className="admin-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0d0d0d] mb-1">
                    Kicker / Category Tag
                  </label>
                  <input
                    type="text"
                    value={currentProject.kicker || ""}
                    onChange={(e) =>
                      updateCurrentProject({ kicker: e.target.value })
                    }
                    placeholder="e.g. Real-Time Chat Application"
                    className="admin-input"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0d0d0d] mb-1">
                    Slug ID (Used for Anchor & Accordion Key)
                  </label>
                  <input
                    type="text"
                    value={currentProject.id || ""}
                    onChange={(e) =>
                      updateCurrentProject({ id: e.target.value })
                    }
                    className="admin-input font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0d0d0d] mb-1">
                    Completion Date / Period
                  </label>
                  <input
                    type="text"
                    value={currentProject.date || ""}
                    onChange={(e) =>
                      updateCurrentProject({ date: e.target.value })
                    }
                    placeholder="e.g. May 2026"
                    className="admin-input font-mono text-xs"
                  />
                </div>

                {/* Mini UI Mockup Selector */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#0d0d0d] mb-1">
                    Interactive Mini-UI Mockup Style
                  </label>
                  <select
                    value={currentProject.miniUiVariant || "generic"}
                    onChange={(e) =>
                      updateCurrentProject({ miniUiVariant: e.target.value })
                    }
                    className="admin-input font-mono text-xs"
                  >
                    {MINI_UI_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-[#77756f] mt-1">
                    Controls the animated illustrative card rendered inside the expanded accordion column.
                  </p>
                </div>

                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#0d0d0d] mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={currentProject.description || ""}
                    onChange={(e) =>
                      updateCurrentProject({ description: e.target.value })
                    }
                    className="admin-input"
                  />
                </div>

                {/* GitHub & Live URL */}
                <div>
                  <label className="block text-xs font-semibold text-[#0d0d0d] mb-1">
                    GitHub Repository Link
                  </label>
                  <input
                    type="url"
                    value={currentProject.github || ""}
                    onChange={(e) =>
                      updateCurrentProject({ github: e.target.value })
                    }
                    placeholder="https://github.com/..."
                    className="admin-input font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0d0d0d] mb-1">
                    Live Demo Link
                  </label>
                  <input
                    type="url"
                    value={currentProject.live || ""}
                    onChange={(e) =>
                      updateCurrentProject({ live: e.target.value })
                    }
                    placeholder="https://..."
                    className="admin-input font-mono text-xs"
                  />
                </div>
              </div>

              {/* Tech Stack Chips */}
              <div className="space-y-2 pt-2 border-t border-black/5">
                <label className="block text-xs font-semibold text-[#0d0d0d]">
                  Tech Stack Chips
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {(currentProject.tech || []).map((t, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/5 text-[#0d0d0d] font-mono text-xs"
                    >
                      <span>{t}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTech(t)}
                        className="text-[#77756f] hover:text-black font-bold text-xs"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={handleAddTech}
                    placeholder="Type technology (e.g. Socket.io, Tailwind) and press Enter"
                    className="admin-input text-xs font-mono flex-1"
                  />
                  <button
                    type="button"
                    onClick={handleAddTech}
                    className="admin-btn-secondary text-xs px-3 py-2 shrink-0"
                  >
                    + Add Tag
                  </button>
                </div>
              </div>

              {/* Key Features List */}
              <div className="space-y-3 pt-2 border-t border-black/5">
                <label className="block text-xs font-semibold text-[#0d0d0d]">
                  Key Features / Engineering Highlights
                </label>
                <div className="space-y-2">
                  {(currentProject.features || []).map((feat, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 bg-black/5 rounded-lg text-xs"
                    >
                      <span className="font-mono text-[#77756f] text-[11px] shrink-0">
                        0{idx + 1}.
                      </span>
                      <span className="flex-1 text-[#0d0d0d]">{feat}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        className="text-[#77756f] hover:text-rose-600 font-bold px-1.5"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newFeatureInput}
                    onChange={(e) => setNewFeatureInput(e.target.value)}
                    onKeyDown={handleAddFeature}
                    placeholder="Add a bullet point feature..."
                    className="admin-input text-xs flex-1"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="admin-btn-secondary text-xs px-3 py-2 shrink-0"
                  >
                    + Add Bullet
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="admin-card p-12 text-center text-[#77756f] text-xs">
              Select or add a project from the left panel to begin editing.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
