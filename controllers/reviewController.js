import Review from "../models/review.js";


// ======================================================
// CREATE REVIEW - LOGGED IN CUSTOMER
// ======================================================

export async function createReview(req, res) {

    try {

        if (req.user == null) {
            return res.status(401).json({
                message: "Please login to submit a review"
            });
        }


        const {
            productId,
            rating,
            comment
        } = req.body;


        // Validation
        if (!productId || !rating || !comment?.trim()) {

            return res.status(400).json({
                message: "Product, rating and comment are required"
            });
        }


        if (rating < 1 || rating > 5) {

            return res.status(400).json({
                message: "Rating must be between 1 and 5"
            });
        }


        // Prevent the same user reviewing the same product multiple times
        const existingReview = await Review.findOne({
            productId: productId,
            userEmail: req.user.email
        });


        if (existingReview) {

            return res.status(409).json({
                message: "You have already reviewed this product"
            });
        }


        const review = new Review({

            productId: productId,

            userEmail: req.user.email,

            userName:
                `${req.user.firstName} ${req.user.lastName}`,

            userImg: req.user.img || "",

            rating: rating,

            comment: comment.trim(),

            status: "pending"
        });


        await review.save();


        res.status(201).json({
            message:
                "Review submitted successfully and is waiting for admin approval",
            review: review
        });


    } catch (error) {

        console.error("Create review error:", error);

        res.status(500).json({
            message: "Failed to submit review"
        });
    }
}

// ======================================================
// GET LOGGED-IN CUSTOMER'S REVIEWS
// ======================================================

export async function getMyReviews(req, res) {

    try {

        if (req.user == null) {

            return res.status(401).json({
                message: "Please login to view your reviews"
            });
        }


        const reviews = await Review.find({
            userEmail: req.user.email
        }).sort({
            createdAt: -1
        });


        res.json(reviews);


    } catch (error) {

        console.error("Get my reviews error:", error);

        res.status(500).json({
            message: "Failed to load your reviews"
        });
    }
}


// ======================================================
// GET APPROVED REVIEWS FOR ONE PRODUCT
// PUBLIC
// ======================================================

export async function getProductReviews(req, res) {

    try {

        const productId = req.params.productId;


        const reviews = await Review.find({
            productId: productId,
            status: "approved"
        }).sort({
            createdAt: -1
        });


        res.json(reviews);


    } catch (error) {

        console.error("Get product reviews error:", error);

        res.status(500).json({
            message: "Failed to load reviews"
        });
    }
}


// ======================================================
// GET ALL REVIEWS - ADMIN
// ======================================================

export async function getAllReviews(req, res) {

    try {

        if (
            req.user == null ||
            req.user.role !== "admin"
        ) {

            return res.status(403).json({
                message:
                    "You are not authorized to view all reviews"
            });
        }


        const reviews = await Review.find()
            .sort({
                createdAt: -1
            });


        res.json(reviews);


    } catch (error) {

        console.error("Get all reviews error:", error);

        res.status(500).json({
            message: "Failed to load reviews"
        });
    }
}


// ======================================================
// CHANGE REVIEW STATUS - ADMIN
// ======================================================

export async function updateReviewStatus(req, res) {

    try {

        if (
            req.user == null ||
            req.user.role !== "admin"
        ) {

            return res.status(403).json({
                message:
                    "You are not authorized to manage reviews"
            });
        }


        const reviewId = req.params.reviewId;

        const status = req.body.status;


        if (
            status !== "pending" &&
            status !== "approved" &&
            status !== "rejected"
        ) {

            return res.status(400).json({
                message: "Invalid review status"
            });
        }


        const review = await Review.findByIdAndUpdate(
            reviewId,
            {
                status: status
            },
            {
                new: true
            }
        );


        if (!review) {

            return res.status(404).json({
                message: "Review not found"
            });
        }


        res.json({
            message: "Review status updated successfully",
            review: review
        });


    } catch (error) {

        console.error("Update review error:", error);

        res.status(500).json({
            message: "Failed to update review"
        });
    }
}


// ======================================================
// DELETE REVIEW - ADMIN
// ======================================================

export async function deleteReview(req, res) {

    try {

        if (
            req.user == null ||
            req.user.role !== "admin"
        ) {

            return res.status(403).json({
                message:
                    "You are not authorized to delete reviews"
            });
        }


        const review =
            await Review.findByIdAndDelete(
                req.params.reviewId
            );


        if (!review) {

            return res.status(404).json({
                message: "Review not found"
            });
        }


        res.json({
            message: "Review deleted successfully"
        });


    } catch (error) {

        console.error("Delete review error:", error);

        res.status(500).json({
            message: "Failed to delete review"
        });
    }
}