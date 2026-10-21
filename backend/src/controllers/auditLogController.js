import { AuditLog } from "../models/AuditLog.js";

function escapeRegex(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * GET /api/admin/audit-logs
 * Paginated and filtered list of security and content audit events.
 */
export async function getAuditLogs(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 30, 100);
    const skip = (page - 1) * limit;

    const { action, section, search } = req.query;
    const filter = {};

    if (action && action !== "all") {
      filter.action = action;
    }

    if (section && section !== "all") {
      filter.section = section;
    }

    if (search && typeof search === "string") {
      const sanitized = escapeRegex(search.trim());
      filter.$or = [
        { action: { $regex: sanitized, $options: "i" } },
        { section: { $regex: sanitized, $options: "i" } },
        { ip: { $regex: sanitized, $options: "i" } },
      ];
    }

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .sort({ at: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AuditLog.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/audit-logs/stats
 * Summary statistics of recent audit events.
 */
export async function getAuditStats(req, res, next) {
  try {
    const totalLogs = await AuditLog.countDocuments();
    const loginCount = await AuditLog.countDocuments({
      action: { $in: ["LOGIN_SUCCESS", "LOGIN_SUCCESS_2FA"] },
    });
    const publishCount = await AuditLog.countDocuments({ action: "PUBLISH" });
    const draftCount = await AuditLog.countDocuments({ action: "SAVE_DRAFT" });

    return res.status(200).json({
      success: true,
      data: {
        totalLogs,
        loginCount,
        publishCount,
        draftCount,
      },
    });
  } catch (error) {
    next(error);
  }
}
