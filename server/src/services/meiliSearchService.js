import removeAccents from "remove-accents";
import dotenv from "dotenv";
import { meiliClient } from "../config/meilisearch.config.mjs";
import Post from "../models/postSchema.js";
import Room from "../models/roomSchema.js";
import fs from "fs";
import path from "path";
dotenv.config();

const indexName = process.env.MEILISEARCH_INDEX || "posts";
const index = meiliClient.index(indexName);

/**
 * Khởi tạo cấu hình chỉ chạy 1 lần khi start app
 */
export async function initSearchConfig() {
  try {
    // Cấu hình cơ bản (không cần synonyms file)
    await index.updateSettings({
      typoTolerance: { enabled: true },
      searchableAttributes: [
        "title", 
        "description", 
        "location.city", 
        "location.district",
        "location.address"  // Thêm address để search theo địa chỉ đầy đủ
      ],
      filterableAttributes: ["price", "area", "type", "location.city", "location.district"],
      sortableAttributes: ["price", "area", "createdAt"],
      stopWords: ["và", "có", "ở", "tại"],
    });

    console.log("✅ Meilisearch index configured successfully!");
  } catch (err) {
    console.error("❌ Meilisearch config failed:", err.message);
  }
}

/**
 * 🔍 Hàm tìm kiếm chính
 * @param {string} keyword - Từ khóa người dùng nhập
 * @param {object} options - Bộ lọc & sắp xếp tùy chọn
 */
export async function searchPosts(keyword, options = {}) {
  // Options: { page, limit, sortBy, filters }
  const {
    page = 1,
    limit = 12,
    sortBy = "relevance",
    filters = {},
  } = options;

  if (!keyword || keyword.trim().length === 0) {
    return { hits: [], totalHits: 0, totalPages: 0, page, limit };
  }

  // Thêm district vào keyword nếu có để search theo contains
  let searchKeyword = keyword.trim();
  if (filters.district) {
    searchKeyword = `${searchKeyword} ${filters.district}`;
  }
  if (filters.province) {
    searchKeyword = `${searchKeyword} ${filters.province}`;
  }
  
  const normalized = removeAccents(searchKeyword.toLowerCase());

  // Build Meilisearch filter expressions
  const filterExpressions = [];
  if (filters.type) filterExpressions.push(`type = "${filters.type}"`);
  // Bỏ filter exact match cho province và district vì đã thêm vào keyword
  // if (filters.province) filterExpressions.push(`location.city = "${filters.province}"`);
  // if (filters.district) filterExpressions.push(`location.district = "${filters.district}"`);
  if (filters.minPrice) filterExpressions.push(`price >= ${Number(filters.minPrice)}`);
  if (filters.maxPrice) filterExpressions.push(`price <= ${Number(filters.maxPrice)}`);
  if (filters.minArea) filterExpressions.push(`area >= ${Number(filters.minArea)}`);
  if (filters.maxArea) filterExpressions.push(`area <= ${Number(filters.maxArea)}`);
  if (Array.isArray(filters.amenities) && filters.amenities.length > 0) {
    // amenities contains all of selected
    filterExpressions.push(filters.amenities.map((a) => `amenities = "${a}"`));
  }

  // Sort mapping
  let sortParam = undefined;
  if (sortBy === "price_asc") sortParam = ["price:asc"];
  else if (sortBy === "price_desc") sortParam = ["price:desc"];
  else if (sortBy === "area_asc") sortParam = ["area:asc"];
  else if (sortBy === "area_desc") sortParam = ["area:desc"];
  // relevance: default undefined to keep ranking

  const params = {
    limit,
    offset: (page - 1) * limit,
    attributesToRetrieve: [
      "_id",
      "id",
      "title",
      "description",
      "price",
      "area",
      "location",
      "images",
      "amenities",
      "createdAt",
      "updatedAt",
    ],
    attributesToHighlight: ["title", "description"],
    sort: sortParam,
    filter: filterExpressions.length > 0 ? filterExpressions : undefined,
  };

  let result = await index.search(normalized, params);

  // 🔄 Nếu không có kết quả → thử tìm lại bằng keyword gốc
  if (result.hits.length === 0 && normalized !== searchKeyword) {
    result = await index.search(searchKeyword, params);
  }

  const totalHits = result.estimatedTotalHits || 0;
  const totalPages = limit > 0 ? Math.max(1, Math.ceil(totalHits / limit)) : 1;

  return {
    hits: result.hits.map((item) => ({
      ...item,
      highlight: item._formatted?.title || item.title,
      _id: item._id || item.id, // normalize id field
    })),
    totalHits,
    totalPages,
    page,
    limit,
  };
}

