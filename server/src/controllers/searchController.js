import { index } from "~/services/meiliSearchService";
import { success, error } from "~/utils/responeHandler";
import { searchPosts } from "~/services/meiliSearchService";
import Post from "~/models/postSchema";
import { meiliClient } from "~/config/meilisearch.config.mjs";

class SearchController {
  // 🔹 API GỢI Ý (autocomplete)
  async suggest(req, res, next) {
    try {
      const keyword = req.query.q?.trim();
      if (!keyword) return error(res, 400, "Thiếu từ khóa tìm kiếm");

      const { hits } = await index.search(keyword, {
        limit: 5,
        attributesToRetrieve: ["title", "price", "area", "city"],
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

  // 🔹 API Recommendation Post
  async recommendPosts(req, res, next) {
    try {
      const postId = req.params.postId;

      const post = await Post.findById(postId).populate(
        "roomId",
        "title price area city"
      );

      if (!post) return error(res, 404, "Post not found");

      const queryText = `${post.roomId.title} ${
        post.roomId.city
      } ${post.options.join(" ")}`;

      const result = await meiliClient
        .index(process.env.MEILISEARCH_INDEX || "posts")
        .search(queryText, {
          filter: `status = active AND id != ${postId}`,
          limit: 8,
        });
      return success(res, { results: result });
    } catch (error) {
      error(res, 500, "Lỗi máy chủ khi tìm kiếm bài viết gợi ý");
    }
  }
}
export default new SearchController();
