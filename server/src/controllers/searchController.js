import { index } from "~/services/meiliSearchService";
import { success, error } from "~/utils/responeHandler";
import { searchPosts } from "~/services/meiliSearchService";

class SearchController {
  // 🔹 API GỢI Ý (autocomplete)
  async suggest(req, res, next) {
    try {
      const keyword = req.query.q?.trim();
      if (!keyword) return error(res, 400, "Thiếu từ khóa tìm kiếm");

      const { hits } = await index.search(keyword, {
        limit: 5,
        attributesToRetrieve: ["title"],
      });
      const suggestions = [...new Set(hits.map((h) => h.title))];

      return success(res, { suggestions });
    } catch (err) {
      console.error("❌ Suggest error:", err);
      return error(res, 500, "Lỗi máy chủ khi gợi ý tìm kiếm");
    }
  }

  // 🔹 API TÌM KIẾM CHÍNH (search)
  async search(req, res, next) {
    try {
      const keyword = req.query.q?.trim();
      if (!keyword) return error(res, 400, "Thiếu từ khóa tìm kiếm");

      const result = await searchPosts(keyword);

      return success(res, { results: result });
    } catch (err) {
      console.error("❌ Search error:", err);
      return error(res, 500, "Lỗi máy chủ khi tìm kiếm");
    }
  }
}

export default new SearchController();
