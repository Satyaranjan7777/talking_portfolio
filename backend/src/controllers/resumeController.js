import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import streamifier from "streamifier";
import cloudinary from "../config/cloudinary.js";
import { Resume } from "../models/Resume.js";
import { Content } from "../models/Content.js";
import { AuditLog } from "../models/AuditLog.js";
import { broadcastContentUpdated } from "./contentController.js";
import { resumeSettingsSchema } from "../schemas/contentSchemas.js";

const DEFAULT_DOWNLOAD_NAME = "Satyaranjan_Moharana_Resume.pdf";
const DEFAULT_KEEP_VERSIONS = parseInt(process.env.RESUME_KEEP_VERSIONS || "10", 10);

/**
 * Validate that buffer starts with '%PDF' magic bytes
 */
function isValidPdfMagicBytes(buffer) {
  if (!buffer || buffer.length < 4) return false;
  return (
    buffer[0] === 0x25 && // %
    buffer[1] === 0x50 && // P
    buffer[2] === 0x44 && // D
    buffer[3] === 0x46    // F
  );
}

/**
 * Prune archived resume versions beyond RESUME_KEEP_VERSIONS
 */
async function pruneOldVersions() {
  try {
    const keepLimit = parseInt(process.env.RESUME_KEEP_VERSIONS || "10", 10);
    const archivedResumes = await Resume.find({ status: "archived" })
      .sort({ version: -1 })
      .lean();

    // If total archived count exceeds keepLimit, delete the oldest
    if (archivedResumes.length > keepLimit) {
      const toDelete = archivedResumes.slice(keepLimit);
      for (const item of toDelete) {
        try {
          if (item.public_id) {
            await cloudinary.uploader.destroy(item.public_id, {
              resource_type: item.resource_type || "raw",
            });
          }
          await Resume.findByIdAndDelete(item._id);
        } catch (cleanupErr) {
          console.error(`[Resume] Failed to prune version ${item.version}:`, cleanupErr);
        }
      }
    }
  } catch (err) {
    console.error("[Resume] Error in pruneOldVersions:", err);
  }
}

/**
 * Synchronize Content collection's "resume" key with the given live Resume doc
 */
async function syncContentResume(liveResume) {
  const resumeData = {
    url: liveResume.secure_url,
    downloadName: liveResume.downloadName || DEFAULT_DOWNLOAD_NAME,
    version: liveResume.version,
    updatedAt: liveResume.updatedAt ? liveResume.updatedAt.toISOString() : new Date().toISOString(),
  };

  await Content.findOneAndUpdate(
    { key: "resume" },
    {
      $set: {
        published: resumeData,
        draft: resumeData,
        version: liveResume.version,
      },
    },
    { upsert: true, returnDocument: "after" }
  );

  return resumeData;

}

/**
 * GET /api/admin/resume
 * Returns current live resume, current draft (if any), and full version history
 */
export async function getAdminResumeOverview(req, res) {
  try {
    const [live, draft, history] = await Promise.all([
      Resume.findOne({ status: "live" }).populate("uploadedBy", "email name").lean(),
      Resume.findOne({ status: "draft" }).populate("uploadedBy", "email name").sort({ createdAt: -1 }).lean(),
      Resume.find({ status: { $in: ["live", "archived"] } })
        .populate("uploadedBy", "email name")
        .sort({ version: -1 })
        .lean(),
    ]);

    // Read downloadName setting from Content or fallback
    const contentDoc = await Content.findOne({ key: "resume" }).lean();
    const downloadName = live?.downloadName || contentDoc?.published?.downloadName || DEFAULT_DOWNLOAD_NAME;

    return res.status(200).json({
      success: true,
      data: {
        live: live || null,
        draft: draft || null,
        history: history || [],
        downloadName,
        maxSizeMb: parseInt(process.env.RESUME_MAX_MB || "5", 10),
        keepVersions: DEFAULT_KEEP_VERSIONS,
      },
    });
  } catch (err) {
    console.error("[Resume] getAdminResumeOverview error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch resume details",
      error: err.message,
    });
  }
}

