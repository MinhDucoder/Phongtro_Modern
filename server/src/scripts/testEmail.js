import dotenv from 'dotenv';
import { sendVerificationEmail } from '../services/emailService.js';

// Load biến môi trường
dotenv.config();

const testEmail = async () => {
  try {
    console.log('Starting email test...');
    console.log('Environment variables:', {
      EMAIL_USER: process.env.EMAIL_USER,
      EMAIL_PASS: process.env.EMAIL_PASS ? '(set)' : '(not set)',
      FRONTEND_URL: process.env.FRONTEND_URL
    });

    const testUserEmail = 'vumanhbao0411@gmail.com'; // Email nhận test
    const testToken = 'test-token-123';

    console.log(`Attempting to send test email to: ${testUserEmail}`);
    
    const result = await sendVerificationEmail(testUserEmail, testToken);
    
    if (result) {
      console.log('✅ Test email sent successfully!');
    } else {
      console.log('❌ Failed to send test email');
    }
  } catch (error) {
    console.error('Error in test:', error);
  }
};

// Chạy test
testEmail();