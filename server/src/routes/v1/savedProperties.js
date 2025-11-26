import express from 'express';
import SavedPropertiesController from '../../controllers/SavedPropertiesController.js';
import { authenticate, authorize } from '../../middlewares/checkToken.js';
import catchAsync from '../../middlewares/catchAsync.js';

const savedPropertiesRoute = express.Router();

// All routes require authentication
savedPropertiesRoute.use(authenticate());

// Dashboard routes for saved properties
savedPropertiesRoute.get('/dashboard/saved', catchAsync(SavedPropertiesController.getSavedProperties));
savedPropertiesRoute.get('/dashboard/saved/stats', catchAsync(SavedPropertiesController.getSavedPropertiesStats));
savedPropertiesRoute.get('/dashboard/saved/check/:postId', catchAsync(SavedPropertiesController.checkSavedStatus));

// CRUD operations for saved properties
savedPropertiesRoute.post('/', catchAsync(SavedPropertiesController.saveProperty));
savedPropertiesRoute.delete('/:id', catchAsync(SavedPropertiesController.removeProperty));
savedPropertiesRoute.put('/:id', catchAsync(SavedPropertiesController.updateFavorite));

export default savedPropertiesRoute;



