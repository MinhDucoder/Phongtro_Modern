import express from 'express';
import searchController from '~/controllers/searchController.js';

const searchRoute = express.Router();

searchRoute.get('/', searchController.suggest);

export default searchRoute; 