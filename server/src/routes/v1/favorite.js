const express = require('express');
const FavoriteController = require('../../controllers/FavoriteController');
const { authenticate, authorize } = require('../../middlewares/checkToken');

const favoriteRoute = express.Router();

// All routes require authentication
favoriteRoute.use(authenticate());

// GET /api/v1/favorites - Get user's favorites with pagination and filtering
favoriteRoute.get('/', FavoriteController.getUserFavorites);

// POST /api/v1/favorites - Add post to favorites
favoriteRoute.post('/', FavoriteController.addToFavorites);

// GET /api/v1/favorites/count - Get favorites count
favoriteRoute.get('/count', FavoriteController.getFavoritesCount);

// GET /api/v1/favorites/check/:postId - Check if post is in favorites
favoriteRoute.get('/check/:postId', FavoriteController.checkFavorite);

// PUT /api/v1/favorites/:postId - Update favorite notes/tags
favoriteRoute.put('/:postId', FavoriteController.updateFavorite);

// DELETE /api/v1/favorites/:postId - Remove from favorites
favoriteRoute.delete('/:postId', FavoriteController.removeFromFavorites);

// DELETE /api/v1/favorites/bulk - Remove multiple favorites
favoriteRoute.delete('/bulk', FavoriteController.removeMultipleFavorites);

// GET /api/v1/favorites/post/:postId - Get users who saved a post (for landlords)
favoriteRoute.get('/post/:postId', authorize(['landlord', 'admin']), FavoriteController.getPostFavorites);

module.exports = favoriteRoute;