/**
 * 📤 Đồng bộ dữ liệu từ MongoDB vào MeiliSearch
 */
export async function syncDataToMeiliSearch() {
  try {
    console.log("🔄 Starting MeiliSearch data sync...");
    
    // Lấy tất cả posts đang active
    const posts = await Post.find({ status: "active" })
      .populate({
        path: "roomId",
        select: "title description price area city district address images amenities propertyType"
      })
      .limit(10000); // Limit để tránh lấy quá nhiều

    if (posts.length === 0) {
      console.log("⚠️  No active posts found to sync");
      return;
    }

    // Transform dữ liệu cho MeiliSearch
    const documents = posts
      .filter(p => p.roomId) // Chỉ lấy posts có roomId hợp lệ
      .map(post => ({
        id: post._id.toString(),
        _id: post._id.toString(),
        title: post.roomId.title,
        description: post.roomId.description,
        price: post.roomId.price || 0,
        area: post.roomId.area || 0,
        type: post.roomId.propertyType || "unknown",
        location: {
          city: post.roomId.city || "",
          district: post.roomId.district || "",
          address: post.roomId.address || ""
        },
        amenities: post.roomId.amenities || [],
        images: (post.roomId.images || []).map(img => {
          // Handle both string URLs and objects with url property
          if (typeof img === 'string') return img;
          if (img?.url) return img.url;
          return null;
        }).filter(url => url), // Remove nulls
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      }));

    console.log(`📊 Syncing ${documents.length} posts to MeiliSearch...`);
    
    // Debug: In ra vài documents đầu tiên để kiểm tra images
    console.log("📸 Sample documents images field:");
    documents.slice(0, 3).forEach((doc, idx) => {
      console.log(`  Document ${idx + 1}: title="${doc.title}", images=${JSON.stringify(doc.images).substring(0, 100)}`);
    });
    
    // Xóa index cũ (optional, để cập nhật hoàn toàn)
    // await meiliClient.deleteIndex(indexName);
    
    // Thêm documents vào MeiliSearch
    await index.addDocuments(documents, { primaryKey: "id" });
    
    console.log(`✅ Successfully synced ${documents.length} posts to MeiliSearch!`);
  } catch (err) {
    console.error("❌ MeiliSearch sync failed:", err.message);
    throw err;
  }
}

/**
 * 📝 Thêm/cập nhật một post vào MeiliSearch (khi tạo post mới)
 */
export async function addOrUpdatePostInMeiliSearch(post) {
  try {
    if (!post.roomId) {
      console.warn("⚠️  Cannot index post without roomId");
      return;
    }

    const document = {
      id: post._id.toString(),
      _id: post._id.toString(),
      title: post.roomId.title,
      description: post.roomId.description,
      price: post.roomId.price || 0,
      area: post.roomId.area || 0,
      type: post.roomId.propertyType || "unknown",
      location: {
        city: post.roomId.city || "",
        district: post.roomId.district || "",
        address: post.roomId.address || ""
      },
      amenities: post.roomId.amenities || [],
      images: (post.roomId.images || []).map(img => {
        // Handle both string URLs and objects with url property
        if (typeof img === 'string') return img;
        if (img?.url) return img.url;
        return null;
      }).filter(url => url), // Remove nulls
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };

    await index.addDocuments([document], { primaryKey: "id" });
    console.log(`✅ Post ${post._id} added to MeiliSearch`);
  } catch (err) {
    console.error("❌ Failed to add post to MeiliSearch:", err.message);
  }
}

/**
 * 🗑️ Xóa một post khỏi MeiliSearch
 */
export async function deletePostFromMeiliSearch(postId) {
  try {
    await index.deleteDocument(postId.toString());
    console.log(`✅ Post ${postId} deleted from MeiliSearch`);
  } catch (err) {
    console.error("❌ Failed to delete post from MeiliSearch:", err.message);
  }
}
