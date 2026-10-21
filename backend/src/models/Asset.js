import mongoose from "mongoose";

const assetSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      default: null,
    },
    type: {
      type: String,
      enum: ["image", "video", "document", "other"],
      default: "image",
    },
    name: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      default: 0,
    },
    usedIn: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

export const Asset = mongoose.model("Asset", assetSchema);
