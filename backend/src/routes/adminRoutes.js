import { Router } from "express";
import multer from "multer";
import path from "path";
import { requireAuth } from "../middleware/authMiddleware.js";
import { uploadLimiter, auditSearchLimiter } from "../middleware/rateLimiter.js";
import {
  getAdminContentList,
  getAdminSectionContent,
  updateDraftSection,
  publishSection,
  discardDraft,
  getSectionRevisions,
  restoreSectionRevision,
  handleFileUpload,
} from "../controllers/adminContentController.js";
import { getAuditLogs, getAuditStats } from "../controllers/auditLogController.js";
import {
  getAdminResumeOverview,
  uploadResumeDraft,
  publishResume,
  restoreResumeVersion,
  updateResumeSettings,
  deleteResumeVersion,
} from "../controllers/resumeController.js";
import {
  getAdminHeroVideoOverview,
  getSignedUploadParams,
  commitHeroVideoDraft,
  uploadHeroVideoDraft,
  uploadHeroPoster,
  publishHeroVideo,
  restoreHeroVideoVersion,
  deleteHeroVideoVersion,
} from "../controllers/heroVideoController.js";

// Memory storage multer: NO local disk storage anywhere
const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: (parseInt(process.env.RESUME_MAX_MB || "5", 10)) * 1024 * 1024,
  },
});

const videoMemoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: (parseInt(process.env.HERO_VIDEO_MAX_MB || "40", 10)) * 1024 * 1024,
  },
});

const posterMemoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

const extensionMimeMap = {
  ".jpg": ["image/jpeg"],
  ".jpeg": ["image/jpeg"],
  ".png": ["image/png"],
  ".webp": ["image/webp"],
  ".gif": ["image/gif"],
  ".mp4": ["video/mp4"],
  ".webm": ["video/webm"],
  ".pdf": ["application/pdf", "application/x-pdf"],
};

const generalMemoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const validMimes = extensionMimeMap[ext];

    if (validMimes && validMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} with extension (${ext}) is not supported.`));
    }
  },
});

const router = Router();

// All admin routes require authenticated session
router.use(requireAuth);

// Resume management (Admin -> Cloudinary -> Realtime Sync)
router.get("/resume", getAdminResumeOverview);
router.post("/resume/upload", uploadLimiter, memoryUpload.single("file"), uploadResumeDraft);
router.post("/resume/:id/publish", publishResume);
router.post("/resume/:id/restore", restoreResumeVersion);
router.patch("/resume/settings", updateResumeSettings);
router.delete("/resume/:id", deleteResumeVersion);

// Hero Video management (Admin -> Cloudinary -> Realtime Sync)
router.get("/hero-video", getAdminHeroVideoOverview);
router.post("/hero-video/sign", getSignedUploadParams);
router.post("/hero-video/commit", commitHeroVideoDraft);
router.post("/hero-video/upload", uploadLimiter, videoMemoryUpload.single("file"), uploadHeroVideoDraft);
router.post("/hero-video/poster", uploadLimiter, posterMemoryUpload.single("file"), uploadHeroPoster);
router.post("/hero-video/:id/publish", publishHeroVideo);
router.post("/hero-video/:id/restore", restoreHeroVideoVersion);
router.delete("/hero-video/:id", deleteHeroVideoVersion);

// Content management
router.get("/content", getAdminContentList);
router.get("/content/:key", getAdminSectionContent);
router.put("/content/:key", updateDraftSection);
router.post("/content/:key/publish", publishSection);
router.post("/content/:key/discard", discardDraft);
router.get("/content/:key/revisions", getSectionRevisions);
router.post("/content/:key/restore", restoreSectionRevision);

// Audit logs & compliance (search query rate-limited)
router.get("/audit-logs", auditSearchLimiter, getAuditLogs);
router.get("/audit-logs/stats", getAuditStats);

// Asset upload (Cloudinary stream, rate limited before memory buffering)
router.post("/upload", uploadLimiter, generalMemoryUpload.single("file"), handleFileUpload);

export default router;
