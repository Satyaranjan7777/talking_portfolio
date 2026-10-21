import mongoose from "mongoose";

const revisionSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      index: true,
    },
    snapshot: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    version: {
      type: Number,
      required: true,
    },
    note: {
      type: String,
      default: "Published update",
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Method to keep only the latest 30 revisions per section key
revisionSchema.statics.pruneOldRevisions = async function (key, maxKeep = 30) {
  const count = await this.countDocuments({ key });
  if (count > maxKeep) {
    const toDelete = await this.find({ key })
      .sort({ createdAt: 1 })
      .limit(count - maxKeep)
      .select("_id");
    const ids = toDelete.map((doc) => doc._id);
    await this.deleteMany({ _id: { $in: ids } });
  }
};

export const Revision = mongoose.model("Revision", revisionSchema);