/**
 * POST /api/admin/resume/upload
 * Validates multipart PDF, uploads to Cloudinary via upload_stream, creates a draft Resume document
 */
export async function uploadResumeDraft(req, res) {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No file provided. Please upload a PDF file.",
    });
  }

  const { buffer, originalname, size, mimetype } = req.file;

  // 1. Validate file extension
  const ext = path.extname(originalname).toLowerCase();
  if (ext !== ".pdf") {
    return res.status(400).json({
      success: false,
      message: "Invalid file extension. Only .pdf files are accepted.",
    });
  }

  // 2. Validate MIME type
  if (mimetype !== "application/pdf") {
    return res.status(400).json({
      success: false,
      message: "Invalid MIME type. File must be application/pdf.",
    });
  }

  // 3. Validate magic bytes (%PDF)
  if (!isValidPdfMagicBytes(buffer)) {
    return res.status(400).json({
      success: false,
      message: "File failed binary inspection. Valid PDF magic bytes (%PDF-) were not detected.",
    });
  }

  // 4. Validate file size (configurable via env)
  const maxMb = parseInt(process.env.RESUME_MAX_MB || "5", 10);
  if (size > maxMb * 1024 * 1024) {
    return res.status(400).json({
      success: false,
      message: `File exceeds maximum allowed size of ${maxMb} MB.`,
    });
  }

  // 5. Generate unique public_id
  const timestamp = Date.now();
  const safeOriginal = path.basename(originalname, ext).replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase();
  const publicId = `portfolio/resume/resume_${timestamp}_${safeOriginal}`;

  let cloudinaryResult = null;

  try {
    // 6. Upload directly from buffer to Cloudinary using upload_stream (strictly Cloudinary, no local fallback)
    try {
      cloudinaryResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "portfolio/resume",
            public_id: `resume_${timestamp}_${safeOriginal}`,
            resource_type: "raw", // Exact bit-for-bit PDF delivery
            format: "pdf",
            timeout: 60000,
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );

        streamifier.createReadStream(buffer).pipe(uploadStream);
      });
    } catch (cErr) {
      console.error("[Resume] Cloudinary upload_stream failed:", cErr);
      return res.status(502).json({
        success: false,
        message: `Cloudinary upload failed: ${cErr.message || "403 Forbidden - missing permissions"}`,
        error: cErr.error || cErr.message,
      });
    }

    if (!cloudinaryResult || !cloudinaryResult.secure_url) {
      return res.status(502).json({
        success: false,
        message: "Cloudinary did not return a secure_url",
      });
    }

    if (!cloudinaryResult.secure_url.startsWith("https://res.cloudinary.com/")) {
      return res.status(502).json({
        success: false,
        message: "Security violation: Cloudinary returned non-Cloudinary URL",
      });
    }

    // 7. Calculate next version number
    const highestVersionDoc = await Resume.findOne().sort({ version: -1 }).lean();
    const nextVersion = (highestVersionDoc?.version || 0) + 1;

    // Check existing live downloadName
    const liveDoc = await Resume.findOne({ status: "live" }).lean();
    const activeDownloadName = liveDoc?.downloadName || DEFAULT_DOWNLOAD_NAME;

    // Remove any previous draft so there's only 1 active draft at a time
    const existingDraft = await Resume.findOne({ status: "draft" });
    if (existingDraft) {
      if (existingDraft.public_id) {
        try {
          await cloudinary.uploader.destroy(existingDraft.public_id, {
            resource_type: existingDraft.resource_type || "raw",
          });
        } catch (e) {
          console.warn("[Resume] Cleanup previous draft Cloudinary asset warning:", e.message);
        }
      }
      await Resume.findByIdAndDelete(existingDraft._id);
    }

    // 8. Create new draft in DB
    const newResume = await Resume.create({
      secure_url: cloudinaryResult.secure_url,
      public_id: cloudinaryResult.public_id,
      resource_type: cloudinaryResult.resource_type || "raw",
      bytes: size,
      format: "pdf",
      originalName: originalname,
      downloadName: activeDownloadName,
      version: nextVersion,
      uploadedBy: req.admin?.adminId || null,

      uploadedAt: new Date(),
      status: "draft",
    });

    await AuditLog.create({
      action: "UPLOAD_RESUME_DRAFT",
      section: "resume",
      adminId: req.admin?.adminId || null,
      ip: req.ip,
      details: {
        resumeId: newResume._id,
        version: newResume.version,
        originalName: originalname,
        bytes: size,
        publicId: cloudinaryResult.public_id,
        secureUrl: cloudinaryResult.secure_url,
      },
    });


    return res.status(201).json({

      success: true,
      message: "Resume draft uploaded successfully.",
      data: newResume,
    });
  } catch (err) {
    console.error("[Resume] Upload error:", err);
    // If Cloudinary succeeded but DB failed, clean up Cloudinary asset
    if (cloudinaryResult && cloudinaryResult.public_id) {
      try {
        await cloudinary.uploader.destroy(cloudinaryResult.public_id, { resource_type: "raw" });
      } catch (cleanErr) {
        console.error("[Resume] Failed to cleanup orphaned Cloudinary asset:", cleanErr);
      }
    }

    return res.status(500).json({
      success: false,
      message: "Failed to upload resume to Cloudinary.",
      error: err.message,
    });
  }
}

