/**
 * Public Data Layer: Fetch + Cache + SSE + Zero-Delay Bundled Fallback
 * Provides synchronous first-paint data with live background hydration and native SSE revalidation.
 */

import { useState, useEffect } from "react";
import {
  PROFILE as STATIC_PROFILE,
  NAV as STATIC_NAV,
  SKILL_GROUPS as STATIC_SKILL_GROUPS,
  ALL_SKILLS as STATIC_ALL_SKILLS,
  PROJECTS as STATIC_PROJECTS,
  CERTIFICATIONS as STATIC_CERTIFICATIONS,
  EXPERIENCE as STATIC_EXPERIENCE,
  EDUCATION as STATIC_EDUCATION,
} from "./data.js";

const CACHE_KEY = "portfolio_content_cache_v1";
const ETAG_KEY = "portfolio_content_etag_v1";
const API_BASE = ""; // Uses Vite dev proxy or relative path on Netlify

// In-memory store initialized with static bundled data
let store = {
  hero: {
    ...STATIC_PROFILE,
    videoMp4: "/hero/hero.mp4",
    videoWebm: "/hero/hero.webm",
    statusTag: "Available for Full-Stack Opportunities",
  },
  about: {
    ...STATIC_PROFILE,
    education: "MCA (2025)",
    focus:
      "High-concurrency WebSockets, role-based multi-tenancy, and LLM-powered candidate intelligence.",
    undergrad: "B.Sc. IT (8.51 CGPA)",
    internship: "Arah Infotech",
    idCard: {
      idNo: STATIC_PROFILE.idNo,
      dept: STATIC_PROFILE.dept,
      validTill: STATIC_PROFILE.validTill,
      portraitBust: "/portrait-bust.webp",
      backPoints: [
        `• ${STATIC_PROFILE.role}`,
        "• MCA (CGPA: 7.21) & B.Sc. IT (CGPA: 8.51)",
        "• Engineered Multi-Tenant ATS matching 100+ resumes/day",
        "• Real-time architectures: Socket.io, JWT, Zustand, Redis patterns",
      ],
    },
  },
  skills: {
    groups: STATIC_SKILL_GROUPS,
    allSkills: STATIC_ALL_SKILLS,
  },
  projects: STATIC_PROJECTS,
  certifications: STATIC_CERTIFICATIONS,
  experience: STATIC_EXPERIENCE,
  education: STATIC_EDUCATION,
  contact: STATIC_PROFILE,
  nav: STATIC_NAV,
  seo: {
    title: "Satyaranjan Moharana — Full Stack Developer (MERN Stack)",
    description:
      "Portfolio of Satyaranjan Moharana, MERN Stack Developer building multi-tenant recruitment platforms, real-time architectures, and AI integrations.",
    ogImage: "/og.jpg",
    themeColor: "#f4f2ee",
  },
  settings: {
    visibility: {
      about: true,
      skills: true,
      work: true,
      certifications: true,
      experience: true,
      contact: true,
    },
    features: {
      enableSound: true,
      showStatusBadge: true,
      showGhostWatermark: true,
      enableIdCardFlip: true,
    },
  },
  resume: {
    url: STATIC_PROFILE.resumePath || "/resume.pdf",
    downloadName: "Satyaranjan_Moharana_Resume.pdf",
    version: 1,
    updatedAt: null,
  },
  heroMedia: {
    mp4Url: "/hero/hero.mp4",
    webmUrl: "/hero/hero.webm",
    posterUrl: "/portrait-bust.webp",
    version: 1,
    bytes: 0,
    duration: 0,
    updatedAt: null,
  },
};


// Subscriber listeners
const listeners = new Set();

function notify() {
  for (const listener of listeners) {
    listener();
  }
}

// Hydrate from localStorage on client boot if available
if (typeof window !== "undefined") {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      store = { ...store, ...parsed };
    }
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Normalizes backend section data into the exact format expected by components
 */
