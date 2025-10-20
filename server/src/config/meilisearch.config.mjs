import {MeiliSearch} from 'meilisearch';
import dotenv from 'dotenv';
dotenv.config();

export const meiliClient = new MeiliSearch({
  host: process.env.meilisearch_HOST || 'http://127.0.0.1:7700',
  apiKey: process.env.meilisearch_API_KEY || 'masterkey',
});
