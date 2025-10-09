// Wrapper service for VNPay integration
// Usage:
//   import { buildPaymentUrl, verifyReturnUrl } from './services/vnpayService.js'
//   const url = buildPaymentUrl({ vnp_Amount: 100000, vnp_TxnRef: 'ORDER123', vnp_ReturnUrl: 'https://your.app/return' })
//   const verify = verifyReturnUrl(req.query)

import { VNPay, ignoreLogger } from 'vnpay';

const vnpay = new VNPay({
  // Required config - set these in your environment for production
  tmnCode: process.env.VNPAY_TMN_CODE || 'YOUR_TMN_CODE',
  secureSecret: process.env.VNPAY_SECRET || 'YOUR_SECURE_SECRET',
  vnpayHost: process.env.VNPAY_HOST || 'https://sandbox.vnpayment.vn',

  // Optional
  testMode: process.env.NODE_ENV !== 'production',
  hashAlgorithm: process.env.VNPAY_HASH_ALG || 'SHA512',
  enableLog: false,
  loggerFn: ignoreLogger,
});

/**
 * Build VNPay payment URL
 * @param {object} params - parameters to build payment URL (vnp_Amount, vnp_IpAddr, vnp_ReturnUrl, vnp_TxnRef, vnp_OrderInfo, ...)
 * @returns {string} payment url
 */
export function buildPaymentUrl(params) {
  return vnpay.buildPaymentUrl(params);
}

/**
 * Verify return query from VNPay
 * @param {object} query - req.query from return URL
 * @returns {object} verification result { isSuccess, message, transactionRef, ... }
 */
export function verifyReturnUrl(query) {
  return vnpay.verifyReturnUrl(query);
}

export default vnpay;
