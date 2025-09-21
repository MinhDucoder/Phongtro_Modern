// routes/conversationRoutes.js
import express from "express";
import conversationController from "../../controllers/ConversationController.js";
import { authenticate } from "../../middlewares/checkToken.js";

const conversationRoute = express.Router();

conversationRoute.post("/", authenticate(), conversationController.create);
conversationRoute.get("/", authenticate(), conversationController.list);

export default conversationRoute;
