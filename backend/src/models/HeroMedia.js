import mongoose from "mongoose";

const heroMediaSchema = new mongoose.Schema(
  {
    video_url: {
      type: String,
      required: true,
      trim: true,
    },
    mp4_url: {
      type: String,
      required: true,
      trim: true,
    },
    webm_url: {
      type: String,
      required: true,
      trim: true,
    },
    poster_url: {
      type: String,
      required: true,
      trim: true,
    },
    video_public_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    poster_public_id: {
      type: String,
      default: null,
    },
    resource_type: {
      type: String,
      default: "video",
    },
    bytes: {
      type: Number,
      required: true,
    },
    duration: {
      type: Number,
      default: 0,
    },
    format: {
      type: String,
      default: "mp4",
    },
    originalName: {
      type: String,
      required: true,
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

export const HeroMedia = mongoose.model("HeroMedia", heroMediaSchema);
