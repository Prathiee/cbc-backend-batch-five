import express from "express";
import { saveRecommendation, getRecommendationByProductId, updateRecommendation, findRecommendations, chatWithGlowGuide, buildSkincareRoutine } from "../controllers/recomendationController.js";

const recommendationRouter = express.Router();

recommendationRouter.post("/", saveRecommendation);

recommendationRouter.get("/routine/personalized", buildSkincareRoutine);

recommendationRouter.get("/:productId", getRecommendationByProductId);

recommendationRouter.put("/:productId", updateRecommendation);

recommendationRouter.post("/find",findRecommendations);

recommendationRouter.post("/chat", chatWithGlowGuide);
export default recommendationRouter;