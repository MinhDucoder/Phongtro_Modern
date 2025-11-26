import { getOrSetCache } from "~/services/redisService";
import { searchPosts, getSearchSuggestions, findSimilarRooms } from "~/services/meiliSearchService";
import postService from "~/services/postService";
import Post from "~/models/postSchema.js";
import { extractDistrict } from "~/utils/addressParser.js";
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
        async () => {
          try {
            return await searchPosts(keyword, options);
          } catch (meiliErr) {
            console.error('MeiliSearch suggest error, falling back to DB:', meiliErr?.message || meiliErr);

            // Build DB filters similar to options.filters
            const dbFilters = { status: 'active' };
            if (options.filters.type) dbFilters['roomId.propertyType'] = options.filters.type;
            if (options.filters.province) dbFilters['roomId.city'] = options.filters.province;
            if (options.filters.minPrice || options.filters.maxPrice) {
              const min = Number(options.filters.minPrice) || 0;
              const max = Number(options.filters.maxPrice) || Number.MAX_SAFE_INTEGER;
              dbFilters['roomId.price'] = { $gte: min, $lte: max };
            }

            // Use title regex for keyword
            dbFilters['roomId.title'] = new RegExp(keyword, 'i');

            const dbResult = await postService.listPosts({ page: Number(page) || 1, limit: Number(limit) || 12, filters: dbFilters, sort: { createdAt: -1 } });

            // Normalize to Meili-like shape
            return {
              hits: dbResult.items,
              totalHits: dbResult.total,
              totalPages: Math.max(1, Math.ceil(dbResult.total / (Number(limit) || 12))),
              page: Number(page) || 1,
              limit: Number(limit) || 12,
            };
          }
        },
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

  /**
   * 🔍 Autocomplete - Gợi ý tìm kiếm nhanh
   * GET /api/v1/search/autocomplete?q=keyword&limit=5
   */
  async autocomplete(req, res, next) {
    try {
      const keyword = req.query.q?.trim();
      const limit = parseInt(req.query.limit) || 5;

      if (!keyword || keyword.length === 0) {
        return success(res, { suggestions: [] });
      }

      // Cache autocomplete results
      const cacheKey = `autocomplete:${keyword.toLowerCase()}:${limit}`;
      let suggestions = await getOrSetCache(
        cacheKey,
        async () => {
          // Thử MeiliSearch autocomplete trước
          const meiliSuggestions = await getSearchSuggestions(keyword, limit);
          if (meiliSuggestions && meiliSuggestions.length > 0) {
            return meiliSuggestions;
          }
          
          // Fallback: Dùng search API thông thường
          try {
            const searchOptions = {
              page: 1,
              limit: limit,
              sortBy: 'relevance',
              filters: {},
            };
            
            const searchResults = await searchPosts(keyword, searchOptions);
            if (searchResults.hits && searchResults.hits.length > 0) {
              return searchResults.hits.map((hit) => ({
                _id: hit._id || hit.id,
                title: hit.title,
                location: hit.location,
                price: hit.price,
                area: hit.area,
                images: hit.images || [],
                highlight: hit.highlight || hit.title,
              }));
            }
          } catch (searchErr) {
            console.log('Search API fallback error:', searchErr.message);
          }
          
          // Fallback cuối: Dùng postService
          try {
            const dbFilters = { status: 'active' };
            const dbResult = await postService.listPosts({ 
              page: 1, 
              limit: limit, 
              filters: dbFilters, 
              sort: { createdAt: -1 } 
            });
            
            if (dbResult.items && dbResult.items.length > 0) {
              return dbResult.items
                .filter((item) => item.roomId)
                .map((item) => ({
                  _id: item._id,
                  title: item.roomId.title,
                  location: {
                    city: item.roomId.city,
                    address: item.roomId.address
                  },
                  price: item.roomId.price,
                  area: item.roomId.area,
                  images: item.roomId.images || [],
                  highlight: item.roomId.title,
                }))
                .slice(0, limit);
            }
          } catch (dbErr) {
            console.log('DB fallback error:', dbErr.message);
          }
          
          return [];
        },
        60 // Cache 1 phút cho autocomplete
      );

      return success(res, { suggestions: suggestions || [] });
    } catch (err) {
      console.error("Autocomplete error:", err);
      // Trả về empty array thay vì error để không break UI
      return success(res, { suggestions: [] });
    }
  }

  /**
   * 🏠 Tìm phòng trọ tương tự
   * GET /api/v1/search/similar?postId=xxx&limit=6
   */
  async similar(req, res, next) {
    try {
      const postId = req.query.postId || req.params.postId;
      const limit = parseInt(req.query.limit) || 6;

      if (!postId) {
        return error(res, "Thiếu postId", 400);
      }

      // Lấy thông tin post từ database
      const post = await Post.findById(postId)
        .populate({
          path: "roomId",
          select: "title description price area city address propertyType amenities images"
        })
        .select("roomId");

      if (!post || !post.roomId) {
        return error(res, "Không tìm thấy phòng trọ", 404);
      }

      // Cache similar rooms
      const cacheKey = `similar:${postId}:${limit}`;
      const similarRooms = await getOrSetCache(
        cacheKey,
        async () => {
          const roomData = {
            title: post.roomId.title,
            location: {
              city: post.roomId.city || "",
              district: post.roomId.address ? extractDistrict(post.roomId.address) : "",
              address: post.roomId.address || ""
            },
            price: post.roomId.price || 0,
            area: post.roomId.area || 0,
            type: post.roomId.propertyType || "phong_tro",
          };

          return await findSimilarRooms(postId, roomData, limit);
        },
        300 // Cache 5 phút
      );

      return success(res, {
        similarRooms,
        total: similarRooms.length
      });
    } catch (err) {
      console.error("Similar rooms error:", err);
      error(res, "Lỗi máy chủ, vui lòng thử lại sau", 500);
    }
  }
}

export default new SearchController();
