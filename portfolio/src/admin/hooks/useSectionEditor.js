import { useState, useEffect, useCallback } from "react";
import { useSocket } from "../context/SocketContext";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function useSectionEditor(sectionKey) {
  const [data, setData] = useState(null);
  const [initialData, setInitialData] = useState(null);
  const [publishedData, setPublishedData] = useState(null);
  const [status, setStatus] = useState("published");
  const [version, setVersion] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [discarding, setDiscarding] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [successMsg, setSuccessMsg] = useState("");
  const [isRevisionsOpen, setIsRevisionsOpen] = useState(false);

  const { latestVersions } = useSocket();

  const fetchSection = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setValidationErrors([]);
      const res = await fetch(`${API_BASE}/api/admin/content/${sectionKey}`, {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch ${sectionKey} content (${res.status})`);
      }

      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data.draft);
        setInitialData(JSON.parse(JSON.stringify(json.data.draft)));
        setPublishedData(json.data.published);
        setStatus(json.data.status || "published");
        setVersion(json.data.version || 1);
      }
    } catch (err) {
      setError(err.message || "Failed to load section data");
    } finally {
      setLoading(false);
    }
  }, [sectionKey]);

  useEffect(() => {
    fetchSection();
  }, [fetchSection]);

  const hasUnsavedChanges =
    JSON.stringify(data) !== JSON.stringify(initialData);

  // Detect conflict if remote version is ahead of our loaded version
  const remoteVersion = latestVersions[sectionKey];
  const hasConflict = remoteVersion !== undefined && remoteVersion > version;

  const saveDraft = async () => {
    try {
      setSaving(true);
      setError(null);
      setValidationErrors([]);
      setSuccessMsg("");

      const res = await fetch(`${API_BASE}/api/admin/content/${sectionKey}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ draft: data }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        if (json.details && Array.isArray(json.details)) {
          setValidationErrors(json.details);
        }
        throw new Error(json.error || "Failed to save draft");
      }

      setInitialData(JSON.parse(JSON.stringify(data)));
      setStatus("changed");
      setSuccessMsg("Draft saved successfully.");
      setTimeout(() => setSuccessMsg(""), 4000);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const publish = async (note = "") => {
    try {
      setPublishing(true);
      setError(null);
      setValidationErrors([]);
      setSuccessMsg("");

      // Automatically save current draft first if modified
      if (hasUnsavedChanges) {
        const saved = await saveDraft();
        if (!saved) return false;
      }

      const res = await fetch(
        `${API_BASE}/api/admin/content/${sectionKey}/publish`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ note: note || "Published via admin console" }),
        }
      );

      const json = await res.json();
      if (!res.ok || !json.success) {
        if (json.details && Array.isArray(json.details)) {
          setValidationErrors(
            json.details.map((d) => `${d.path?.join(".")}: ${d.message}`)
          );
        }
        throw new Error(json.error || "Failed to publish section");
      }

      setPublishedData(json.data.published);
      setData(json.data.draft);
      setInitialData(JSON.parse(JSON.stringify(json.data.draft)));
      setStatus("published");
      setVersion(json.data.version);
      setSuccessMsg(`Published v${json.data.version} live! Live portfolio updated.`);
      setTimeout(() => setSuccessMsg(""), 5000);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setPublishing(false);
    }
  };

  const discard = async () => {
    try {
      setDiscarding(true);
      setError(null);
      setValidationErrors([]);
      setSuccessMsg("");

      const res = await fetch(
        `${API_BASE}/api/admin/content/${sectionKey}/discard`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to discard draft");
      }

      setData(json.data.draft);
      setInitialData(JSON.parse(JSON.stringify(json.data.draft)));
      setStatus("published");
      setSuccessMsg("Draft discarded. Reverted to published content.");
      setTimeout(() => setSuccessMsg(""), 4000);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setDiscarding(false);
    }
  };

  return {
    data,
    setData,
    initialData,
    publishedData,
    status,
    version,
    remoteVersion,
    hasConflict,
    loading,
    saving,
    publishing,
    discarding,
    hasUnsavedChanges,
    error,
    validationErrors,
    successMsg,
    isRevisionsOpen,
    openRevisions: () => setIsRevisionsOpen(true),
    closeRevisions: () => setIsRevisionsOpen(false),
    saveDraft,
    publish,
    discard,
    refetch: fetchSection,
    reloadLatest: fetchSection,
  };
}
