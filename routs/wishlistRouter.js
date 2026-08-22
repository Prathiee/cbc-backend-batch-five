import express from "express";

import {
    addToWishlist,
    removeFromWishlist,
    getWishlist,
    checkWishlist
} from "../controllers/wishlistController.js";


const wishlistRouter = express.Router();


// ==================================================
// ADD PRODUCT TO WISHLIST
// ==================================================

wishlistRouter.post(
    "/",
    addToWishlist
);


// ==================================================
// GET CUSTOMER WISHLIST
// ==================================================

wishlistRouter.get(
    "/",
    getWishlist
);


// ==================================================
// CHECK PRODUCT IN WISHLIST
// ==================================================

wishlistRouter.get(
    "/check/:productId",
    checkWishlist
);


// ==================================================
// REMOVE PRODUCT FROM WISHLIST
// ==================================================

wishlistRouter.delete(
    "/:productId",
    removeFromWishlist
);


export default wishlistRouter;