const Favorite = require('../models/favoriteSchema');
const Post = require('../models/postSchema');
const Room = require('../models/roomSchema');

class FavoriteService {
  // Get user's favorites with pagination and filtering
  async getUserFavorites(userId, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        sortBy = 'savedAt',
        sortOrder = 'desc',
        tags = []
      } = options;

      const skip = (page - 1) * limit;
      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Build query
      const query = { user: userId };

      if (search) {
        // Search in post title or room details through populated fields
        query.$or = [
          { notes: { $regex: search, $options: 'i' } }
        ];
      }

      if (tags.length > 0) {
        query.tags = { $in: tags };
      }

      // Get favorites with populated data
      const favorites = await Favorite.find(query)
        .populate({
          path: 'post',
          populate: {
            path: 'roomId',
            model: 'Room'
          }
        })
        .populate('room')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean();

      // Get total count
      const total = await Favorite.countDocuments(query);

      // Transform data for frontend
      const transformedFavorites = favorites.map(fav => {
        const post = fav.post;
        
        return {
          id: fav._id,
          postId: post?._id,
          title: post?.title || 'Không có tiêu đề',
          price: post?.price || 0,
          area: post?.area || 0,
          location: post?.location?.district ? `${post.location.district}, ${post.location.city}` : 'Không có địa chỉ',
          address: post?.location?.district ? `${post.location.district}, ${post.location.city}` : 'Không có địa chỉ',
          image: (() => {
            const imageUrl = post?.images?.[0];
            if (!imageUrl || typeof imageUrl !== 'string' || imageUrl.trim() === '') {
              return '/placeholder-room.svg';
            }
            if (imageUrl.startsWith('/') || imageUrl.startsWith('http')) {
              return imageUrl;
            }
            return '/placeholder-room.svg';
          })(),
          contact: {
            name: post?.landlord?.full_name || 'Chủ nhà',
            phone: post?.landlord?.phone || 'Không có số điện thoại'
          },
          views: post?.views || 0,
          savedDate: fav.savedAt,
          isAvailable: post?.status === 'active',
          isFeatured: post?.favouriteLevel === 'vip',
          notes: fav.notes,
          tags: fav.tags || []
        };
      });

      return {
        favorites: transformedFavorites,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error getting user favorites:', error);
      throw error;
    }
  }

  // Add a post to favorites
  async addToFavorites(userId, postId, notes = '', tags = []) {
    try {
      // Check if post exists and get room info
      const post = await Post.findById(postId).populate('roomId');
      if (!post) {
        throw new Error('Post not found');
      }

      // Check if already in favorites
      const existingFavorite = await Favorite.findOne({
        user: userId,
        post: postId
      });

      if (existingFavorite) {
        throw new Error('Post already in favorites');
      }

      // Create new favorite
      const favorite = new Favorite({
        user: userId,
        post: postId,
        room: post.roomId._id,
        notes,
        tags
      });

      await favorite.save();
      await favorite.populate([
        {
          path: 'post',
          populate: {
            path: 'roomId',
            model: 'Room'
          }
        },
        {
          path: 'room'
        }
      ]);

      return favorite;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw error;
    }
  }

  // Remove from favorites
  async removeFromFavorites(userId, postId) {
    try {
      const favorite = await Favorite.findOneAndDelete({
        user: userId,
        post: postId
      });

      if (!favorite) {
        throw new Error('Favorite not found');
      }

      return { message: 'Removed from favorites successfully' };
    } catch (error) {
      console.error('Error removing from favorites:', error);
      throw error;
    }
  }

  // Update favorite notes/tags
  async updateFavorite(userId, postId, updates) {
    try {
      const favorite = await Favorite.findOneAndUpdate(
        { user: userId, post: postId },
        { $set: updates },
        { new: true }
      );

      if (!favorite) {
        throw new Error('Favorite not found');
      }

      return favorite;
    } catch (error) {
      console.error('Error updating favorite:', error);
      throw error;
    }
  }

  // Check if post is in user's favorites
  async isInFavorites(userId, postId) {
    try {
      const favorite = await Favorite.findOne({
        user: userId,
        post: postId
      });

      return !!favorite;
    } catch (error) {
      console.error('Error checking favorites:', error);
      return false;
    }
  }

  // Get favorites count for a user
  async getFavoritesCount(userId) {
    try {
      return await Favorite.countDocuments({ user: userId });
    } catch (error) {
      console.error('Error getting favorites count:', error);
      return 0;
    }
  }

  // Get users who saved a specific post
  async getPostFavorites(postId) {
    try {
      const favorites = await Favorite.find({ post: postId })
        .populate('user', 'full_name email')
        .select('user savedAt')
        .sort({ savedAt: -1 })
        .lean();

      return favorites.map(fav => ({
        user: fav.user,
        savedAt: fav.savedAt
      }));
    } catch (error) {
      console.error('Error getting post favorites:', error);
      throw error;
    }
  }

  // Bulk operations
  async removeMultipleFavorites(userId, postIds) {
    try {
      const result = await Favorite.deleteMany({
        user: userId,
        post: { $in: postIds }
      });

      return {
        message: `Removed ${result.deletedCount} favorites successfully`,
        deletedCount: result.deletedCount
      };
    } catch (error) {
      console.error('Error removing multiple favorites:', error);
      throw error;
    }
  }
}

module.exports = new FavoriteService();
