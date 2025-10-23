import { getOrSetCache } from "~/services/redisService";
import { searchPosts } from "~/services/meiliSearchService";
import { success, error } from "~/utils/responeHandler";

class SearchController {
  async suggest(req, res, next) {
    try {
      const keyword = req.query.q?.trim();
      if (!keyword || keyword.length === 0) {
        return error(res, "Thiếu từ khóa tìm kiếm", 400);
      }

      const { page = 1, limit = 12, sortBy, type, province, minPrice, maxPrice, minArea, maxArea, amenities } = req.query;

      const options = {
        page: Number(page) || 1,
        limit: Number(limit) || 12,
        sortBy: typeof sortBy === 'string' ? sortBy : 'relevance',
        filters: {
          type: typeof type === 'string' ? type : undefined,
          province: typeof province === 'string' ? province : undefined,
          minPrice: typeof minPrice === 'string' ? minPrice : undefined,
          maxPrice: typeof maxPrice === 'string' ? maxPrice : undefined,
          minArea: typeof minArea === 'string' ? minArea : undefined,
          maxArea: typeof maxArea === 'string' ? maxArea : undefined,
          amenities: typeof amenities === 'string' && amenities.length > 0 ? amenities.split(',') : undefined,
        },
      };

      const cacheKey = `suggest:${keyword.toLowerCase()}:${JSON.stringify(options)}`;
      const cached = await getOrSetCache(
        cacheKey,
        () => searchPosts(keyword, options),
        300
      );

      // Shape response for frontend expectations
      return success(res, {
        posts: cached.hits,
        totalHits: cached.totalHits,
        totalPages: cached.totalPages,
        page: cached.page,
        limit: cached.limit,
      });
    } catch (err) {
      console.error("Search error:", err);
      error(res, "Lỗi máy chủ, vui lòng thử lại sau", 500);
    }
  }
}

export default new SearchController();
