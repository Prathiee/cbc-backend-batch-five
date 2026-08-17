import express from "express";
import { sendChatMessage } from "../controllers/chatbotController.js";

const chatbotRouter = express.Router();

chatbotRouter.post("/message", sendChatMessage);

export default chatbotRouter;