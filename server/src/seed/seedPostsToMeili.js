import { meiliClient } from "~/config/meilisearch.config.mjs";
import { PostModel } from "~/models/postSchema.js"; 
import dotenv from "dotenv";   
dotenv.config();

const index = meiliClient.index(process.env.MEILISEARCH_INDEX || "posts");

/**
 * Đồng bộ toàn bộ dữ liệu từ DB vào Meilisearch
 */
export async function syncPostsToMeili() {
  console.time("Sync Meilisearch");

  // 1️⃣ Lấy tất cả bài đăng trong DB
  const posts = await PostModel.find(
    {}
  ).lean();

  // 2️⃣ Chuyển _id thành id (Meilisearch yêu cầu trường id là duy nhất)
  const formatted = posts.map((p) => ({
    id: p._id.toString(),
    title: p.title,
    price: p.price,
    location: p.location,
    area: p.area,
    description: p.description,
  }));

  // 3️⃣ Đẩy dữ liệu lên Meilisearch
  const task = await index.addDocuments(formatted);
  console.log("🚀 Sync task queued:", task);

  console.timeEnd("Sync Meilisearch");
  return task;
}
