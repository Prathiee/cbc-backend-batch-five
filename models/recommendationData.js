import mongoose from "mongoose";

const recommendationDataSchema = mongoose.Schema({

    productId: {
        type: String,
        required: true,
        unique: true
    },

    skinTypes: [{
        type: String
    }],

    skinConcerns: [{
        type: String
    }],

    budgetLevels: [{
        type: String
    }],

    ingredients: [{
        type: String
    }],

    ingredientWarnings: [{
        type: String
    }],

    // ==========================================
    // SKINCARE ROUTINE STEP
    // ==========================================
    routineStep: {
        type: String,
        enum: [
            "Cleanser",
            "Toner",
            "Serum",
            "Moisturizer",
            "Sunscreen"
        ],
        default: null
    }

});

const RecommendationData = mongoose.model(
    "recommendationData",
    recommendationDataSchema
);

export default RecommendationData;