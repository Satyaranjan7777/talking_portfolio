import path from "path";
import streamifier from "streamifier";
import cloudinary from "../config/cloudinary.js";
import { HeroMedia } from "../models/HeroMedia.js";
import { Content } from "../models/Content.js";
import { AuditLog } from "../models/AuditLog.js";
import { broadcastContentUpdated } from "./contentController.js";

const DEFAULT_KEEP_VERSIONS = parseInt(process.env.HERO_VIDEO_KEEP_VERSIONS || "5", 10);
const DEFAULT_MAX_MB = parseInt(process.env.HERO_VIDEO_MAX_MB || "40", 10);
const DEFAULT_MAX_SECONDS = parseInt(process.env.HERO_VIDEO_MAX_SECONDS || "20", 10);

const CLOUDINARY_PREFIX = "https://res.cloudinary.com/";

/**
 * Generate CDN delivery URLs for mp4, webm, and poster frame
 */
export function generateDeliveryUrls(publicId, customPosterUrl = null) {
  const cleanPublicId = publicId.replace(/\.[^/.]+$/, ""); // Strip file extension if present

  // 1. mp4 delivery URL
  const mp4Url = cloudinary.url(cleanPublicId, {
    resource_type: "video",
    format: "mp4",
    transformation: [{ fetch_format: "mp4", quality: "auto" }],
    secure: true,
  });

  // 2. webm delivery URL (Cloudinary auto-transcodes)
  const webmUrl = cloudinary.url(cleanPublicId, {
    resource_type: "video",
    format: "webm",
    transformation: [{ fetch_format: "webm", quality: "auto" }],
    secure: true,
  });

  // 3. poster delivery URL (either custom uploaded poster or first frame at 0.2s)
  const posterUrl = customPosterUrl || cloudinary.url(cleanPublicId, {
    resource_type: "video",
    format: "webp",
    transformation: [{ start_offset: "0.2", fetch_format: "webp", quality: "auto" }],
    secure: true,
  });

  return { mp4Url, webmUrl, posterUrl };
}

/**
 * Sync Content collection "heroMedia" key
 */
async function syncContentHeroMedia(liveMedia) {
  const mediaData = {
    mp4Url: liveMedia.mp4_url,
    webmUrl: liveMedia.webm_url,
    posterUrl: liveMedia.poster_url,
    version: liveMedia.version,
    bytes: liveMedia.bytes,
    duration: liveMedia.duration,
    updatedAt: liveMedia.updatedAt ? liveMedia.updatedAt.toISOString() : new Date().toISOString(),
  };

  // Enforce server-side rule: URLs must start with Cloudinary prefix
  if (
    !mediaData.mp4Url.startsWith(CLOUDINARY_PREFIX) ||
    !mediaData.webmUrl.startsWith(CLOUDINARY_PREFIX) ||
    !mediaData.posterUrl.startsWith(CLOUDINARY_PREFIX)
  ) {
    throw new Error("One or more delivery URLs do not start with https://res.cloudinary.com/");
  }

  await Content.findOneAndUpdate(
    { key: "heroMedia" },
    {
      $set: {
        published: mediaData,
        draft: mediaData,
        version: liveMedia.version,
      },
    },
    { upsert: true, returnDocument: "after" }
  );

  // Also sync hero.videoMp4 and hero.videoWebm in the "hero" section for complete continuity
  await Content.findOneAndUpdate(
    { key: "hero" },
    {
      $set: {
        "published.videoMp4": mediaData.mp4Url,
        "published.videoWebm": mediaData.webmUrl,
        "draft.videoMp4": mediaData.mp4Url,
        "draft.videoWebm": mediaData.webmUrl,
      },
    },
    { upsert: true }
  );

  return mediaData;
}

/**
 * Prune archived versions beyond HERO_VIDEO_KEEP_VERSIONS (default 5)
 */
