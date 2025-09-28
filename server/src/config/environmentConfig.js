// Environment configuration
export const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/phongtro_modern';
export const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';
export const PORT = process.env.PORT || 5000;
export const NODE_ENV = process.env.NODE_ENV || 'development';

// Cloudinary configuration
export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || 'your_cloudinary_cloud_name';
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || 'your_cloudinary_api_key';
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || 'your_cloudinary_api_secret';

// Email configuration
export const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
export const EMAIL_PORT = process.env.EMAIL_PORT || 587;
export const EMAIL_USER = process.env.EMAIL_USER || 'your_email@gmail.com';
export const EMAIL_PASS = process.env.EMAIL_PASS || 'your_email_password';