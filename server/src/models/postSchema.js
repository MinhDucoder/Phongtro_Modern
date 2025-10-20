import mongoose from "mongoose";
import { meiliSyncPlugin } from "~/plugin/meiliSync.plugin";

const postSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    landlord: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    options: [
      {
        type: String,
        enum: ["aircon", "washing_machine", "balcony", "window", "fridge", "kitchen"],
      },
    ],
    favouriteLevel: {
      type: String,
      enum: ["free", "silver", "gold", "platinum"],
      default: "free",
    },
    status: {
      type: String,
      enum: ["pending", "active", "expired"],
      default: "pending",
    },
    expiredAt: {
      type: Date,
      required: true,
    }
  },
  { timestamps: true }
);

// Hàm format dữ liệu post → document Meili
async function formatPostToMeili(doc) {
  const populated = await doc.populate("roomId", "title price area city");
  return {
    id: doc._id.toString(),
    title: populated.roomId?.title || "",
    price: populated.roomId?.price || 0,
    area: populated.roomId?.area || 0,
    city: populated.roomId?.city || "",
    status: doc.status,
    favouriteLevel: doc.favouriteLevel,
    createdAt: doc.createdAt,
  };
}

// Gắn plugin
postSchema.plugin(meiliSyncPlugin, {
  indexName: process.env.MEILISEARCH_INDEX || "posts",
  formatFn: formatPostToMeili,
});

postSchema.pre("save", function (next) {
  if (!this.isModified("favouriteLevel") && this.expiredAt) return next();

  const now = new Date();
  const durationMap = {
    free: 7,
    silver: 15,
    gold: 30,
    platinum: 60,
  };

  const days = durationMap[this.favouriteLevel] || 7;
  this.expiredAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  next();
});


export default mongoose.model("Post", postSchema);
