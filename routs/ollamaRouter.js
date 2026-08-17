import express from "express";
import { askOllama } from "../controllers/ollamaController.js";

const ollamaRouter = express.Router();

ollamaRouter.post("/ask", askOllama);

export default ollamaRouter;