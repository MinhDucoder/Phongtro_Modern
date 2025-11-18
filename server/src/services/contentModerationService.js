/**
 * Content Moderation Service
 * Xử lý lọc nội dung không phù hợp trong comments/reviews
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load bad words từ file JSON
let VIETNAMESE_BAD_WORDS = [];
try {
  const badwordPath = join(__dirname, '../utils/badword.json');
  const badwordData = JSON.parse(readFileSync(badwordPath, 'utf-8'));
  VIETNAMESE_BAD_WORDS = badwordData.badWords || [];
  console.log(`✅ Loaded ${VIETNAMESE_BAD_WORDS.length} bad words from badword.json`);
} catch (error) {
  console.warn('⚠️ Could not load badword.json, using default list');
  // Fallback to default list
  VIETNAMESE_BAD_WORDS = [
    'đụ', 'địt', 'lồn', 'buồi', 'cặc', 'địt mẹ', 'đụ mẹ',
    'đồ ngu', 'đồ ngốc', 'ngu si', 'đồ khùng',
    'chó', 'chó má', 'mẹ mày', 'bố mày',
    'spam', 'scam', 'lừa đảo',
  ];
}

// Danh sách pattern không phù hợp
const BAD_PATTERNS = [
  /http[s]?:\/\/[^\s]+/g, // URLs (có thể cho phép hoặc chặn)
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, // Email
  /0\d{9,10}/g, // Số điện thoại
];

/**
 * Kiểm tra và lọc nội dung không phù hợp
 * @param {string} text - Text cần kiểm tra
 * @param {Object} options - Options
 * @returns {Object} - { isClean: boolean, filteredText: string, violations: string[] }
 */
export function moderateContent(text, options = {}) {
  if (!text || typeof text !== 'string') {
    return {
      isClean: true,
      filteredText: text || '',
      violations: [],
      score: 0
    };
  }

  const {
    allowUrls = false,
    allowEmails = false,
    allowPhones = false,
    censorBadWords = true,
    strictMode = false, // Chế độ nghiêm ngặt
  } = options;

  let filteredText = text;
  const violations = [];
  let score = 0; // Điểm vi phạm (0-100)

  // 1. Kiểm tra từ ngữ không phù hợp
  const lowerText = text.toLowerCase();
  const foundBadWords = VIETNAMESE_BAD_WORDS.filter(word => 
    lowerText.includes(word.toLowerCase())
  );

  if (foundBadWords.length > 0) {
    violations.push(`Phát hiện ${foundBadWords.length} từ ngữ không phù hợp`);
    score += foundBadWords.length * 20;

    // Thay thế bằng dấu *
    if (censorBadWords) {
      foundBadWords.forEach(word => {
        const regex = new RegExp(word, 'gi');
        filteredText = filteredText.replace(regex, '*'.repeat(word.length));
      });
    }
  }

  // 2. Kiểm tra URLs
  if (!allowUrls) {
    const urlMatches = text.match(/http[s]?:\/\/[^\s]+/g);
    if (urlMatches) {
      violations.push(`Phát hiện ${urlMatches.length} liên kết không được phép`);
      score += urlMatches.length * 15;
      filteredText = filteredText.replace(/http[s]?:\/\/[^\s]+/g, '[Link đã bị xóa]');
    }
  }

  // 3. Kiểm tra Email
  if (!allowEmails) {
    const emailMatches = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
    if (emailMatches) {
      violations.push(`Phát hiện ${emailMatches.length} email không được phép`);
      score += emailMatches.length * 15;
      filteredText = filteredText.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[Email đã bị xóa]');
    }
  }

  // 4. Kiểm tra Số điện thoại
  if (!allowPhones) {
    const phoneMatches = text.match(/0\d{9,10}/g);
    if (phoneMatches) {
      violations.push(`Phát hiện ${phoneMatches.length} số điện thoại không được phép`);
      score += phoneMatches.length * 10;
      filteredText = filteredText.replace(/0\d{9,10}/g, '[SĐT đã bị xóa]');
    }
  }

  // 5. Kiểm tra độ dài (spam)
  if (text.length > 1000) {
    violations.push('Nội dung quá dài (có thể là spam)');
    score += 10;
  }

  // 6. Kiểm tra ký tự lặp lại (spam)
  if (/(.)\1{10,}/.test(text)) {
    violations.push('Phát hiện ký tự lặp lại nhiều lần (spam)');
    score += 15;
  }

  // Chế độ nghiêm ngặt: chặn ngay nếu có vi phạm
  const isClean = strictMode ? score === 0 : score < 50;

  return {
    isClean,
    filteredText: isClean ? filteredText : text, // Giữ nguyên nếu không clean
    violations,
    score: Math.min(score, 100)
  };
}

/**
 * Validate comment trước khi lưu (strict mode)
 * @param {string} comment - Comment cần validate
 * @param {Object} options - Options
 * @returns {Promise<Object>} - Result
 * @throws {Error} Nếu nội dung không phù hợp
 */
export async function validateComment(comment, options = {}) {
  const moderationResult = moderateContent(comment, {
    strictMode: true,
    ...options
  });

  if (!moderationResult.isClean) {
    throw new Error(`Nội dung không phù hợp: ${moderationResult.violations.join(', ')}`);
  }

  return {
    success: true,
    filteredComment: moderationResult.filteredText,
    score: moderationResult.score
  };
}

/**
 * Sử dụng OpenAI Moderation API (optional - cần API key)
 * @param {string} text - Text cần kiểm tra
 * @returns {Promise<Object>} - Moderation result
 */
export async function moderateWithOpenAI(text) {
  const apiKey = process.env.OPENAI_MODERATION_API_KEY;
  
  if (!apiKey) {
    console.warn('OpenAI Moderation API key not found, using local moderation only');
    return moderateContent(text);
  }

  try {
    const response = await fetch('https://api.openai.com/v1/moderations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        input: text
      })
    });

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      const categories = Object.entries(result.categories)
        .filter(([_, flagged]) => flagged)
        .map(([category]) => category);

      return {
        isClean: !result.flagged,
        filteredText: text, // OpenAI không filter, chỉ flag
        violations: categories,
        score: result.flagged ? (result.category_scores.hate * 100) : 0,
        aiResult: result
      };
    }

    return {
      isClean: true,
      filteredText: text,
      violations: [],
      score: 0
    };
  } catch (error) {
    console.error('OpenAI Moderation API error:', error);
    // Fallback to local moderation
    return moderateContent(text);
  }
}

export default {
  moderateContent,
  validateComment,
  moderateWithOpenAI
};