/**
 * POST /api/admin/resume/:id/publish
 * Publishes draft as live, archives previous live, syncs Content, emits SSE broadcast
 */
export async function publishResume(req, res) {
  try {
    const { id } = req.params;
    const targetResume = await Resume.findById(id);

    if (!targetResume) {
      return res.status(404).json({
        success: false,
        message: "Resume document not found.",
      });
    }

    if (targetResume.status === "live") {
      return res.status(400).json({
        success: false,
        message: "This resume is already live.",
      });
    }

    // Archive current live resume
    const currentLive = await Resume.findOne({ status: "live" });
    if (currentLive) {
      currentLive.status = "archived";
      await currentLive.save();
    }

    // Set target resume to live
    targetResume.status = "live";
    await targetResume.save();

    // Synchronize to Content collection
    const publishedContent = await syncContentResume(targetResume);

    // Audit Log
    await AuditLog.create({
      action: "PUBLISH_RESUME",
      section: "resume",
      adminId: req.admin?.adminId || null,
      ip: req.ip,
      details: {
        resumeId: targetResume._id,
        version: targetResume.version,
        previousLiveVersion: currentLive?.version || null,
        url: targetResume.secure_url,
      },
    });

    // Prune versions beyond limit
    await pruneOldVersions();

    // Broadcast SSE update event to all public clients
    broadcastContentUpdated("resume", targetResume.version);

    return res.status(200).json({
      success: true,
      message: `Resume version ${targetResume.version} is now published live!`,
      data: {
        live: targetResume,
        publishedContent,
      },
    });
  } catch (err) {
    console.error("[Resume] publishResume error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to publish resume.",
      error: err.message,
    });
  }
}

/**
 * POST /api/admin/resume/:id/restore
 * Restores an archived version as live, archives the current live version
 */
export async function restoreResumeVersion(req, res) {
  try {
    const { id } = req.params;
    const targetResume = await Resume.findById(id);

    if (!targetResume) {
      return res.status(404).json({
        success: false,
        message: "Version not found.",
      });
    }

    if (targetResume.status === "live") {
      return res.status(400).json({
        success: false,
        message: "This resume is already the live version.",
      });
    }

    const currentLive = await Resume.findOne({ status: "live" });
    if (currentLive) {
      currentLive.status = "archived";
      await currentLive.save();
    }

    targetResume.status = "live";
    await targetResume.save();

    const publishedContent = await syncContentResume(targetResume);

    await AuditLog.create({
      action: "RESTORE_RESUME_VERSION",
      section: "resume",
      adminId: req.admin?.adminId || null,
      ip: req.ip,
      details: {
        restoredResumeId: targetResume._id,
        version: targetResume.version,
        previousLiveVersion: currentLive?.version || null,
      },
    });

    broadcastContentUpdated("resume", targetResume.version);

    return res.status(200).json({
      success: true,
      message: `Restored version ${targetResume.version} as live.`,
      data: {
        live: targetResume,
        publishedContent,
      },
    });
  } catch (err) {
    console.error("[Resume] restoreResumeVersion error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to restore resume version.",
      error: err.message,
    });
  }
}