function normalizeSection(key, rawData) {
  if (!rawData) return store[key];

  switch (key) {
    case "hero":
      return {
        ...store.hero,
        ...rawData,
      };

    case "about":
      return {
        ...store.about,
        ...rawData,
        education: rawData.education || store.about.education,
        idCard: {
          ...store.about.idCard,
          ...(rawData.idCard || {}),
        },
      };

    case "skills": {
      const groups = rawData.groups || STATIC_SKILL_GROUPS;
      const allSkills = groups.flatMap((group, gIdx) =>
        (group.skills || []).map((s, sIdx) => ({
          ...s,
          family: group.family,
          atomicNumber: gIdx * 10 + sIdx + 1,
          usedIn:
            s.usedIn ||
            (s.name.includes("React") || s.name.includes("Node") || s.name.includes("Mongo")
              ? ["Draft Chat", "EzzyShop", "Candidate Management System (CMS)"]
              : ["Draft Chat", "EzzyShop"]),
        }))
      );
      return { groups, allSkills };
    }

    case "projects":
      return rawData.projects || rawData;

    case "certifications":
      return rawData.certifications || rawData;

    case "experience":
      return rawData.timeline || rawData;

    case "education":
      return rawData.education || rawData;

    case "contact":
      return {
        ...store.contact,
        ...rawData,
      };

    case "seo":
      return {
        ...store.seo,
        ...rawData,
      };

    case "settings":
      return {
        visibility: {
          about: true,
          skills: true,
          work: true,
          certifications: true,
          experience: true,
          contact: true,
          ...(rawData?.visibility || {}),
        },
        features: {
          enableSound: true,
          showStatusBadge: true,
          showGhostWatermark: true,
          enableIdCardFlip: true,
          ...(rawData?.features || {}),
        },
      };

    case "resume":
      return {
        url: rawData.url || store.resume.url || STATIC_PROFILE.resumePath || "/resume.pdf",
        downloadName: rawData.downloadName || store.resume.downloadName || "Satyaranjan_Moharana_Resume.pdf",
        version: rawData.version || 1,
        updatedAt: rawData.updatedAt || null,
      };

    case "heroMedia":
      return {
        mp4Url: rawData.mp4Url || store.heroMedia.mp4Url,
        webmUrl: rawData.webmUrl || store.heroMedia.webmUrl,
        posterUrl: rawData.posterUrl || store.heroMedia.posterUrl,
        version: rawData.version || 1,
        bytes: rawData.bytes || 0,
        duration: rawData.duration || 0,
        updatedAt: rawData.updatedAt || null,
      };

    default:
      return rawData;

  }
}

/**
 * Fetch all content from API with ETag checking and localStorage caching
 */
async function fetchAllContent() {
  if (typeof window === "undefined") return;

  try {
    const etag = localStorage.getItem(ETAG_KEY);
    const headers = {};
    if (etag) headers["If-None-Match"] = etag;

    const res = await fetch(`${API_BASE}/api/content`, { headers });

    if (res.status === 304) {
      // Content has not changed
      return;
    }

    if (res.status === 200) {
      const json = await res.json();
      if (json.success && json.data) {
        const newEtag = res.headers.get("ETag");
        if (newEtag) localStorage.setItem(ETAG_KEY, newEtag);

        for (const [key, item] of Object.entries(json.data)) {
          if (item && item.data) {
            store[key] = normalizeSection(key, item.data);
          }
        }

        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(store));
        } catch {}

        notify();
      }
    }
  } catch (err) {
    // API is unreachable; silently preserve bundled/cached data
    console.debug("[Content] API unreachable, using cached/static data");
  }
}

/**
 * Fetch a single section from API
 */
async function fetchSingleSection(key) {
  try {
    const res = await fetch(`${API_BASE}/api/content/${key}`);
    if (res.status === 200) {
      const json = await res.json();
      if (json.success && json.data) {
        store[key] = normalizeSection(key, json.data);
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(store));
        } catch {}
        notify();
      }
    }
  } catch (err) {
    console.debug(`[Content] Failed to refresh section '${key}'`, err);
  }
}

// Server-Sent Events (SSE) Client
let sseInitialized = false;
let retryCount = 0;
let fallbackPollInterval = null;

function initSSE() {
  if (typeof window === "undefined" || sseInitialized) return;
  sseInitialized = true;

  // Initial background fetch
  fetchAllContent();

  function connect() {
    if (!window.EventSource) return;

    const evtSource = new EventSource(`${API_BASE}/api/content/stream`);

    evtSource.onopen = () => {
      retryCount = 0;
      if (fallbackPollInterval) {
        clearInterval(fallbackPollInterval);
        fallbackPollInterval = null;
      }
    };

    // Listen for live update events
    evtSource.addEventListener("content:updated", (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload?.key) {
          fetchSingleSection(payload.key);
        } else {
          fetchAllContent();
        }
      } catch {
        fetchAllContent();
      }
    });

    evtSource.onerror = () => {
      evtSource.close();

      // Exponential backoff reconnect
      const backoffDelay = Math.min(30000, 1000 * Math.pow(1.5, retryCount++));
      setTimeout(connect, backoffDelay);

      // Fallback polling while disconnected
      if (!fallbackPollInterval) {
        fallbackPollInterval = setInterval(fetchAllContent, 20000);
      }
    };
  }

  // Refetch when tab becomes visible or online
  window.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") fetchAllContent();
  });
  window.addEventListener("online", () => fetchAllContent());

  connect();
}


/**
 * React hook: useContent(sectionKey)
 * Returns reactive section data that updates when live changes arrive via SSE.
 */
export function useContent(sectionKey) {
  const [, setTick] = useState(0);

  useEffect(() => {
    initSSE();

    const listener = () => setTick((t) => t + 1);
    listeners.add(listener);
    return () => listeners.delete(listener);
  }, []);

  return store[sectionKey] || null;
}

