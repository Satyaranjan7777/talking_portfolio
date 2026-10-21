import mongoose from "mongoose";

const contentSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
      // e.g., "hero", "about", "skills", "projects", "certifications", "experience", "education", "contact", "seo", "settings"
    },
    draft: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    published: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    status: {
      type: String,
      enum: ["published", "draft", "changed"],
      default: "published",
    },
    version: {
      type: Number,
      default: 1,
    },
    updatedBy: {
      type: String,
      default: "system",
    },
  },
  { timestamps: true }
);

export const Content = mongoose.model("Content", contentSchema);