async function pruneOldVersions() {
  try {
    const keepLimit = parseInt(process.env.HERO_VIDEO_KEEP_VERSIONS || "5", 10);
    const archivedVideos = await HeroMedia.find({ status: "archived" })
      .sort({ version: -1 })
      .lean();

    if (archivedVideos.length > keepLimit) {
      const toDelete = archivedVideos.slice(keepLimit);
      for (const item of toDelete) {
        try {
          if (item.video_public_id) {
            await cloudinary.uploader.destroy(item.video_public_id, {
              resource_type: "video",
            });
          }
          if (item.poster_public_id) {
            await cloudinary.uploader.destroy(item.poster_public_id, {
              resource_type: "image",
            });
          }
          await HeroMedia.findByIdAndDelete(item._id);
        } catch (cleanupErr) {
          console.error(`[HeroVideo] Failed to prune version ${item.version}:`, cleanupErr);
        }
      }
    }
  } catch (err) {
    console.error("[HeroVideo] Error in pruneOldVersions:", err);
  }
}

/**
 * GET /api/admin/hero-video
 * Returns live hero video, active draft (if any), and version history
 */
export async function getAdminHeroVideoOverview(req, res) {
  try {
    const [live, draft, history] = await Promise.all([
      HeroMedia.findOne({ status: "live" }).populate("uploadedBy", "email name").lean(),
      HeroMedia.findOne({ status: "draft" }).populate("uploadedBy", "email name").sort({ createdAt: -1 }).lean(),
      HeroMedia.find({ status: { $in: ["live", "archived"] } })
        .populate("uploadedBy", "email name")
        .sort({ version: -1 })
        .lean(),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        live: live || null,
        draft: draft || null,
        history: history || [],
        maxMb: parseInt(process.env.HERO_VIDEO_MAX_MB || "40", 10),
        maxSeconds: parseInt(process.env.HERO_VIDEO_MAX_SECONDS || "20", 10),
        keepVersions: DEFAULT_KEEP_VERSIONS,
      },
    });
  } catch (err) {
    console.error("[HeroVideo] getAdminHeroVideoOverview error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch hero video details",
      error: err.message,
    });
  }
}

/**
 * POST /api/admin/hero-video/sign
 * Returns signed params for direct browser-to-Cloudinary upload (avoids Render timeouts)
 */
export async function getSignedUploadParams(req, res) {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = "portfolio/hero";
    const filename = req.body.filename || "hero_video.mp4";
    const ext = path.extname(filename);
    const safeBase = path
      .basename(filename, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .toLowerCase();

    const public_id = `video_${Date.now()}_${safeBase}`;

    // Cloudinary signature parameters
    const paramsToSign = {
      folder,
      public_id,
      timestamp,
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET.trim()
    );

    return res.status(200).json({
      success: true,
      data: {
        signature,
        timestamp,
        folder,
        public_id,
        apiKey: process.env.CLOUDINARY_API_KEY.trim(),
        cloudName: process.env.CLOUDINARY_CLOUD_NAME.trim(),
        maxMb: parseInt(process.env.HERO_VIDEO_MAX_MB || "40", 10),
        maxSeconds: parseInt(process.env.HERO_VIDEO_MAX_SECONDS || "20", 10),
      },
    });
  } catch (err) {
    console.error("[HeroVideo] getSignedUploadParams error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to generate upload signature",
      error: err.message,
    });
  }
}

/**
 * POST /api/admin/hero-video/commit
 * Called by browser after direct Cloudinary upload succeeds.
 * Server verifies the asset via cloudinary.api.resource, validates duration and format, and creates draft.
 */
