/**
 * Content Moderation Middleware
 * Tự động kiểm tra và lọc nội dung không phù hợp
 */

import { moderateContent, validateComment } from '../services/contentModerationService.js';

/**
 * Middleware kiểm tra nội dung comment/review
 * @param {Object} options - Options cho moderation
 */
export const moderateContentMiddleware = (options = {}) => {
  return async (req, res, next) => {
    try {
      // Lấy các field cần kiểm tra
      const fieldsToCheck = options.fields || ['comment', 'content', 'review', 'message'];
      
      let hasViolation = false;
      const allViolations = [];
      
      // Kiểm tra từng field
      for (const field of fieldsToCheck) {
        if (req.body[field]) {
          const result = moderateContent(req.body[field], {
            allowUrls: options.allowUrls || false,
            allowEmails: options.allowEmails || false,
            allowPhones: options.allowPhones || false,
            censorBadWords: options.censorBadWords !== false, // Mặc định true
            strictMode: options.strictMode || false
          });

          // Nếu có vi phạm
          if (!result.isClean) {
            hasViolation = true;
            allViolations.push(...result.violations);

            // Nếu strictMode: chặn luôn
            if (options.strictMode) {
              return res.status(400).json({
                success: false,
                message: 'Nội dung không phù hợp',
                violations: result.violations,
                score: result.score
              });
            }

            // Nếu không strict: tự động filter và tiếp tục
            if (options.censorBadWords !== false) {
              req.body[field] = result.filteredText;
              // Log để admin biết
              console.warn(`[Content Moderation] Filtered content in field "${field}":`, {
                userId: req.user?.id,
                violations: result.violations,
                score: result.score
              });
            }
          }
        }
      }

      // Nếu có vi phạm nhưng không strict: tiếp tục với nội dung đã filter
      if (hasViolation && !options.strictMode) {
        // Có thể ghi log hoặc thông báo admin
        req.contentModerated = {
          hadViolations: true,
          violations: allViolations
        };
      }

      next();
    } catch (error) {
      console.error('Content moderation middleware error:', error);
      // Nếu có lỗi: tiếp tục (không chặn request)
      next();
    }
  };
};

/**
 * Middleware validate comment với strict mode
 */
export const validateCommentMiddleware = () => {
  return async (req, res, next) => {
    try {
      if (req.body.comment) {
        await validateComment(req.body.comment, {
          allowUrls: false,
          allowEmails: false,
          allowPhones: false,
          strictMode: true
        });
      }
      next();
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  };
};

export default {
  moderateContentMiddleware,
  validateCommentMiddleware
};

