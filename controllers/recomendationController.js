import RecommendationData from "../models/recommendationData.js";
import Product from "../models/product.js";
import { isAdmin } from "./userController.js";


// ==========================================================
// SAVE RECOMMENDATION DATA
// ==========================================================

export async function saveRecommendation(req, res) {

    if (!isAdmin(req)) {
        return res.status(403).json({
            message: "You are not authorized."
        });
    }

    try {

        const recommendation =
            new RecommendationData(req.body);

        await recommendation.save();

        res.json({
            message:
                "Recommendation data saved successfully."
        });

    } catch (err) {

        console.error(
            "Save recommendation error:",
            err
        );

        res.status(500).json({
            message:
                "Failed to save recommendation.",
            error: err.message
        });
    }
}


// ==========================================================
// GET RECOMMENDATION DATA BY PRODUCT ID
// ==========================================================

export async function getRecommendationByProductId(req, res) {

    try {

        const recommendation =
            await RecommendationData.findOne({
                productId: req.params.productId
            });

        if (!recommendation) {

            return res.status(404).json({
                message:
                    "Recommendation data not found."
            });
        }

        res.json(recommendation);

    } catch (err) {

        console.error(
            "Get recommendation error:",
            err
        );

        res.status(500).json({
            message: "Internal Server Error",
            error: err.message
        });
    }
}


// ==========================================================
// UPDATE RECOMMENDATION DATA
// ==========================================================

export async function updateRecommendation(req, res) {

    try {

        await RecommendationData.updateOne(
            {
                productId: req.params.productId
            },
            req.body
        );

        res.json({
            message:
                "Recommendation Updated Successfully"
        });

    } catch (err) {

        console.error(
            "Update recommendation error:",
            err
        );

        res.status(500).json({
            message:
                "Failed to Update Recommendation",
            error: err.message
        });
    }
}


// ==========================================================
// HELPER: NORMALIZE TEXT
// ==========================================================

function normalize(value) {

    return String(value || "")
        .trim()
        .toLowerCase();
}


// ==========================================================
// HELPER: CHECK ARRAY FOR VALUE
// ==========================================================

function containsValue(array, value) {

    if (!Array.isArray(array)) {
        return false;
    }

    const normalizedValue = normalize(value);

    return array.some(
        item =>
            normalize(item) === normalizedValue
    );
}


// ==========================================================
// HELPER: FIND MATCHING VALUES
// ==========================================================

function findMatches(
    productValues,
    customerValues
) {

    if (
        !Array.isArray(productValues) ||
        !Array.isArray(customerValues)
    ) {
        return [];
    }

    return customerValues.filter(
        customerValue =>
            productValues.some(
                productValue =>
                    normalize(productValue) ===
                    normalize(customerValue)
            )
    );
}


// ==========================================================
// HELPER: GET MAXIMUM BUDGET
// ==========================================================
//
// LOW    = Rs. 1,500 maximum
// MEDIUM = Rs. 3,500 maximum
// HIGH   = No maximum
//
// ==========================================================

function getMaximumBudget(budget) {

    const normalizedBudget =
        normalize(budget);

    if (normalizedBudget === "low") {
        return 1500;
    }

    if (normalizedBudget === "medium") {
        return 3500;
    }

    if (normalizedBudget === "high") {
        return Infinity;
    }

    return null;
}


// ==========================================================
// FIND PERSONALIZED RECOMMENDATIONS
// ==========================================================

