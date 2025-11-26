import express from 'express';
import searchController from '~/controllers/searchController.js';
import { success, error } from '~/utils/responeHandler.js';

const searchRoute = express.Router();

// Autocomplete - phải đặt trước route '/' để tránh conflict
searchRoute.get('/autocomplete', searchController.autocomplete);

// Similar rooms
searchRoute.get('/similar', searchController.similar);

// Main search
searchRoute.get('/', searchController.suggest);

// Recommend posts (legacy - giữ lại để tương thích)
searchRoute.get('/:id/recommendPosts', async(req, res) => {
    const postId = req.params.id;
    console.log("Post ID for recommendation:", postId);
    try {
      const response = await fetch(`http://127.0.0.1:6000/recommendPosts?postId=${postId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return success(res, data);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      return error(res, 'Lỗi khi lấy bài đăng được đề xuất', 500);
    }
});

export default searchRoute;
