import Joi from 'joi';

// Validation cho forgot password
export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email không hợp lệ',
    'any.required': 'Email là bắt buộc'
  })
});

// Validation cho reset password
export const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'Token là bắt buộc'
  }),
  newPassword: Joi.string().min(6).required().messages({
    'string.min': 'Mật khẩu phải có ít nhất 6 ký tự',
    'any.required': 'Mật khẩu mới là bắt buộc'
  })
});

// Validation cho register
export const registerSchema = Joi.object({
  full_name: Joi.string().min(2).max(50).required().messages({
    'string.min': 'Họ tên phải có ít nhất 2 ký tự',
    'string.max': 'Họ tên không được quá 50 ký tự',
    'any.required': 'Họ tên là bắt buộc'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Email không hợp lệ',
    'any.required': 'Email là bắt buộc'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Mật khẩu phải có ít nhất 6 ký tự',
    'any.required': 'Mật khẩu là bắt buộc'
  }),
  phone: Joi.string().pattern(/^[0-9]{10}$/).messages({
    'string.pattern.base': 'Số điện thoại phải có 10 chữ số'
  })
});

// Validation cho login
export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email không hợp lệ',
    'any.required': 'Email là bắt buộc'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Mật khẩu là bắt buộc'
  })
});

// Validation cho resend verification
export const resendVerificationSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Email không hợp lệ',
    'any.required': 'Email là bắt buộc'
  })
});