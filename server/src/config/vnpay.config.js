import { VNPay, ProductCode, VnpLocale } from "vnpay";

export const vnpay = new VNPay({
  tmnCode: process.env.VNP_TMNCODE, // từ VNPay sandbox
  secureSecret: process.env.VNP_HASHSECRET, // từ VNPay sandbox
  vnpayHost: "https://sandbox.vnpayment.vn",
  testMode: true,
});

