import { getOrSetCache } from "~/services/redisService";
import { searchPosts } from "~/services/meiliSearchService";
import { success, error } from "~/utils/responeHandler";
class SearchController {
  async suggest(req, res, next) {
    try {
      const keyword = req.query.q?.trim();
      if (!keyword || keyword.length === 0) {
        return error(res, 400, "Thiếu từ khóa tìm kiếm");
      }

      const cacheKey = `suggest:${keyword.toLowerCase()}`;
      const cached = await getOrSetCache(
        cacheKey,
        () => searchPosts(keyword),
        300
      );
      return success(res, { results: cached });
    } catch (error) {
      console.error("Search error:", error);
      error(res, 500, "Lỗi máy chủ, vui lòng thử lại sau");
    }
  }
}

export default new SearchController(); 