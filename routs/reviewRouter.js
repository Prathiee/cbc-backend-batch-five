import express from "express";

import {
    createReview,
    getMyReviews,
    getProductReviews,
    getAllReviews,
    updateReviewStatus,
    deleteReview
} from "../controllers/reviewController.js";


const reviewRouter = express.Router();


// Customer submits review
reviewRouter.post("/", createReview);

reviewRouter.get("/my-reviews", getMyReviews);


// Admin gets every review
reviewRouter.get("/all", getAllReviews);


// Public approved reviews for one product
reviewRouter.get(
    "/product/:productId",
    getProductReviews
);


// Admin changes pending / approved / rejected
reviewRouter.put(
    "/:reviewId/status",
    updateReviewStatus
);


// Admin deletes review
reviewRouter.delete(
    "/:reviewId",
    deleteReview
);


export default reviewRouter;