export async function findRecommendations(req, res) {

    try {

        // ==================================================
        // GET CUSTOMER QUIZ ANSWERS
        // ==================================================

        const {
            skinType,
            skinConcerns = [],
            budget,
            ingredientWarnings = []
        } = req.body;


        // ==================================================
        // GET ALL RECOMMENDATION RECORDS
        // ==================================================

        const recommendationData =
            await RecommendationData.find({});

        const results = [];

        const excludedReasons = {
    category: 0,
    sensitivity: 0,
    lowMatch: 0
};


        // ==================================================
        // CHECK EVERY RECOMMENDATION RECORD
        // ==================================================

        for (
            const recommendation
            of recommendationData
        ) {


            // ==============================================
            // GET ACTUAL PRODUCT
            // ==============================================

            const product =
                await Product.findOne({
                    productId:
                        recommendation.productId
                });


            // Product no longer exists

            if (!product) {

                console.log(
                    `Skipped ${recommendation.productId} because product was not found.`
                );

                continue;
            }


            // Product unavailable

            if (product.isAvailable === false) {

                console.log(
                    `Skipped ${product.productId} because product is unavailable.`
                );

                continue;
            }

           // ==============================================
// CATEGORY CHECK
// ==============================================

// The current GlowGuide Beauty Quiz is designed
// specifically for skincare recommendations.
// Therefore, only Skin Care products should
// continue to the recommendation scoring.

if (product.category !== "Skin Care") {

    console.log(
        `Excluded ${product.name} because category is ${product.category}`
    );

    excludedReasons.category++;

    continue;
}


            // ==============================================
            // START PRODUCT SCORE
            // ==============================================

            let score = 0;

            const reasons = [];

        

            const helpfulIngredients = [];


            // =============================================
// 1. SMART SKIN TYPE MATCHING
// MAXIMUM = 30 POINTS
// =============================================

const customerSkinType =
    typeof skinType === "string"
        ? skinType.toLowerCase().trim()
        : "";

const supportedSkinTypes =
    Array.isArray(recommendation.skinTypes)
        ? recommendation.skinTypes.map((type) =>
              String(type).toLowerCase().trim()
          )
        : [];

const skinTypeMatched =
    customerSkinType !== "" &&
    supportedSkinTypes.includes(customerSkinType);

if (skinTypeMatched) {

    score += 30;

    reasons.push(
        `Suitable for ${skinType} skin`
    );

    console.log(
        `${product.name} skin type match: ` +
        `${skinType} | Skin score: 30/30`
    );

} else {

    console.log(
        `${product.name} skin type mismatch: ` +
        `Customer = ${skinType || "Not selected"} | ` +
        `Product supports = ${
            supportedSkinTypes.length > 0
                ? supportedSkinTypes.join(", ")
                : "None"
        } | Skin score: 0/30`
    );
}


           // ==============================================
// SKIN CONCERN MATCHING
// Maximum score: 30 points
// ==============================================

const selectedConcerns = Array.isArray(skinConcerns)
    ? skinConcerns
    : [];

const productConcerns = Array.isArray(recommendation.skinConcerns)
    ? recommendation.skinConcerns
    : [];

const matchedConcerns = selectedConcerns.filter(
    (customerConcern) =>
        productConcerns.some(
            (productConcern) =>
                productConcern.toLowerCase().trim() ===
                customerConcern.toLowerCase().trim()
        )
);

if (selectedConcerns.length > 0) {

    const concernScore =
        (matchedConcerns.length / selectedConcerns.length) * 30;

    score += concernScore;

    if (matchedConcerns.length > 0) {
        reasons.push(
            `Supports ${matchedConcerns.join(", ")}`
        );
    }

    console.log(
        `${product.name} concern match: ` +
        `${matchedConcerns.length}/${selectedConcerns.length} ` +
        `| Concern score: ${concernScore.toFixed(1)}/30`
    );

} else {

    console.log(
        `${product.name}: No skin concerns selected`
    );
}
            // ==============================================
            // 3. SMART ACTUAL-PRICE BUDGET MATCHING
            // MAXIMUM = 15 POINTS
            // ==============================================

            const maxBudgetPrice =
                getMaximumBudget(budget);


            console.log(
                `Budget check: ${product.name} | Price: Rs.${product.price} | Customer budget: ${budget} | Max: ${maxBudgetPrice}`
            );


            if (maxBudgetPrice !== null) {


                // ==========================================
                // HIGH BUDGET
                // ==========================================
                //
                // High has no maximum price.
                //

                if (
                    maxBudgetPrice === Infinity
                ) {

                    score += 15;

                    reasons.push(
                        `Fits your ${budget} budget`
                    );
                }


                // ==========================================
                // PRODUCT IS WITHIN CUSTOMER'S BUDGET
                // ==========================================

                else if (
                    product.price <=
                    maxBudgetPrice
                ) {

                    score += 15;

                    reasons.push(
                        `Fits your ${budget} budget (Rs. ${product.price})`
                    );
                }


                // ==========================================
                // PRODUCT IS ABOVE CUSTOMER'S BUDGET
                // ==========================================

                else {

                    const amountOverBudget =
                        product.price -
                        maxBudgetPrice;


                    const percentageOverBudget =
                        (
                            amountOverBudget /
                            maxBudgetPrice
                        ) * 100;


                    // ======================================
                    // SLIGHTLY ABOVE BUDGET
                    // Up to 25% above maximum
                    // ======================================

                    if (
                        percentageOverBudget <= 25
                    ) {

                        reasons.push(
                            `Slightly above your ${budget} budget (Rs. ${product.price})`
                        );

                        console.log(
                            `${product.name} is slightly above budget by ${percentageOverBudget.toFixed(1)}%`
                        );
                    }


                    // ======================================
                    // FAR ABOVE BUDGET
                    // Deduct 15 points
                    // ======================================

                    else {

                        score -= 15;

                        reasons.push(
                            `Above your selected ${budget} budget (Rs. ${product.price})`
                        );

                        console.log(
                            `${product.name} is far above budget by ${percentageOverBudget.toFixed(1)}%`
                        );
                    }
                }
            }


            // ==============================================
// 4. SMART INGREDIENT SAFETY
// MAXIMUM = 25 POINTS
// ==============================================

// Customer sensitivities selected in the Beauty Quiz
const selectedSensitivities = Array.isArray(ingredientWarnings)
    ? ingredientWarnings
    : [];

// Ingredient warnings stored for this product
const productWarnings = Array.isArray(
    recommendation.ingredientWarnings
)
    ? recommendation.ingredientWarnings
    : [];

// Find warnings that conflict with the customer's sensitivities
const conflicts = selectedSensitivities.filter(
    (customerSensitivity) =>
        productWarnings.some(
            (productWarning) =>
                String(productWarning)
                    .toLowerCase()
                    .trim() ===
                String(customerSensitivity)
                    .toLowerCase()
                    .trim()
        )
);

// ==============================================
// CUSTOMER SELECTED SENSITIVITIES
// ==============================================

if (selectedSensitivities.length > 0) {

    console.log(
        `${product.name} sensitivity check: ` +
        `Customer selected = ${selectedSensitivities.join(", ")} | ` +
        `Product warnings = ${
            productWarnings.length > 0
                ? productWarnings.join(", ")
                : "None"
        }`
    );

    // ------------------------------------------
    // SAFETY CONFLICT FOUND
    // ------------------------------------------

    if (conflicts.length > 0) {

    console.log(
        `Excluded ${product.name} because of ` +
        `ingredient sensitivity conflict: ` +
        `${conflicts.join(", ")}`
    );

    // Count products removed because of sensitivity conflicts
    excludedReasons.sensitivity++;

    // Do not recommend a product that conflicts
    // with the customer's selected sensitivities.
    continue;
}
    // ------------------------------------------
    // NO CONFLICT
    // ------------------------------------------

    score += 25;

    reasons.push(
        `No conflict with your selected sensitivities`
    );

    console.log(
        `${product.name} ingredient safety: ` +
        `No conflicts | Safety score: 25/25`
    );

} else {

    // Customer did not provide sensitivity information.
    // Do not claim the product is sensitivity-safe and
    // do not award safety points without evidence.

    reasons.push(
        `No ingredient sensitivities selected`
    );

    console.log(
        `${product.name} ingredient safety: ` +
        `No sensitivities selected | Safety score: 0/25`
    );
}


            // ==============================================
// STEP 1.12 - HELPFUL INGREDIENTS
// ==============================================

if (
    Array.isArray(recommendation.ingredients) &&
    recommendation.ingredients.length > 0
) {
    recommendation.ingredients.forEach((ingredient) => {

        if (
            ingredient &&
            !helpfulIngredients.some(
                (item) =>
                    item.toLowerCase().trim() ===
                    ingredient.toLowerCase().trim()
            )
        ) {
            helpfulIngredients.push(ingredient);
        }
    });
}

console.log(
    `${product.name} helpful ingredients:`,
    helpfulIngredients.length > 0
        ? helpfulIngredients
        : "None listed"
);


            // ==============================================
            // FINAL MATCH PERCENTAGE
            // ==============================================
            //
            // Skin Type         = 30
            // Skin Concerns     = 30
            // Budget            = 15
            // Ingredient Safety = 25
            // -----------------------------
            // Maximum           = 100
            //
            // Budget can also deduct 15
            // when a product is far too expensive.
            //
            // ==============================================

            const matchPercentage =
                Math.max(
                    0,
                    Math.min(
                        100,
                        Math.round(score)
                    )
                );


            console.log(
                `${product.name} final match: ${matchPercentage}%`
            );


            // ==============================================
            // ONLY SHOW PRODUCTS WITH 35% OR MORE
            // ==============================================

            if (matchPercentage >= 35) {

    let matchLevel = "";

    if (matchPercentage >= 85) {
        matchLevel = "Excellent Match";
    } else if (matchPercentage >= 70) {
        matchLevel = "Great Match";
    } else if (matchPercentage >= 50) {
        matchLevel = "Good Match";
    } else {
        matchLevel = "Possible Match";
    }

    const explanation =
        reasons.length > 0
            ? reasons.join(". ") + "."
            : "This product matches your selected beauty preferences.";

    results.push({
        product,
        matchPercentage,
        matchLevel,
        explanation,
        reasons,
        matchedConcerns,
        helpfulIngredients
    });

} else {

    excludedReasons.lowMatch++;

    console.log(
        `Excluded ${product.name} because match percentage is only ${matchPercentage}%`
    );
}
        }
        // ==============================================
// STEP 1.9 - RANK RECOMMENDATIONS
// Highest match percentage comes first
// ==============================================

results.sort((a, b) => {
    return b.matchPercentage - a.matchPercentage;
});

console.log(
    "Ranked recommendations:",
    results.map(item => ({
        product: item.product.name,
        match: `${item.matchPercentage}%`,
        level: item.matchLevel,
        explanation: item.explanation,
        helpfulIngredients: item.helpfulIngredients
    }))
);

// ======================================
// STEP 1.13 - HANDLE NO MATCH RESULTS
// ======================================

if (results.length === 0) {

    let noMatchMessage =
        "We couldn't find a suitable product for your current preferences.";

    if (excludedReasons.sensitivity > 0) {

        noMatchMessage =
            "We couldn't find a safe match. Some products were removed because they conflict with your selected ingredient sensitivities.";

    } else if (excludedReasons.lowMatch > 0) {

        noMatchMessage =
            "We couldn't find a strong enough match for your current skin needs and preferences.";

    }

    return res.json({
        recommendations: [],
        noMatch: true,
        message: noMatchMessage,
        excludedReasons
    });
}

        // ==================================================
        // RETURN RECOMMENDATIONS
        // ==================================================

        return res.json({
    recommendations: results,
    noMatch: false,
    message: `GlowGuide found ${results.length} suitable product${results.length === 1 ? "" : "s"} for you.`,
    totalMatches: results.length
});

    } catch (err) {

        console.error(
            "Recommendation Error:",
            err
        );


        res.status(500).json({

            message:
                "Failed to find recommendations.",

            error:
                err.message
        });
    }
}


// ==========================================================
// GLOWGUIDE CHATBOT
// ==========================================================
//
// We are leaving the chatbot functionality unchanged
// for now. We will improve it in a later step.
//
// ==========================================================

export async function chatWithGlowGuide(
    req,
    res
) {

    try {

        const { question } = req.body;

        const q =
            question.toLowerCase();

        let reply = "";

        let product = null;


        if (q.includes("oily")) {

            product =
                await Product.findOne({
                    productId: "COSM002"
                });


            if (product) {

                reply =
                    `For oily skin, I recommend ${product.name}.`;

            } else {

                reply =
                    "I can help you find products for oily skin.";
            }

        }


        else if (q.includes("dry")) {

            reply =
                "Use products containing Hyaluronic Acid and Ceramides.";

        }


        else if (q.includes("acne")) {

            reply =
                "Products containing Salicylic Acid and Niacinamide work well for acne.";

        }


        else {

            reply =
                "I'm still learning. Please ask another skincare question.";
        }


        res.json({
            reply,
            product
        });


    } catch (err) {

        console.error(
            "GlowGuide chatbot error:",
            err
        );


        res.status(500).json({

            message:
                "Failed to answer.",

            error:
                err.message
        });
    }
}