/**
 * Plain synchronous getter: getContent(sectionKey)
 */
export function getContent(sectionKey) {
  return store[sectionKey] || null;
}

// Specialized Section Hooks mirroring existing data shapes
export function useProfile() {
  const hero = useContent("hero") || {};
  const about = useContent("about") || {};
  const contact = useContent("contact") || {};

  return {
    ...STATIC_PROFILE,
    ...hero,
    ...about,
    ...contact,
    idCard: {
      ...STATIC_PROFILE.idCard,
      idNo: STATIC_PROFILE.idNo,
      dept: STATIC_PROFILE.dept,
      validTill: STATIC_PROFILE.validTill,
      portraitBust: "/portrait-bust.webp",
      backPoints: [
        `• ${STATIC_PROFILE.role}`,
        "• MCA (CGPA: 7.21) & B.Sc. IT (CGPA: 8.51)",
        "• Engineered Multi-Tenant ATS matching 100+ resumes/day",
        "• Real-time architectures: Socket.io, JWT, Zustand, Redis patterns",
      ],
      certifiedText: "Certified MERN Stack Developer — Naresh i Tech",
      ...(about.idCard || {}),
    },
    focus: about.focus || STATIC_PROFILE.focus,
    undergrad:
      typeof about.undergrad === "string"
        ? about.undergrad
        : about.undergrad?.degree
        ? `${about.undergrad.degree} (${about.undergrad.cgpa ? `${about.undergrad.cgpa} CGPA` : about.undergrad.year})`
        : STATIC_PROFILE.undergrad || "B.Sc. IT (8.51 CGPA)",
    internship: about.internship || STATIC_PROFILE.internship,
    education:
      typeof about.education === "string"
        ? about.education
        : about.education?.degree
        ? `${about.education.degree}${about.education.year ? ` (${about.education.year})` : ""}`
        : STATIC_PROFILE.education || "MCA (2025)",
    ctaNextTeam: contact.ctaNextTeam || "Next — Your team?",
  };
}

export function useSettings() {
  const settings = useContent("settings");
  return (
    settings || {
      visibility: {
        about: true,
        skills: true,
        work: true,
        certifications: true,
        experience: true,
        contact: true,
      },
      features: {
        enableSound: true,
        showStatusBadge: true,
        showGhostWatermark: true,
        enableIdCardFlip: true,
      },
    }
  );
}

export function useNav() {
  const settings = useSettings();
  const visibility = settings?.visibility || {};
  const nav = useContent("nav") || STATIC_NAV;
  return nav.filter((item) => visibility[item.id] !== false);
}

export function useSkills() {
  const skills = useContent("skills");
  const SKILL_GROUPS = skills?.groups || STATIC_SKILL_GROUPS;
  const ALL_SKILLS = skills?.allSkills || STATIC_ALL_SKILLS;
  return {
    groups: SKILL_GROUPS,
    allSkills: ALL_SKILLS,
    SKILL_GROUPS,
    ALL_SKILLS,
  };
}

export function useProjects() {
  const projects = useContent("projects");
  if (Array.isArray(projects)) return projects;
  if (Array.isArray(projects?.projects)) return projects.projects;
  return STATIC_PROJECTS;
}

export function useCertifications() {
  const certs = useContent("certifications");
  if (Array.isArray(certs)) return certs;
  if (Array.isArray(certs?.certifications)) return certs.certifications;
  return STATIC_CERTIFICATIONS;
}

export function useExperience() {
  const exp = useContent("experience");
  if (Array.isArray(exp)) return exp;
  if (Array.isArray(exp?.timeline)) return exp.timeline;
  return STATIC_EXPERIENCE;
}

export function useEducation() {
  const edu = useContent("education");
  if (Array.isArray(edu)) return edu;
  if (Array.isArray(edu?.education)) return edu.education;
  return STATIC_EDUCATION;
}

export function useSeo() {
  const seo = useContent("seo");
  return (
    seo || {
      title: "Satyaranjan Moharana — Full Stack Developer (MERN Stack)",
      description:
        "Portfolio of Satyaranjan Moharana, MERN Stack Developer building multi-tenant recruitment platforms, real-time architectures, and AI integrations.",
      ogImage: "/og.jpg",
      themeColor: "#f4f2ee",
    }
  );
}

export function useResume() {
  const resume = useContent("resume");
  return (
    resume || {
      url: STATIC_PROFILE.resumePath || "/resume.pdf",
      downloadName: "Satyaranjan_Moharana_Resume.pdf",
      version: 1,
      updatedAt: null,
    }
  );
}

export function useHeroMedia() {
  const heroMedia = useContent("heroMedia");
  return (
    heroMedia || {
      mp4Url: "/hero/hero.mp4",
      webmUrl: "/hero/hero.webm",
      posterUrl: "/portrait-bust.webp",
      version: 1,
      bytes: 0,
      duration: 0,
      updatedAt: null,
    }
  );
}


