import path from "path";
import streamifier from "streamifier";
import cloudinary from "../config/cloudinary.js";
import { Content } from "../models/Content.js";

import { Revision } from "../models/Revision.js";
import { AuditLog } from "../models/AuditLog.js";
import { Asset } from "../models/Asset.js";
import { validateSection } from "../schemas/contentSchemas.js";
import { broadcastContentUpdated } from "./contentController.js";
import { io } from "../index.js";

/**
 * GET /api/admin/content
 * List all content sections with draft, published, version and edit status.
 */
export async function getAdminContentList(req, res, next) {
  try {
    const docs = await Content.find({}).sort({ key: 1 }).lean();
    return res.status(200).json({
      success: true,
      data: docs,
      count: docs.length,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/content/:key
 * Get single section details (both draft and published).
 */
export async function getAdminSectionContent(req, res, next) {
  try {
    const { key } = req.params;
    let doc = await Content.findOne({ key });

    if (!doc) {
      return res.status(404).json({
        success: false,
        error: `Section '${key}' not found`,
      });
    }

    return res.status(200).json({
      success: true,
      data: doc,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/admin/content/:key
 * Save draft for a section with Zod schema validation.
 */
export async function updateDraftSection(req, res, next) {
  try {
    const { key } = req.params;
    const incomingData = req.body.draft !== undefined ? req.body.draft : req.body;

    // Validate using Zod schema
    const validation = validateSection(key, incomingData);
    if (!validation.success) {
      const errorMessages = validation.error?.issues?.map(
        (issue) => `${issue.path.join(".") || "root"}: ${issue.message}`
      ) || ["Validation failed"];

      return res.status(400).json({
        success: false,
        error: "Validation failed for section draft",
        details: errorMessages,
      });
    }

    let doc = await Content.findOne({ key });
    if (!doc) {
      doc = new Content({
        key,
        draft: validation.data,
        published: validation.data,
        status: "published",
        version: 1,
      });
    } else {
      doc.draft = validation.data;
      doc.status = "changed";
      doc.updatedBy = req.admin?.email || "admin";
    }

    await doc.save();

    // Audit log
    await AuditLog.create({
      action: "SAVE_DRAFT",
      section: key,
      adminId: req.admin?._id,
      ip: req.ip,
      details: {
        fieldsChanged: Object.keys(incomingData || {}),
      },
    });

    if (io) {
      io.emit("content:draft_updated", { key, status: doc.status });
    }

    return res.status(200).json({
      success: true,
      message: `Draft for '${key}' saved successfully`,
      data: doc,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/admin/content/:key/publish
 * Promote draft to published, record revision snapshot, and broadcast SSE update.
 */
export async function publishSection(req, res, next) {
  try {
    const { key } = req.params;
    const { note } = req.body;

    let doc = await Content.findOne({ key });
    if (!doc) {
      return res.status(404).json({
        success: false,
        error: `Section '${key}' not found`,
      });
    }

    // Validate draft before publishing
    const validation = validateSection(key, doc.draft);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: "Cannot publish: draft has schema validation errors",
        details: validation.error?.issues,
      });
    }

    const nextVersion = (doc.version || 1) + 1;

    // 1. Create Revision snapshot
    await Revision.create({
      key,
      snapshot: doc.draft,
      version: nextVersion,
      note: note || `Published by ${req.admin?.email || "admin"}`,
    });

    // 2. Prune old revisions (keep max 30)
    await Revision.pruneOldRevisions(key, 30);

    // 3. Promote draft to published
    doc.published = doc.draft;
    doc.status = "published";
    doc.version = nextVersion;
    doc.updatedBy = req.admin?.email || "admin";
    await doc.save();

    // 4. Audit Log
    await AuditLog.create({
      action: "PUBLISH",
      section: key,
      adminId: req.admin?._id,
      ip: req.ip,
      details: {
        version: nextVersion,
        note,
      },
    });

    // 5. Broadcast to public SSE listeners (Zero-delay live update on visitor screens!)
    broadcastContentUpdated(key, nextVersion);

    // 6. Broadcast to Socket.io admin listeners
    if (io) {
      io.emit("content:published", {
        key,
        version: nextVersion,
        data: doc.published,
      });
    }

    return res.status(200).json({
      success: true,
      message: `Section '${key}' published successfully to live site`,
      data: doc,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/admin/content/:key/discard
 * Discard draft and revert back to current published state.
 */
export async function discardDraft(req, res, next) {
  try {
    const { key } = req.params;
    let doc = await Content.findOne({ key });

    if (!doc) {
      return res.status(404).json({
        success: false,
        error: `Section '${key}' not found`,
      });
    }

    doc.draft = doc.published;
    doc.status = "published";
    await doc.save();

    await AuditLog.create({
      action: "DISCARD_DRAFT",
      section: key,
      adminId: req.admin?._id,
      ip: req.ip,
    });

    if (io) {
      io.emit("content:draft_discarded", { key });
    }

    return res.status(200).json({
      success: true,
      message: `Draft for '${key}' discarded, reverted to published version`,
      data: doc,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/content/:key/revisions
 * List revision history for a section.
 */
export async function getSectionRevisions(req, res, next) {
  try {
    const { key } = req.params;
    const revisions = await Revision.find({ key })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    return res.status(200).json({
      success: true,
      data: revisions,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/admin/content/:key/restore
 * Restore a revision snapshot into draft.
 */
export async function restoreSectionRevision(req, res, next) {
  try {
    const { key } = req.params;
    const { revisionId } = req.body;

    const revision = await Revision.findById(revisionId);
    if (!revision || revision.key !== key) {
      return res.status(404).json({
        success: false,
        error: "Revision not found for this section",
      });
    }

    let doc = await Content.findOne({ key });
    if (!doc) {
      return res.status(404).json({
        success: false,
        error: `Section '${key}' not found`,
      });
    }

    doc.draft = revision.snapshot;
    doc.status = "changed";
    doc.updatedBy = req.admin?.email || "admin";
    await doc.save();

    await AuditLog.create({
      action: "RESTORE_REVISION",
      section: key,
      adminId: req.admin?._id,
      ip: req.ip,
      details: {
        revisionId,
        restoredVersion: revision.version,
      },
    });

    return res.status(200).json({
      success: true,
      message: `Restored version ${revision.version} into draft for '${key}'`,
      data: doc,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/admin/upload
 * Media/File upload handler: uploads directly to Cloudinary using upload_stream.
 * Strictly Cloudinary-only: no local disk storage, no /uploads folder.
 */
export async function handleFileUpload(req, res, next) {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({
        success: false,
        error: "No file provided",
      });
    }

    const { originalname, size, mimetype, buffer } = req.file;
    const rawSection = req.body.section || "general";
    const section = String(rawSection).replace(/[^a-zA-Z0-9_-]/g, "").toLowerCase() || "general";

    // 1. Determine resource type
    const isVideo = mimetype.startsWith("video/");
    const isPdf = mimetype === "application/pdf" || originalname.toLowerCase().endsWith(".pdf");
    const resourceType = isVideo ? "video" : isPdf ? "raw" : "auto";

    // 2. Upload to Cloudinary (Strict requirement - no local fallback)
    const timestamp = Date.now();
    const safeName = path.basename(originalname, path.extname(originalname)).replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase();

    let uploadRes;
    try {
      uploadRes = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `portfolio/${section}`,
            public_id: `${safeName}_${timestamp}`,
            resource_type: resourceType,
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
      console.error("[Upload] Cloudinary upload failed:", cErr);
      return res.status(502).json({
        success: false,
        error: `Cloudinary upload failed: ${cErr.message || "403 Forbidden - missing permissions"}`,
        details: cErr.error || cErr.message,
      });
    }

    if (!uploadRes || !uploadRes.secure_url) {
      return res.status(502).json({
        success: false,
        error: "Cloudinary did not return a secure_url",
      });
    }

    if (!uploadRes.secure_url.startsWith("https://res.cloudinary.com/")) {
      return res.status(502).json({
        success: false,
        error: "Security violation: Upload did not yield a valid Cloudinary URL",
      });
    }

    const fileUrl = uploadRes.secure_url;
    const cloudinaryPublicId = uploadRes.public_id;
    const fileType = isVideo ? "video" : isPdf ? "document" : "image";

    const asset = await Asset.create({
      url: fileUrl,
      publicId: cloudinaryPublicId,
      type: fileType,
      name: originalname,
      size,
      usedIn: [section],
    });

    await AuditLog.create({
      action: "UPLOAD_ASSET",
      section,
      adminId: req.admin?._id,
      ip: req.ip,
      details: {
        assetId: asset._id,
        originalName: originalname,
        size,
        fileUrl,
        cloudinaryPublicId,
      },
    });

    // If uploading specifically for resume, update Content resume section and broadcast
    if (isPdf && (section === "hero" || section === "resume")) {
      const resumeUpdate = {
        url: fileUrl,
        downloadName: originalname || "Satyaranjan_Moharana_Resume.pdf",
        updatedAt: new Date().toISOString(),
      };
      await Content.findOneAndUpdate(
        { key: "resume" },
        {
          $set: {
            published: resumeUpdate,
            draft: resumeUpdate,
          },
          $inc: { version: 1 },
        },
        { upsert: true, returnDocument: "after" }
      );
      broadcastContentUpdated("resume");
      if (io) io.emit("content:updated", { key: "resume" });
    }

    return res.status(201).json({
      success: true,
      url: fileUrl,
      asset,
    });
  } catch (error) {
    next(error);
  }
}


