import dotenv from 'dotenv';
import path from 'path';

// Load environment variables with explicit path
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

console.log('🔍 Debugging JWT Secret...');
console.log('JWT_SECRET from env:', process.env.JWT_SECRET);
console.log('JWT_SECRET length:', process.env.JWT_SECRET?.length);
console.log('JWT_SECRET type:', typeof process.env.JWT_SECRET);

// Test JWT with current secret
import jwt from 'jsonwebtoken';

const testPayload = {
  id: '68d6113f4289c23f7574d3d8',
  email: 'landlord@test.com',
  role: 'landlord'
};

try {
  const token = jwt.sign(testPayload, process.env.JWT_SECRET, { expiresIn: '24h' });
  console.log('✅ Token generated successfully');
  console.log('Token:', token);
  
  // Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log('✅ Token verified successfully');
  console.log('Decoded:', decoded);
  
} catch (error) {
  console.error('❌ JWT error:', error.message);
}

console.log('\n📋 Environment variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_NAME:', process.env.DATABASE_NAME);
console.log('APP_PORT:', process.env.APP_PORT);