/**
 * PATCH /api/admin/resume/settings
 * Updates download file name setting
 */
export async function updateResumeSettings(req, res) {
  try {
    const parsed = resumeSettingsSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parsed.error.issues,
      });
    }

    const { downloadName } = parsed.data;

    // Update live Resume doc if exists
    const liveResume = await Resume.findOne({ status: "live" });
    if (liveResume) {
      liveResume.downloadName = downloadName;
      await liveResume.save();
      await syncContentResume(liveResume);
      broadcastContentUpdated("resume", liveResume.version);
    } else {
      // If no live resume yet, update Content entry directly
      await Content.findOneAndUpdate(
        { key: "resume" },
        {
          $set: {
            "published.downloadName": downloadName,
            "draft.downloadName": downloadName,
          },
        },
        { upsert: true }
      );
      broadcastContentUpdated("resume", 1);
    }

    await AuditLog.create({
      action: "UPDATE_RESUME_SETTINGS",
      section: "resume",
      adminId: req.admin?.adminId || null,
      ip: req.ip,
      details: { downloadName },
    });

    return res.status(200).json({
      success: true,
      message: "Resume download filename updated successfully.",
      data: { downloadName },
    });
  } catch (err) {
    console.error("[Resume] updateResumeSettings error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update resume settings.",
      error: err.message,
    });
  }
}

/**
 * DELETE /api/admin/resume/:id
 * Deletes an archived or draft resume version (never the live one)
 */
export async function deleteResumeVersion(req, res) {
  try {
    const { id } = req.params;
    const targetResume = await Resume.findById(id);

    if (!targetResume) {
      return res.status(404).json({
        success: false,
        message: "Resume record not found.",
      });
    }

    if (targetResume.status === "live") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete the currently live resume. Make another version live first.",
      });
    }

    // Delete asset from Cloudinary
    if (targetResume.public_id) {
      try {
        await cloudinary.uploader.destroy(targetResume.public_id, {
          resource_type: targetResume.resource_type || "raw",
        });
      } catch (cErr) {
        console.warn(`[Resume] Cloudinary destroy warning for ${targetResume.public_id}:`, cErr.message);
      }
    }

    await Resume.findByIdAndDelete(id);

    await AuditLog.create({
      action: "DELETE_RESUME_VERSION",
      section: "resume",
      adminId: req.admin?.adminId || null,
      ip: req.ip,
      details: {
        resumeId: id,
        version: targetResume.version,
        status: targetResume.status,
        publicId: targetResume.public_id,
      },
    });

    return res.status(200).json({
      success: true,
      message: `Resume version ${targetResume.version} (${targetResume.status}) was deleted.`,
    });
  } catch (err) {
    console.error("[Resume] deleteResumeVersion error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to delete resume version.",
      error: err.message,
    });
  }
}

/**
 * GET /api/resume
 * Public 302 redirect to current live resume URL
 */
export async function getPublicResumeRedirect(req, res) {
  try {
    const liveResume = await Resume.findOne({ status: "live" }).lean();
    if (liveResume && liveResume.secure_url) {
      return res.redirect(302, liveResume.secure_url);
    }

    // Fallback to Content collection
    const content = await Content.findOne({ key: "resume" }).lean();
    if (content?.published?.url) {
      return res.redirect(302, content.published.url);
    }

    // Ultimate fallback to bundled static file
    return res.redirect(302, "/resume.pdf");
  } catch (err) {
    console.error("[Resume] getPublicResumeRedirect error:", err);
    return res.redirect(302, "/resume.pdf");
  }
}
