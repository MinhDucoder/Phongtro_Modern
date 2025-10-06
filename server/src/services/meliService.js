import { meilisearch } from "meilisearch";
import { meiliClient } from "~/config/meilisearch.config.mjs";
import dotenv from "dotenv";

dotenv.config();

const index = meiliClient.index(process.env.meilisearch_INDEX || "posts");

/**
 * Gợi ý phòng trọ theo từ khóa
 * @param {string} keyword - Từ khóa người dùng nhập vào
 */

export async function searchPosts(keyword) {
  if (!keyword || keyword.trim().length === 0) {
    return [];
  }
  const result = await index.search(keyword, {
    limit: 10,
    attributesToHighlight: ["title", "description"],
  });
  return result.hits;
}

/**
 * Hàm helper để thêm dữ liệu demo vào Meilisearch
 */

export async function seedSamplePosts() {
  const sampleData = [
    { id: 1, title: "Phòng trọ Tân Mai", price: 2000000 },
    { id: 2, title: "Phòng trọ Tôn Đức Thắng", price: 2500000 },
    { id: 3, title: "Phòng trọ Thanh Xuân", price: 1800000 },
    { id: 4, title: "Phòng trọ Đống Đa có điều hòa", price: 3000000 },
    { id: 5, title: "Phòng trọ Cầu Giấy gần đại học", price: 2800000 },
  ];

  await index.addDocuments(sampleData);
  console.log("✅ Seeded sample rooms into Meilisearch");
}
