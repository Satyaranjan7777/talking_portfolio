import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      // e.g. "LOGIN", "SAVE_DRAFT", "PUBLISH", "DISCARD", "RESTORE_REVISION", "UPLOAD_ASSET", "DELETE_ASSET"
    },
    section: {
      type: String,
      default: "general",
    },
    adminId: {
      type: String,
      default: null,
    },
    ip: {
      type: String,
      default: null,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    at: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: { createdAt: "at", updatedAt: false } }
);

export const AuditLog = mongoose.model("AuditLog", auditLogSchema);
