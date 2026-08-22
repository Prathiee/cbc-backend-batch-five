import Wishlist from "../models/wishlist.js";
import Product from "../models/product.js";


// ==========================================================
// ADD PRODUCT TO WISHLIST
// ==========================================================

export async function addToWishlist(req, res) {

    if (req.user == null) {

        return res.status(403).json({
            message: "Please login to add products to your wishlist"
        });

    }

    try {

        const { productId } = req.body;

        if (!productId) {

            return res.status(400).json({
                message: "Product ID is required"
            });

        }


        // --------------------------------------------------
        // CHECK WHETHER PRODUCT EXISTS
        // --------------------------------------------------

        const product = await Product.findOne({
            productId: productId
        });

        if (!product) {

            return res.status(404).json({
                message: "Product not found"
            });

        }


        // --------------------------------------------------
        // FIND CUSTOMER WISHLIST
        // --------------------------------------------------

        let wishlist = await Wishlist.findOne({
            email: req.user.email
        });


        // --------------------------------------------------
        // CREATE WISHLIST IF CUSTOMER DOES NOT HAVE ONE
        // --------------------------------------------------

        if (!wishlist) {

            wishlist = new Wishlist({
                email: req.user.email,

                products: [
                    {
                        productId: product.productId
                    }
                ]
            });

            await wishlist.save();

            return res.status(201).json({
                message: "Product added to wishlist",
                wishlist: wishlist
            });

        }


        // --------------------------------------------------
        // CHECK DUPLICATE PRODUCT
        // --------------------------------------------------

        const alreadyExists =
            wishlist.products.some(
                (item) =>
                    item.productId === product.productId
            );


        if (alreadyExists) {

            return res.status(400).json({
                message: "Product is already in your wishlist",
                wishlist: wishlist
            });

        }


        // --------------------------------------------------
        // ADD PRODUCT
        // --------------------------------------------------

        wishlist.products.push({
            productId: product.productId
        });

        await wishlist.save();


        res.status(200).json({
            message: "Product added to wishlist",
            wishlist: wishlist
        });


    } catch (error) {

        console.error(
            "Add wishlist error:",
            error
        );

        res.status(500).json({
            message: "Failed to add product to wishlist",
            error: error.message
        });

    }

}



// ==========================================================
// REMOVE PRODUCT FROM WISHLIST
// ==========================================================

export async function removeFromWishlist(req, res) {

    if (req.user == null) {

        return res.status(403).json({
            message: "Please login to remove products from your wishlist"
        });

    }

    try {

        const { productId } = req.params;


        if (!productId) {

            return res.status(400).json({
                message: "Product ID is required"
            });

        }


        const wishlist = await Wishlist.findOne({
            email: req.user.email
        });


        if (!wishlist) {

            return res.status(404).json({
                message: "Wishlist not found"
            });

        }


        wishlist.products =
            wishlist.products.filter(
                (item) =>
                    item.productId !== productId
            );


        await wishlist.save();


        res.status(200).json({
            message: "Product removed from wishlist",
            wishlist: wishlist
        });


    } catch (error) {

        console.error(
            "Remove wishlist error:",
            error
        );

        res.status(500).json({
            message: "Failed to remove product from wishlist",
            error: error.message
        });

    }

}



// ==========================================================
// GET CUSTOMER WISHLIST WITH PRODUCT DETAILS
// ==========================================================

export async function getWishlist(req, res) {

    if (req.user == null) {

        return res.status(403).json({
            message: "Please login to view your wishlist"
        });

    }

    try {

        const wishlist = await Wishlist.findOne({
            email: req.user.email
        });

        // --------------------------------------------------
        // CUSTOMER HAS NO WISHLIST YET
        // --------------------------------------------------

        if (!wishlist) {

            return res.status(200).json({
                email: req.user.email,
                products: []
            });

        }


        // --------------------------------------------------
        // GET PRODUCT IDs FROM WISHLIST
        // --------------------------------------------------

        const productIds = wishlist.products.map(
            (item) => item.productId
        );


        // --------------------------------------------------
        // GET ACTUAL PRODUCT DETAILS
        // --------------------------------------------------

        const products = await Product.find({
            productId: {
                $in: productIds
            }
        });


        // --------------------------------------------------
        // RETURN WISHLIST + PRODUCT DETAILS
        // --------------------------------------------------

        res.status(200).json({

            email: wishlist.email,

            products: products

        });


    } catch (error) {

        console.error(
            "Get wishlist error:",
            error
        );

        res.status(500).json({

            message: "Failed to fetch wishlist",

            error: error.message

        });

    }

}



// ==========================================================
// CHECK WHETHER PRODUCT IS IN WISHLIST
// ==========================================================

export async function checkWishlist(req, res) {

    if (req.user == null) {

        return res.status(200).json({
            isWishlisted: false
        });

    }

    try {

        const { productId } = req.params;


        const wishlist = await Wishlist.findOne({
            email: req.user.email
        });


        if (!wishlist) {

            return res.status(200).json({
                isWishlisted: false
            });

        }


        const isWishlisted =
            wishlist.products.some(
                (item) =>
                    item.productId === productId
            );


        res.status(200).json({
            isWishlisted: isWishlisted
        });


    } catch (error) {

        console.error(
            "Check wishlist error:",
            error
        );

        res.status(500).json({
            message: "Failed to check wishlist",
            error: error.message
        });

    }

}