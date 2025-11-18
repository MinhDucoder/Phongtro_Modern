// Setup file cho Jest - chạy trước tất cả tests
import dotenv from 'dotenv';

// Load environment variables from .env.test nếu có, hoặc .env
dotenv.config({ path: '.env.test' });
dotenv.config({ path: '.env' });

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/phongtro_test';

// Suppress console logs during tests (optional)
// global.console.log = jest.fn();
// global.console.error = jest.fn();

// Set timeout cho tất cả tests
jest.setTimeout(30000);