export async function commitHeroVideoDraft(req, res) {
  const { public_id, originalName } = req.body;

  if (!public_id) {
    return res.status(400).json({
      success: false,
      message: "Missing public_id from Cloudinary upload.",
    });
  }

  const maxMb = parseInt(process.env.HERO_VIDEO_MAX_MB || "40", 10);
  const maxSeconds = parseInt(process.env.HERO_VIDEO_MAX_SECONDS || "20", 10);

  let resource = null;
  try {
    // 1. Verify asset directly from Cloudinary Admin API
    resource = await cloudinary.api.resource(public_id, { resource_type: "video" });
  } catch (err) {
    console.error("[HeroVideo] Cloudinary asset verification failed:", err);
    return res.status(502).json({
      success: false,
      message: `Failed to verify asset on Cloudinary: ${err.message}`,
    });
  }

  if (!resource || !resource.secure_url) {
    return res.status(502).json({
      success: false,
      message: "Cloudinary did not return a valid secure_url.",
    });
  }

  // 2. Validate URL prefix strictly
  if (!resource.secure_url.startsWith(CLOUDINARY_PREFIX)) {
    return res.status(400).json({
      success: false,
      message: `Security violation: URL does not start with '${CLOUDINARY_PREFIX}'`,
    });
  }

  // 3. Validate file size
  if (resource.bytes > maxMb * 1024 * 1024) {
    try {
      await cloudinary.uploader.destroy(public_id, { resource_type: "video" });
    } catch {}
    return res.status(400).json({
      success: false,
      message: `Video size (${(resource.bytes / 1024 / 1024).toFixed(1)} MB) exceeds limit of ${maxMb} MB.`,
    });
  }

  // 4. Validate duration
  const duration = resource.duration || 0;
  if (duration > maxSeconds) {
    try {
      await cloudinary.uploader.destroy(public_id, { resource_type: "video" });
    } catch {}
    return res.status(400).json({
      success: false,
      message: `Video duration (${duration.toFixed(1)}s) exceeds maximum allowed duration of ${maxSeconds}s.`,
    });
  }

  // 5. Validate format
  const format = (resource.format || "").toLowerCase();
  if (format !== "mp4" && format !== "webm") {
    try {
      await cloudinary.uploader.destroy(public_id, { resource_type: "video" });
    } catch {}
    return res.status(400).json({
      success: false,
      message: `Invalid format '${format}'. Only MP4 and WebM videos are supported.`,
    });
  }

  try {
    // 6. Generate optimized delivery URLs
    const { mp4Url, webmUrl, posterUrl } = generateDeliveryUrls(public_id);

    // 7. Calculate next version
    const highestVersionDoc = await HeroMedia.findOne().sort({ version: -1 }).lean();
    const nextVersion = (highestVersionDoc?.version || 0) + 1;

    // 8. Clean up any previous draft
    const existingDraft = await HeroMedia.findOne({ status: "draft" });
    if (existingDraft) {
      try {
        await cloudinary.uploader.destroy(existingDraft.video_public_id, { resource_type: "video" });
        if (existingDraft.poster_public_id) {
          await cloudinary.uploader.destroy(existingDraft.poster_public_id, { resource_type: "image" });
        }
      } catch (e) {
        console.warn("[HeroVideo] Draft cleanup warning:", e.message);
      }
      await HeroMedia.findByIdAndDelete(existingDraft._id);
    }

    // 9. Save new draft in DB
    const newHeroMedia = await HeroMedia.create({
      video_url: resource.secure_url,
      mp4_url: mp4Url,
      webm_url: webmUrl,
      poster_url: posterUrl,
      video_public_id: resource.public_id,
      resource_type: "video",
      bytes: resource.bytes,
      duration: Math.round(duration * 10) / 10,
      format,
      originalName: originalName || resource.public_id,
      version: nextVersion,
      uploadedBy: req.admin?.adminId || null,
      uploadedAt: new Date(),
      status: "draft",
    });

    await AuditLog.create({
      action: "UPLOAD_HERO_VIDEO_DRAFT",
      section: "heroMedia",
      adminId: req.admin?.adminId || null,
      ip: req.ip,
      details: {
        heroMediaId: newHeroMedia._id,
        version: newHeroMedia.version,
        duration: newHeroMedia.duration,
        bytes: newHeroMedia.bytes,
        publicId: resource.public_id,
        secureUrl: resource.secure_url,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Hero video draft verified and committed successfully.",
      data: newHeroMedia,
    });
  } catch (err) {
    console.error("[HeroVideo] commitHeroVideoDraft DB error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to create hero video draft in database.",
      error: err.message,
    });
  }
}

/**
 * POST /api/admin/hero-video/upload
 * Fallback server-side stream upload (useful for test scripts & small files)
 */
