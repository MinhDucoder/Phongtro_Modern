// routes/messageRoutes.js
import express from "express";
import messageController from "../../controllers/MessageController.js";
import { authenticate } from "../../middlewares/checkToken.js"; 

const messageRoute = express.Router();

messageRoute.get("/:conversationId", authenticate(), messageController.list);
messageRoute.post("/", authenticate(), messageController.create);
messageRoute.patch("/:messageId/seen", authenticate(), messageController.markSeen);

export default messageRoute;
