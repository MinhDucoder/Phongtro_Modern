import express  from "express";
import PaymentController  from "../../controllers/PaymentController.js";

const paymentRoute = express.Router();

// API xử lý đơn hàng
paymentRoute.post("/createPayment", (req, res) => PaymentController.createOrder(req, res));

// Return URL từ VNPay
paymentRoute.get("/payment_return", (req, res) => PaymentController.paymentReturn(req, res));

module.exports = paymentRoute;
