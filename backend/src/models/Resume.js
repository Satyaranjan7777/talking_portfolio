import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    secure_url: {
      type: String,
      required: true,
      trim: true,
    },
    public_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    resource_type: {
      type: String,
      default: "raw",
    },
    bytes: {
      type: Number,
      required: true,
    },
    format: {
      type: String,
      default: "pdf",
    },
    originalName: {
      type: String,
      required: true,
    },
    downloadName: {
      type: String,
      default: "Satyaranjan_Moharana_Resume.pdf",
    },
    version: {
      type: Number,
      required: true,
      default: 1,
      index: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: false,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["draft", "live", "archived"],
      default: "draft",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Resume = mongoose.model("Resume", resumeSchema);
