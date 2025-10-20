import express from 'express';
import searchController from '~/controllers/searchController.js';

const searchRoute = express.Router();

searchRoute.get('/', searchController.search);
searchRoute.get('/suggest', searchController.suggest);
searchRoute.get('/:id/recommendPosts', searchController.recommendPosts);
export default searchRoute; 