import express from 'express';
import searchController from '~/controllers/searchController.js';

const searchRoute = express.Router();

searchRoute.get('/', searchController.search);
searchRoute.get('/suggest', searchController.suggest);

export default searchRoute; 