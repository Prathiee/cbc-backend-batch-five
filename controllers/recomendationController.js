import RecommendationData from "../models/recommendationData.js";
import Product from "../models/product.js";
import { isAdmin } from "./userController.js";

export async function saveRecommendation(req, res) {

    if (!isAdmin(req)) {
        return res.status(403).json({
            message: "You are not authorized."
        });
    }

    try {

        const recommendation = new RecommendationData(req.body);

        await recommendation.save();

        res.json({
            message: "Recommendation data saved successfully."
        });

    } catch (err) {

        res.status(500).json({
            message: "Failed to save recommendation.",
            error: err
        });

    }

}

export async function getRecommendationByProductId(req, res) {

    try {

        const recommendation = await RecommendationData.findOne({
            productId: req.params.productId
        });

        if (!recommendation) {

            return res.status(404).json({
                message: "Recommendation data not found."
            });

        }

        res.json(recommendation);

    } catch (err) {

        res.status(500).json({
            message: "Internal Server Error",
            error: err
        });

    }

}

export async function updateRecommendation(req, res){

    try{

        await RecommendationData.updateOne(

            {
                productId : req.params.productId
            },

            req.body

        );

        res.json({

            message : "Recommendation Updated Successfully"

        });

    }catch(err){

        res.status(500).json({

            message : "Failed to Update Recommendation",

            error : err

        });

    }

}

export async function findRecommendations(req, res) {

    try {

        const {

            skinType,

            skinConcerns,

            budget,

            ingredientWarnings

        } = req.body;

        const recommendations = await RecommendationData.find({

            skinTypes: skinType,

            skinConcerns: {

                $in: skinConcerns

            },

            budgetLevels: budget,

            ingredientWarnings: {
    $in: ingredientWarnings
}

        });

        const productIds = recommendations.map(item => item.productId);

        const products = await Product.find({

            productId: {

                $in: productIds

            }

        });

        res.json(products);

    }

    catch (err) {

        res.status(500).json({

            message: "Failed to find recommendations.",

            error: err

        });

    }

}

export async function chatWithGlowGuide(req, res) {

    try {

        const { question } = req.body;

        const q = question.toLowerCase();

        let reply = "";
        let product = null;

        if (q.includes("oily")) {

            product = await Product.findOne({
                productId: "COSM002"
            });

            reply = `For oily skin, I recommend ${product.name}.`;

        }

        else if (q.includes("dry")) {

            reply = "Use products containing Hyaluronic Acid and Ceramides.";

        }

        else if (q.includes("acne")) {

            reply = "Products containing Salicylic Acid and Niacinamide work well for acne.";

        }

        else {

            reply = "I'm still learning. Please ask another skincare question.";

        }

        res.json({

            reply,

            product

        });

    }

    catch (err) {

        res.status(500).json({

            message: "Failed to answer.",

            error: err

        });

    }

}