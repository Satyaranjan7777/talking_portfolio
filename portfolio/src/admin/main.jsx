import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./admin.css";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import Login from "./components/Login";
import AdminLayout from "./components/AdminLayout";
import Dashboard from "./components/Dashboard";
import ProjectsEditor from "./components/editors/ProjectsEditor";
import HeroEditor from "./components/editors/HeroEditor";
import AboutEditor from "./components/editors/AboutEditor";
import SkillsEditor from "./components/editors/SkillsEditor";
import CertificationsEditor from "./components/editors/CertificationsEditor";
import ExperienceEditor from "./components/editors/ExperienceEditor";
import EducationEditor from "./components/editors/EducationEditor";
import ContactEditor from "./components/editors/ContactEditor";
import SeoEditor from "./components/editors/SeoEditor";
import SettingsEditor from "./components/editors/SettingsEditor";
import AuditLogsViewer from "./components/security/AuditLogsViewer";
import ResumeManager from "./components/resume/ResumeManager";


function AdminApp() {
  const { admin, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Sync hash routing (e.g., #/projects, #/skills, #/hero)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace("#/", "").replace("#", "");
      if (hash) setActiveTab(hash);
    };

    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    window.location.hash = `#/${tabId}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f2ee] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-[#0d0d0d] text-white font-mono text-sm font-bold flex items-center justify-center animate-pulse">
          SM
        </div>
        <div className="font-mono text-xs text-[#77756f]">
          Loading Console...
        </div>
      </div>
    );
  }

  if (!admin) {
    return <Login onLoginSuccess={() => handleSelectTab("dashboard")} />;
  }

  const renderActiveEditor = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard onNavigate={handleSelectTab} />;
      case "hero-video":
        return <HeroEditor initialSubTab="video" />;
      case "hero":
        return <HeroEditor initialSubTab="content" />;
      case "projects":
      case "work":
        return <ProjectsEditor />;
      case "about":
        return <AboutEditor />;
      case "skills":
        return <SkillsEditor />;
      case "certifications":
        return <CertificationsEditor />;
      case "experience":
        return <ExperienceEditor />;
      case "education":
        return <EducationEditor />;
      case "contact":
        return <ContactEditor />;
      case "seo":
        return <SeoEditor />;
      case "resume":
        return <ResumeManager />;
      case "security":
        return <AuditLogsViewer />;

      case "settings":
        return <SettingsEditor />;
      default:
        return <Dashboard onNavigate={handleSelectTab} />;
    }
  };

  return (
    <AdminLayout activeTab={activeTab} onSelectTab={handleSelectTab}>
      <div className="max-w-[1200px] w-full mx-auto">
        {renderActiveEditor()}
      </div>
    </AdminLayout>
  );
}

const rootEl = document.getElementById("admin-root");
if (rootEl) {
  createRoot(rootEl).render(
    <React.StrictMode>
      <AuthProvider>
        <SocketProvider>
          <AdminApp />
        </SocketProvider>
      </AuthProvider>
    </React.StrictMode>
  );
}
