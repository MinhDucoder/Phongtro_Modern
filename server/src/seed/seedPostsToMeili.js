import { meiliClient } from "~/config/meilisearch.config.mjs";
import PostModel from "~/models/postSchema.js";
import dotenv from "dotenv";
dotenv.config();

const index = meiliClient.index(process.env.MEILISEARCH_INDEX || "posts");

export async function syncPostsToMeili() {
  console.time("Sync Meilisearch");

  // 1️⃣ Lấy dữ liệu cần thiết: populate room để lấy title, price, area, city
  const posts = await PostModel.find({ status: "active" }) // chỉ lấy bài đang hoạt động
    .populate({
      path: "roomId",
      select: "title price area city",
    })
    .lean();

  // 2️⃣ Format dữ liệu cho MeiliSearch
  const formatted = posts
    .filter((p) => p.roomId)
    .map((p) => ({
      id: p._id.toString(),
      title: p.roomId.title || "",
      price: p.roomId.price || 0,
      area: p.roomId.area || 0,
      city: p.roomId.city || "",
      status: p.status,
      favouriteLevel: p.favouriteLevel,
      createdAt: p.createdAt,
    }));

  // 3️⃣ Gửi lên MeiliSearch
  const task = await index.addDocuments(formatted);
  console.log("🚀 Sync task start queued:", task);

  // 4️⃣ Cấu hình chỉ 1 lần (khi tạo index)
  await index.updateSettings({
    searchableAttributes: ["title"],
    filterableAttributes: ["city", "price", "area", "status", "favouriteLevel"],
    sortableAttributes: ["price", "area", "createdAt"],
  });

  console.timeEnd("Sync Meilisearch");
  return task;
}
