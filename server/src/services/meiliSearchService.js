import removeAccents from "remove-accents";
import dotenv from "dotenv";
import { meiliClient } from "../config/meilisearch.config.mjs";
import Post from "../models/postSchema.js";
import Room from "../models/roomSchema.js";
import fs from "fs";
import path from "path";
import { extractProvince, extractDistrict } from "../utils/addressParser.js";
dotenv.config();

const indexName = process.env.MEILISEARCH_INDEX || "posts";
const index = meiliClient.index(indexName);

/**
 * Khởi tạo cấu hình chỉ chạy 1 lần khi start app
 */
export async function initSearchConfig() {
  try {
    // Cấu hình nâng cao cho search tốt hơn
    await index.updateSettings({
      typoTolerance: { 
        enabled: true,
        minWordSizeForTypos: {
          oneTypo: 4,
          twoTypos: 8
        }
      },
      // Ranking attributes: ưu tiên title > address > description
      searchableAttributes: [
        "title",           // Ưu tiên cao nhất
        "location.address", // Địa chỉ đầy đủ
        "location.district", // Quận/huyện
        "location.city",    // Tỉnh/thành phố
        "description"       // Mô tả
      ],
      // Ranking rules: ưu tiên kết quả khớp chính xác hơn
      rankingRules: [
        "words",           // Ưu tiên số từ khớp
        "typo",            // Ưu tiên ít lỗi chính tả
        "proximity",       // Ưu tiên từ khóa gần nhau
        "attribute",       // Ưu tiên theo thứ tự searchableAttributes
        "sort",            // Ưu tiên theo sort
        "exactness"        // Ưu tiên khớp chính xác
      ],
      filterableAttributes: ["price", "area", "type", "location.city", "location.district", "location.address"],
      sortableAttributes: ["price", "area", "createdAt"],
      stopWords: ["và", "có", "ở", "tại", "phòng", "trọ", "nhà", "cho", "thuê"],
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
  
  // 🔍 SMART FILTER: Filter theo province - kiểm tra cả city và address
  // MeiliSearch filter: dùng array để OR
  if (filters.province) {
    // Thêm vào keyword để search tốt hơn, filter sẽ được xử lý ở backend
    // Filter sẽ được thực hiện bằng cách thêm vào keyword search
  }
  
  // 🔍 SMART FILTER: Filter theo district - tìm trong address
  // Thêm vào keyword để search tốt hơn
  if (filters.district) {
    // Filter sẽ được thực hiện bằng cách thêm vào keyword search
  }
  
  if (filters.minPrice) filterExpressions.push(`price >= ${Number(filters.minPrice)}`);
  if (filters.maxPrice) filterExpressions.push(`price <= ${Number(filters.maxPrice)}`);
  if (filters.minArea) filterExpressions.push(`area >= ${Number(filters.minArea)}`);
  if (filters.maxArea) filterExpressions.push(`area <= ${Number(filters.maxArea)}`);
  if (Array.isArray(filters.amenities) && filters.amenities.length > 0) {
    // amenities contains all of selected - MeiliSearch dùng array cho OR
    const amenityFilters = filters.amenities.map((a) => `amenities = "${a}"`);
    filterExpressions.push(amenityFilters);
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
      highlightPreTag: "<mark>",
      highlightPostTag: "</mark>",
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
          city: post.roomId.city || extractProvince(post.roomId.address) || "",
          district: extractDistrict(post.roomId.address) || "",
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
        city: post.roomId.city || extractProvince(post.roomId.address) || "",
        district: extractDistrict(post.roomId.address) || "",
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

/**
 * 🔍 Autocomplete/Suggestions - Tìm kiếm gợi ý nhanh
 * @param {string} keyword - Từ khóa người dùng nhập
 * @param {number} limit - Số lượng kết quả (mặc định 5)
 * @returns {Promise<Array>} - Danh sách suggestions
 */
export async function getSearchSuggestions(keyword, limit = 5) {
  if (!keyword || keyword.trim().length === 0) {
    return [];
  }

  try {
    const normalized = removeAccents(keyword.trim().toLowerCase());
    
    const params = {
      limit: Math.min(limit, 10), // Tối đa 10 suggestions
      attributesToRetrieve: ["_id", "id", "title", "location", "price", "area", "images"],
      attributesToHighlight: ["title", "location.address"],
      showMatchesPosition: true,
    };

    const result = await index.search(normalized, params);
    
    return result.hits.map((hit) => ({
      _id: hit._id || hit.id,
      title: hit.title,
      location: hit.location,
      price: hit.price,
      area: hit.area,
      images: hit.images || [],
      highlight: hit._formatted?.title || hit.title,
    }));
  } catch (err) {
    console.error("❌ Autocomplete error:", err.message);
    return [];
  }
}

/**
 * 🏠 Tìm phòng trọ tương tự dựa trên một phòng trọ cụ thể
 * @param {string} postId - ID của post hiện tại
 * @param {object} roomData - Thông tin phòng trọ (title, location, price, area, type)
 * @param {number} limit - Số lượng kết quả (mặc định 6)
 * @returns {Promise<Array>} - Danh sách phòng trọ tương tự
 */
export async function findSimilarRooms(postId, roomData = {}, limit = 6) {
  try {
    if (!roomData || !roomData.title) {
      // Nếu không có roomData, lấy từ MeiliSearch
      const doc = await index.getDocument(postId.toString());
      if (!doc) return [];
      
      roomData = {
        title: doc.title,
        location: doc.location,
        price: doc.price,
        area: doc.area,
        type: doc.type,
      };
    }

    // Xây dựng query để tìm phòng trọ tương tự
    // Ưu tiên: cùng khu vực, cùng loại, giá và diện tích gần nhau
    const searchQueries = [];
    
    // Query 1: Tìm theo địa chỉ/quận (ưu tiên cao nhất)
    if (roomData.location?.district) {
      searchQueries.push(roomData.location.district);
    }
    if (roomData.location?.city) {
      searchQueries.push(roomData.location.city);
    }
    
    // Query 2: Tìm theo từ khóa trong title (loại bỏ các từ dừng)
    const titleWords = roomData.title
      .split(/\s+/)
      .filter(word => word.length > 2)
      .slice(0, 3) // Lấy 3 từ đầu tiên
      .join(' ');
    if (titleWords) {
      searchQueries.push(titleWords);
    }

    // Kết hợp các query
    const combinedQuery = searchQueries.join(' ').trim() || roomData.title;
    
    // Build filters
    const filterExpressions = [];
    
    // Loại trừ post hiện tại
    filterExpressions.push(`_id != "${postId}"`);
    
    // Filter theo loại phòng nếu có
    if (roomData.type) {
      filterExpressions.push(`type = "${roomData.type}"`);
    }
    
    // Filter theo giá (khoảng ±30%)
    if (roomData.price) {
      const minPrice = Math.max(0, Math.floor(roomData.price * 0.7));
      const maxPrice = Math.ceil(roomData.price * 1.3);
      filterExpressions.push(`price >= ${minPrice} AND price <= ${maxPrice}`);
    }
    
    // Filter theo diện tích (khoảng ±20%)
    if (roomData.area) {
      const minArea = Math.max(0, Math.floor(roomData.area * 0.8));
      const maxArea = Math.ceil(roomData.area * 1.2);
      filterExpressions.push(`area >= ${minArea} AND area <= ${maxArea}`);
    }
    
    // Filter theo khu vực (tỉnh/thành phố)
    if (roomData.location?.city) {
      filterExpressions.push(`location.city = "${roomData.location.city}"`);
    }

    const normalized = removeAccents(combinedQuery.toLowerCase());
    
    const params = {
      limit: Math.min(limit, 12),
      filter: filterExpressions.length > 0 ? filterExpressions : undefined,
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
        "type",
        "createdAt",
      ],
      attributesToHighlight: ["title", "location.address"],
    };

    const result = await index.search(normalized, params);
    
    return result.hits.map((hit) => ({
      _id: hit._id || hit.id,
      title: hit.title,
      description: hit.description,
      price: hit.price,
      area: hit.area,
      location: hit.location,
      images: hit.images || [],
      amenities: hit.amenities || [],
      type: hit.type,
      createdAt: hit.createdAt,
      highlight: hit._formatted?.title || hit.title,
    }));
  } catch (err) {
    console.error("❌ Find similar rooms error:", err.message);
    return [];
  }
}
