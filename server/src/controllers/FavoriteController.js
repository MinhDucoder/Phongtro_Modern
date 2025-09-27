const favoriteService = require('../services/favoriteService');

class FavoriteController {
  // GET /api/v1/favorites - Get user's favorites
  async getUserFavorites(req, res) {
    try {
      const userId = req.user.id;
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        search: req.query.search || '',
        sortBy: req.query.sortBy || 'savedAt',
        sortOrder: req.query.sortOrder || 'desc',
        tags: req.query.tags ? req.query.tags.split(',') : []
      };

      const result = await favoriteService.getUserFavorites(userId, options);

      res.json({
        success: true,
        data: result,
        message: 'Favorites retrieved successfully'
      });
    } catch (error) {
      console.error('Get user favorites error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error retrieving favorites'
      });
    }
  }

  // POST /api/v1/favorites - Add post to favorites
  async addToFavorites(req, res) {
    try {
      const userId = req.user.id;
      const { postId, notes = '', tags = [] } = req.body;

      if (!postId) {
        return res.status(400).json({
          success: false,
          message: 'Post ID is required'
        });
      }

      const favorite = await favoriteService.addToFavorites(userId, postId, notes, tags);

      res.status(201).json({
        success: true,
        data: favorite,
        message: 'Added to favorites successfully'
      });
    } catch (error) {
      console.error('Add to favorites error:', error);
      
      if (error.message === 'Post not found') {
        return res.status(404).json({
          success: false,
          message: 'Post not found'
        });
      }

      if (error.message === 'Post already in favorites') {
        return res.status(409).json({
          success: false,
          message: 'Post already in favorites'
        });
      }

      res.status(500).json({
        success: false,
        message: error.message || 'Error adding to favorites'
      });
    }
  }

  // DELETE /api/v1/favorites/:postId - Remove from favorites
  async removeFromFavorites(req, res) {
    try {
      const userId = req.user.id;
      const { postId } = req.params;

      const result = await favoriteService.removeFromFavorites(userId, postId);

      res.json({
        success: true,
        data: result,
        message: 'Removed from favorites successfully'
      });
    } catch (error) {
      console.error('Remove from favorites error:', error);
      
      if (error.message === 'Favorite not found') {
        return res.status(404).json({
          success: false,
          message: 'Favorite not found'
        });
      }

      res.status(500).json({
        success: false,
        message: error.message || 'Error removing from favorites'
      });
    }
  }

  // PUT /api/v1/favorites/:postId - Update favorite notes/tags
  async updateFavorite(req, res) {
    try {
      const userId = req.user.id;
      const { postId } = req.params;
      const updates = req.body;

      const favorite = await favoriteService.updateFavorite(userId, postId, updates);

      res.json({
        success: true,
        data: favorite,
        message: 'Favorite updated successfully'
      });
    } catch (error) {
      console.error('Update favorite error:', error);
      
      if (error.message === 'Favorite not found') {
        return res.status(404).json({
          success: false,
          message: 'Favorite not found'
        });
      }

      res.status(500).json({
        success: false,
        message: error.message || 'Error updating favorite'
      });
    }
  }

  // GET /api/v1/favorites/check/:postId - Check if post is in favorites
  async checkFavorite(req, res) {
    try {
      const userId = req.user.id;
      const { postId } = req.params;

      const isFavorite = await favoriteService.isInFavorites(userId, postId);

      res.json({
        success: true,
        data: { isFavorite },
        message: 'Favorite status checked'
      });
    } catch (error) {
      console.error('Check favorite error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error checking favorite status'
      });
    }
  }

  // GET /api/v1/favorites/count - Get favorites count
  async getFavoritesCount(req, res) {
    try {
      const userId = req.user.id;

      const count = await favoriteService.getFavoritesCount(userId);

      res.json({
        success: true,
        data: { count },
        message: 'Favorites count retrieved'
      });
    } catch (error) {
      console.error('Get favorites count error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error getting favorites count'
      });
    }
  }

  // DELETE /api/v1/favorites/bulk - Remove multiple favorites
  async removeMultipleFavorites(req, res) {
    try {
      const userId = req.user.id;
      const { postIds } = req.body;

      if (!postIds || !Array.isArray(postIds) || postIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Post IDs array is required'
        });
      }

      const result = await favoriteService.removeMultipleFavorites(userId, postIds);

      res.json({
        success: true,
        data: result,
        message: 'Multiple favorites removed successfully'
      });
    } catch (error) {
      console.error('Remove multiple favorites error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error removing multiple favorites'
      });
    }
  }

  // GET /api/v1/favorites/post/:postId - Get users who saved a post (for landlords)
  async getPostFavorites(req, res) {
    try {
      const { postId } = req.params;

      const favorites = await favoriteService.getPostFavorites(postId);

      res.json({
        success: true,
        data: favorites,
        message: 'Post favorites retrieved successfully'
      });
    } catch (error) {
      console.error('Get post favorites error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error retrieving post favorites'
      });
    }
  }
}

module.exports = new FavoriteController();