export async function uploadHeroVideoDraft(req, res) {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No video file provided.",
    });
  }

  const { buffer, originalname, size, mimetype } = req.file;

  const ext = path.extname(originalname).toLowerCase();
  if (ext !== ".mp4" && ext !== ".webm") {
    return res.status(400).json({
      success: false,
      message: "Invalid file extension. Only .mp4 and .webm files are accepted.",
    });
  }

  const maxMb = parseInt(process.env.HERO_VIDEO_MAX_MB || "40", 10);
  if (size > maxMb * 1024 * 1024) {
    return res.status(400).json({
      success: false,
      message: `File exceeds maximum allowed size of ${maxMb} MB.`,
    });
  }

  const timestamp = Date.now();
  const safeOriginal = path.basename(originalname, ext).replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase();
  const publicId = `video_${timestamp}_${safeOriginal}`;

  let cloudinaryResult = null;

  try {
    cloudinaryResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "portfolio/hero",
          public_id: publicId,
          resource_type: "video",
          timeout: 120000,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      streamifier.createReadStream(buffer).pipe(uploadStream);
    });

    if (!cloudinaryResult || !cloudinaryResult.secure_url) {
      return res.status(502).json({
        success: false,
        message: "Cloudinary did not return a secure_url",
      });
    }

    // Call commit logic to verify duration and save draft
    return commitHeroVideoDraft(
      {
        body: {
          public_id: cloudinaryResult.public_id,
          originalName: originalname,
        },
        admin: req.admin,
        ip: req.ip,
      },
      res
    );
  } catch (err) {
    console.error("[HeroVideo] uploadHeroVideoDraft error:", err);
    return res.status(502).json({
      success: false,
      message: `Cloudinary upload failed: ${err.message}`,
      error: err.message,
    });
  }
}

/**
 * POST /api/admin/hero-video/poster
 * Uploads a custom poster image for the current draft or live hero video
 */
export async function uploadHeroPoster(req, res) {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No poster image provided.",
    });
  }

  const { buffer, originalname } = req.file;
  const ext = path.extname(originalname).toLowerCase();
  const allowed = [".jpg", ".jpeg", ".png", ".webp"];
  if (!allowed.includes(ext)) {
    return res.status(400).json({
      success: false,
      message: "Invalid image format. Supported formats: JPG, PNG, WebP.",
    });
  }

  const timestamp = Date.now();
  const publicId = `poster_${timestamp}`;

  try {
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "portfolio/hero",
          public_id: publicId,
          resource_type: "image",
          transformation: [{ quality: "auto", fetch_format: "auto" }],
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      streamifier.createReadStream(buffer).pipe(uploadStream);
    });

    if (!uploadResult || !uploadResult.secure_url) {
      return res.status(502).json({
        success: false,
        message: "Cloudinary failed to upload poster image.",
      });
    }

    // Update draft if one exists, otherwise clone current live into draft
    let draft = await HeroMedia.findOne({ status: "draft" });
    if (!draft) {
      const live = await HeroMedia.findOne({ status: "live" });
      if (live) {
        const highestVersionDoc = await HeroMedia.findOne().sort({ version: -1 }).lean();
        draft = await HeroMedia.create({
          video_url: live.video_url,
          mp4_url: live.mp4_url,
          webm_url: live.webm_url,
          poster_url: uploadResult.secure_url,
          video_public_id: live.video_public_id,
          poster_public_id: uploadResult.public_id,
          bytes: live.bytes,
          duration: live.duration,
          format: live.format,
          originalName: live.originalName,
          version: (highestVersionDoc?.version || 0) + 1,
          uploadedBy: req.admin?.adminId || null,
          status: "draft",
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "Please upload a video before setting a poster image.",
        });
      }
    } else {
      draft.poster_url = uploadResult.secure_url;
      draft.poster_public_id = uploadResult.public_id;
      await draft.save();
    }

    return res.status(200).json({
      success: true,
      message: "Poster image uploaded successfully.",
      data: draft,
    });
  } catch (err) {
    console.error("[HeroVideo] uploadHeroPoster error:", err);
    return res.status(502).json({
      success: false,
      message: "Failed to upload poster image to Cloudinary.",
      error: err.message,
    });
  }
}

/**
 * POST /api/admin/hero-video/:id/publish
 * Publishes draft as live, archives previous live, syncs Content, emits SSE broadcast
 */
