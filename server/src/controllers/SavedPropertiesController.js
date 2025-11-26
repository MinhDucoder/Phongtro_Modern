import Favorite from "../models/favoriteSchema.js";
import Post from "../models/postSchema.js";
import Room from "../models/roomSchema.js";
import { success, error } from "../utils/responeHandler.js";

class SavedPropertiesController {
  // Get user's saved properties
  async getSavedProperties(req, res, next) {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const search = req.query.search;
      const filter = req.query.filter; // available, unavailable, featured
      const sortBy = req.query.sortBy || 'newest'; // newest, oldest, price_low, price_high, views

      // Build query
      let query = { user: userId };

      // Calculate skip
      const skip = (page - 1) * limit;

      // Get saved properties with populated data
      let savedProperties = await Favorite.find(query)
        .populate({
          path: 'post',
          populate: {
            path: 'roomId',
            select: 'title description price area address city images amenities status'
          }
        })
        .populate({
          path: 'room',
          select: 'title description price area address city images amenities'
        })
        .sort({ savedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      // Filter out deleted posts
      savedProperties = savedProperties.filter(fav => fav.post && fav.post.roomId);

      // Apply search filter
      if (search) {
        savedProperties = savedProperties.filter(fav => {
          const title = fav.post?.roomId?.title || '';
          const location = `${fav.post?.roomId?.address || ''} ${fav.post?.roomId?.city || ''}`.trim();
          return title.toLowerCase().includes(search.toLowerCase()) ||
                 location.toLowerCase().includes(search.toLowerCase());
        });
      }

      // Apply status filter
      if (filter && filter !== 'all') {
        savedProperties = savedProperties.filter(fav => {
          switch (filter) {
            case 'available':
              return fav.post?.status === 'active';
            case 'unavailable':
              return fav.post?.status !== 'active';
            case 'featured':
              return fav.post?.favouriteLevel === 'vip' || fav.post?.favouriteLevel === 'platinum';
            default:
              return true;
          }
        });
      }

      // Apply sorting
      savedProperties.sort((a, b) => {
        switch (sortBy) {
          case 'newest':
            return new Date(b.savedAt) - new Date(a.savedAt);
          case 'oldest':
            return new Date(a.savedAt) - new Date(b.savedAt);
          case 'price_low':
            return (a.post?.roomId?.price || 0) - (b.post?.roomId?.price || 0);
          case 'price_high':
            return (b.post?.roomId?.price || 0) - (a.post?.roomId?.price || 0);
          case 'views':
            return (b.post?.views || 0) - (a.post?.views || 0);
          default:
            return 0;
        }
      });

      // Format response
      const formattedProperties = savedProperties.map(fav => ({
        id: fav._id,
        postId: fav.post?._id,
        title: fav.post?.roomId?.title || 'N/A',
        description: fav.post?.roomId?.description || '',
        price: fav.post?.roomId?.price || 0,
        area: fav.post?.roomId?.area || 0,
        location: `${fav.post?.roomId?.address || ''}, ${fav.post?.roomId?.city || ''}`.trim(),
        address: fav.post?.roomId?.address || '',
        city: fav.post?.roomId?.city || '',
        images: fav.post?.roomId?.images || [],
        amenities: fav.post?.roomId?.amenities || [],
        status: fav.post?.status || 'unknown',
        isFeatured: fav.post?.favouriteLevel === 'vip' || fav.post?.favouriteLevel === 'platinum',
        savedDate: fav.savedAt,
        notes: fav.notes,
        tags: fav.tags || [],
        contact: {
          name: fav.post?.landlord?.full_name || 'N/A',
          phone: fav.post?.landlord?.phone || '',
          email: fav.post?.landlord?.email || ''
        }
      }));

      // Get total count for pagination
      const totalQuery = await Favorite.find({ user: userId })
        .populate('post')
        .lean();
      const totalFiltered = totalQuery.filter(fav => fav.post && fav.post.roomId).length;

      return success(res, {
        properties: formattedProperties,
        pagination: {
          total: totalFiltered,
          page,
          limit,
          totalPages: Math.ceil(totalFiltered / limit),
        }
      });
    } catch (err) {
      return error(res, err.message, 500);
    }
  }

  // Save a property to favorites
  async saveProperty(req, res, next) {
    try {
      const userId = req.user.id;
      const { postId, notes, tags } = req.body;

      // Check if post exists
      const post = await Post.findById(postId).populate('roomId');
      if (!post) {
        return error(res, 'Post not found', 404);
      }

      // Check if already saved
      const existingFavorite = await Favorite.findOne({ user: userId, post: postId });
      if (existingFavorite) {
        return error(res, 'Property already saved', 400);
      }

      // Create new favorite
      const favorite = new Favorite({
        user: userId,
        post: postId,
        room: post.roomId._id,
        notes: notes || '',
        tags: tags || []
      });

      await favorite.save();

      return success(res, { message: 'Property saved successfully', favorite }, 201);
    } catch (err) {
      if (err.code === 11000) {
        return error(res, 'Property already saved', 400);
      }
      return error(res, err.message, 500);
    }
  }

  // Remove a property from favorites
  async removeProperty(req, res, next) {
    try {
      const userId = req.user.id;
      const favoriteId = req.params.id;

      const favorite = await Favorite.findOneAndDelete({
        _id: favoriteId,
        user: userId
      });

      if (!favorite) {
        return error(res, 'Saved property not found', 404);
      }

      return success(res, { message: 'Property removed from favorites' });
    } catch (err) {
      return error(res, err.message, 500);
    }
  }

  // Update favorite notes and tags
  async updateFavorite(req, res, next) {
    try {
      const userId = req.user.id;
      const favoriteId = req.params.id;
      const { notes, tags } = req.body;

      const favorite = await Favorite.findOneAndUpdate(
        { _id: favoriteId, user: userId },
        { notes: notes || '', tags: tags || [] },
        { new: true }
      );

      if (!favorite) {
        return error(res, 'Saved property not found', 404);
      }

      return success(res, { message: 'Favorite updated successfully', favorite });
    } catch (err) {
      return error(res, err.message, 500);
    }
  }

  // Get saved properties statistics
  async getSavedPropertiesStats(req, res, next) {
    try {
      const userId = req.user.id;

      // Get basic stats
      const totalSaved = await Favorite.countDocuments({ user: userId });
      
      // Get stats by status
      const savedProperties = await Favorite.find({ user: userId })
        .populate({
          path: 'post',
          populate: {
            path: 'roomId'
          }
        })
        .lean();

      const available = savedProperties.filter(fav => fav.post?.status === 'active').length;
      const unavailable = savedProperties.filter(fav => fav.post?.status !== 'active').length;
      const featured = savedProperties.filter(fav => 
        fav.post?.favouriteLevel === 'vip' || fav.post?.favouriteLevel === 'platinum'
      ).length;

      // Get price range
      const prices = savedProperties
        .map(fav => fav.post?.roomId?.price)
        .filter(price => price && price > 0)
        .sort((a, b) => a - b);

      const stats = {
        totalSaved,
        available,
        unavailable,
        featured,
        priceRange: {
          min: prices.length > 0 ? prices[0] : 0,
          max: prices.length > 0 ? prices[prices.length - 1] : 0,
          average: prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0
        }
      };

      return success(res, stats);
    } catch (err) {
      return error(res, err.message, 500);
    }
  }

  // Check if a property is saved by user
  async checkSavedStatus(req, res, next) {
    try {
      const userId = req.user.id;
      const postId = req.params.postId || req.params.id;

      if (!postId) {
        return error(res, "Missing postId", 400);
      }

      const favorite = await Favorite.findOne({ user: userId, post: postId });

      return success(res, {
        isSaved: !!favorite,
        favoriteId: favorite?._id,
        savedAt: favorite?.savedAt
      });
    } catch (err) {
      return error(res, err.message, 500);
    }
  }
}

export default new SavedPropertiesController();



