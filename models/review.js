import mongoose from "mongoose";

const reviewSchema = mongoose.Schema(
    {
        productId: {
            type: String,
            required: true
        },

        userEmail: {
            type: String,
            required: true
        },

        userName: {
            type: String,
            required: true
        },

        userImg: {
            type: String,
            required: false,
            default: ""
        },

        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },

        comment: {
            type: String,
            required: true,
            trim: true
        },

        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending"
        }
    },
    {
        timestamps: true
    }
);

const Review = mongoose.model("reviews", reviewSchema);

export default Review;