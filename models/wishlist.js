import mongoose from "mongoose";

const wishlistSchema = mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true
        },

        products: [
            {
                productId: {
                    type: String,
                    required: true
                }
            }
        ]
    },
    {
        timestamps: true
    }
);

const Wishlist = mongoose.model(
    "wishlists",
    wishlistSchema
);

export default Wishlist;