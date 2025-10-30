import express from 'express';
import searchController from '~/controllers/searchController.js';

const searchRoute = express.Router();

searchRoute.get('/', searchController.suggest);
searchRoute.get('/:id/recommendPosts', async(req, res) => {
    const postId = req.params.id;
    console.log("Post ID for recommendation:", postId);
    try {
      const response = await axios.get(`http://127.0.0.1:6000/recommendPosts?postId=${postId}`);
      // console.log("Recommendation response data:", response.data);
      return success(res, response.data);
    } catch (error) {
      return error(res, 500, 'Lỗi khi lấy bài đăng được đề xuất');
    }
  //   try {
  //     const response = await axios.get(`http://127.0.0.1:6000/recommendPosts?postId=${postId}`);
  //     res.success(response.data);
  //   } catch (error) {
  //     res.error(500, 'Lỗi khi lấy bài đăng được đề xuất');
  //   }
  });
export default searchRoute;