export async function publishHeroVideo(req, res) {
  try {
    const { id } = req.params;
    const target = await HeroMedia.findById(id);

    if (!target) {
      return res.status(404).json({
        success: false,
        message: "Hero video document not found.",
      });
    }

    if (target.status === "live") {
      return res.status(400).json({
        success: false,
        message: "This video is already live.",
      });
    }

    // Archive current live video
    const currentLive = await HeroMedia.findOne({ status: "live" });
    if (currentLive) {
      currentLive.status = "archived";
      await currentLive.save();
    }

    // Set target to live
    target.status = "live";
    await target.save();

    // Synchronize to Content collection under key "heroMedia"
    const publishedContent = await syncContentHeroMedia(target);

    // Audit Log
    await AuditLog.create({
      action: "PUBLISH_HERO_VIDEO",
      section: "heroMedia",
      adminId: req.admin?.adminId || null,
      ip: req.ip,
      details: {
        heroMediaId: target._id,
        version: target.version,
        previousLiveVersion: currentLive?.version || null,
        mp4Url: target.mp4_url,
        webmUrl: target.webm_url,
        posterUrl: target.poster_url,
      },
    });

    // Prune old versions beyond limit
    await pruneOldVersions();

    // Broadcast SSE update event to all public clients
    broadcastContentUpdated("heroMedia", target.version);

    return res.status(200).json({
      success: true,
      message: `Hero video version ${target.version} is now published live!`,
      data: {
        live: target,
        publishedContent,
      },
    });
  } catch (err) {
    console.error("[HeroVideo] publishHeroVideo error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to publish hero video.",
      error: err.message,
    });
  }
}

/**
 * POST /api/admin/hero-video/:id/restore
 * Restores an archived version as live, archives current live version
 */
export async function restoreHeroVideoVersion(req, res) {
  try {
    const { id } = req.params;
    const target = await HeroMedia.findById(id);

    if (!target) {
      return res.status(404).json({
        success: false,
        message: "Version not found.",
      });
    }

    if (target.status === "live") {
      return res.status(400).json({
        success: false,
        message: "This version is already live.",
      });
    }

    const currentLive = await HeroMedia.findOne({ status: "live" });
    if (currentLive) {
      currentLive.status = "archived";
      await currentLive.save();
    }

    target.status = "live";
    await target.save();

    const publishedContent = await syncContentHeroMedia(target);

    await AuditLog.create({
      action: "RESTORE_HERO_VIDEO_VERSION",
      section: "heroMedia",
      adminId: req.admin?.adminId || null,
      ip: req.ip,
      details: {
        restoredId: target._id,
        version: target.version,
        previousLiveVersion: currentLive?.version || null,
      },
    });

    broadcastContentUpdated("heroMedia", target.version);

    return res.status(200).json({
      success: true,
      message: `Restored version ${target.version} as live.`,
      data: {
        live: target,
        publishedContent,
      },
    });
  } catch (err) {
    console.error("[HeroVideo] restoreHeroVideoVersion error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to restore hero video version.",
      error: err.message,
    });
  }
}

/**
 * DELETE /api/admin/hero-video/:id
 * Deletes an archived or draft version (never the live one)
 */
export async function deleteHeroVideoVersion(req, res) {
  try {
    const { id } = req.params;
    const target = await HeroMedia.findById(id);

    if (!target) {
      return res.status(404).json({
        success: false,
        message: "Hero video record not found.",
      });
    }

    if (target.status === "live") {
      return res.status(400).json({
        success: false,
        message: "Cannot delete the active live video. Make another version live first.",
      });
    }

    // Delete asset from Cloudinary
    if (target.video_public_id) {
      try {
        await cloudinary.uploader.destroy(target.video_public_id, {
          resource_type: "video",
        });
      } catch (cErr) {
        console.warn(`[HeroVideo] Cloudinary destroy warning for ${target.video_public_id}:`, cErr.message);
      }
    }
    if (target.poster_public_id) {
      try {
        await cloudinary.uploader.destroy(target.poster_public_id, {
          resource_type: "image",
        });
      } catch (cErr) {
        console.warn(`[HeroVideo] Cloudinary destroy warning for ${target.poster_public_id}:`, cErr.message);
      }
    }

    await HeroMedia.findByIdAndDelete(id);

    await AuditLog.create({
      action: "DELETE_HERO_VIDEO_VERSION",
      section: "heroMedia",
      adminId: req.admin?.adminId || null,
      ip: req.ip,
      details: {
        heroMediaId: id,
        version: target.version,
        status: target.status,
        publicId: target.video_public_id,
      },
    });

    return res.status(200).json({
      success: true,
      message: `Hero video version ${target.version} (${target.status}) was deleted.`,
    });
  } catch (err) {
    console.error("[HeroVideo] deleteHeroVideoVersion error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to delete hero video version.",
      error: err.message,
    });
  }
}
