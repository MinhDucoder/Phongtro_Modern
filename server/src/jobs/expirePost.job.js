import cron from "node-cron";
import Post from "../models/postSchema.js";

import { MeiliSearch } from "meilisearch";
import { meiliClient } from "~/config/meilisearch.config.mjs";

async function handleExpirePosts() {
  const now = new Date();
  try {
    //loc cac bai viet het han
    const expiredPosts = await Post.find({
      expiredAt: { $lte: now },
      status: { $ne: "active" },
    });
    if (expiredPosts.length === 0) return;

    console.log(`[CRON] Found ${expiredPosts.length} expired posts`);

    //cap nhat trang thai bai viet
    const ids = expiredPosts.map((p) => p._id);
    await Post.updateMany(
      { _id: { $in: ids } },
      { $set: { status: "expired" } }
    );

    //Dong bo len Meilisearch
    if (meiliClient) {
      const index = meiliClient.index(process.env.MEILISEARCH_INDEX || "posts");
      const docs = expiredPosts.map((p) => ({
        id: p._id.toString(),
        status: "expired",
      }));
      await index.updateDocuments(docs);
      console.log(`[CRON] Synced expired posts to MeiliSearch`);
    }
  } catch (error) {
    console.error("[CRON] Error expiring posts:", error);
  }
}

cron.schedule("*/1 * * * * ", async () => {
    console.log("[CRON] Running expire posts job...");
    await handleExpirePosts();
})

export default handleExpirePosts;