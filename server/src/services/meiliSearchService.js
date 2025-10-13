import removeAccents from "remove-accents";
import dotenv from "dotenv";
import { meiliClient } from "~/config/meilisearch.config.mjs";
import fs from "fs";
import path from "path";
dotenv.config();

const indexName = process.env.MEILISEARCH_INDEX || "posts";
export const index = meiliClient.index(indexName);

/**
 * ✅ Khởi tạo cấu hình chỉ chạy 1 lần khi start app
 */
export async function initSearchConfig() {
  try {
    const synonymsPath = path.join(
      __dirname,
      "../config/meilisearch.synonyms.json"
    );
    const synonyms = JSON.parse(fs.readFileSync(synonymsPath, "utf-8"));
    console.log("Synonyms loaded:", synonyms);
    await index.updateSettings({
      typoTolerance: { enabled: true },
      searchableAttributes: ["title", "description", "location"],
      filterableAttributes: ["price", "location", "type", "area"],
      sortableAttributes: ["price", "area"],
      stopWords: ["và", "có", "ở", "tại", "phòng"],
    });

    await index.updateSynonyms(synonyms);

    console.log("✅ Meilisearch index configured successfully with synonyms!");
  } catch (err) {
    console.error("⚠️ Meilisearch config failed:", err.message);
  }
}
/**
 * 🔍 Hàm tìm kiếm chính
 * @param {string} keyword - Từ khóa người dùng nhập
 * @param {object} options - Bộ lọc & sắp xếp tuỳ chọn
 */
export async function searchPosts(keyword, options = {}) {
  if (!keyword || keyword.trim().length === 0) {
    return { hits: [], query: keyword };
  }

  const normalized = removeAccents(keyword.trim().toLowerCase());

  const params = {
    limit: options.limit || 10,
    attributesToRetrieve: ["id", "title", "price", "location"],
    attributesToHighlight: ["title"],
    sort: options.sort || ["price:asc"],
    filter: options.filter || [],
  };

  let result = await index.search(normalized, params);

  // 🧠 Nếu không có kết quả → thử tìm lại bằng keyword gốc
  if (result.hits.length === 0 && normalized !== keyword) {
    result = await index.search(keyword, params);
    if (result.hits.length > 0) {
      return {
        hits: result.hits,
        suggestion: keyword,
      };
    }
  }

  // 🔦 Trả kết quả highlight + gợi ý nếu có
  return {
    hits: result.hits.map((item) => ({
      ...item,
      highlight: item._formatted?.title || item.title,
    })),
    suggestion: result.estimatedTotalHits === 0 ? null : null,
  };
}
