import Product from "../models/product.js";
import User from "../models/user.js";
import beautyKnowledge from "../data/beautyKnowledge.js";
import RecommendationData from "../models/recommendationData.js";
import axios from "axios";

export async function sendChatMessage(req, res) {

    try {

        const { message, lastProduct } = req.body;

        // ==================================================
        // 1. VALIDATE MESSAGE
        // ==================================================

        if (!message || message.trim() === "") {

            return res.status(400).json({
                message: "Please enter a message."
            });

        }

        console.log("GlowGuide received:", message);
        console.log("GlowGuide received lastProduct:", lastProduct);

        const userMessage = message
            .toLowerCase()
            .trim();


        // ==================================================
        // CUSTOMER BEAUTY PROFILE
        // ==================================================

        let customer = null;
        let beautyProfile = null;

        if (req.user && req.user.userId) {

            customer = await User.findById(
                req.user.userId
            );

            if (
                customer &&
                customer.beautyProfile
            ) {

                beautyProfile =
                    customer.beautyProfile;

                console.log(
                    "GlowGuide loaded beauty profile:",
                    beautyProfile
                );
            }
        }


        // ==================================================
        // 2. SIMPLE GREETINGS
        // ==================================================

        const greetings = [
            "hello",
            "hi",
            "hey",
            "hello glowguide",
            "hi glowguide",
            "hey glowguide"
        ];

        if (greetings.includes(userMessage)) {

            return res.status(200).json({
                reply:
                    "Hello! 🌸 I'm GlowGuide, your personal beauty assistant. How can I help you today?"
            });

        }


        // ==================================================
        // 3. BEAUTY PROFILE QUESTIONS
        // ==================================================

        const askingSkinType =
            userMessage.includes("my skin type") ||
            userMessage.includes(
                "what skin type do i have"
            ) ||
            userMessage.includes(
                "what is my skin"
            );

        const askingSkinConcerns =
            userMessage.includes(
                "my skin concerns"
            ) ||
            userMessage.includes(
                "my concerns"
            ) ||
            userMessage.includes(
                "what are my skin concerns"
            );

        const askingBeautyBudget =
            userMessage.includes("my budget") ||
            userMessage.includes(
                "what is my budget"
            ) ||
            userMessage.includes(
                "budget preference"
            );

        const askingSensitivities =
            userMessage.includes(
                "my sensitivities"
            ) ||
            userMessage.includes(
                "my ingredient sensitivities"
            ) ||
            userMessage.includes(
                "what ingredients should i avoid"
            );

        const askingBeautyProfile =
            userMessage.includes(
                "my beauty profile"
            ) ||
            userMessage.includes(
                "show my profile"
            ) ||
            userMessage.includes(
                "show me my beauty profile"
            );


        const askingAnyProfileQuestion =
            askingSkinType ||
            askingSkinConcerns ||
            askingBeautyBudget ||
            askingSensitivities ||
            askingBeautyProfile;


        // --------------------------------------------------
        // User has not completed Beauty Quiz
        // --------------------------------------------------

        if (
            askingAnyProfileQuestion &&
            (
                !beautyProfile ||
                beautyProfile.completed !== true
            )
        ) {

            return res.status(200).json({
                reply:
                    "🌸 I don't have a completed Beauty Profile for you yet.\n\n" +
                    "Please complete the GlowGuide Beauty Quiz first so I can learn your skin type, concerns, budget and ingredient sensitivities."
            });

        }


        // --------------------------------------------------
        // SKIN TYPE
        // --------------------------------------------------

        if (
            askingSkinType &&
            beautyProfile
        ) {

            return res.status(200).json({
                reply:
                    `🌸 According to your GlowGuide Beauty Profile, your skin type is ${beautyProfile.skinType}.`
            });

        }


        // --------------------------------------------------
        // SKIN CONCERNS
        // --------------------------------------------------

        if (
            askingSkinConcerns &&
            beautyProfile
        ) {

            const concerns =
                beautyProfile.skinConcerns &&
                beautyProfile.skinConcerns.length > 0
                    ? beautyProfile.skinConcerns.join(", ")
                    : "No specific skin concerns selected";

            return res.status(200).json({
                reply:
                    `🌸 Your saved skin concerns are: ${concerns}.`
            });

        }


        // --------------------------------------------------
        // BUDGET
        // --------------------------------------------------

        if (
            askingBeautyBudget &&
            beautyProfile
        ) {

            return res.status(200).json({
                reply:
                    `💰 Your saved beauty budget preference is ${beautyProfile.budget}.`
            });

        }


        // --------------------------------------------------
        // INGREDIENT SENSITIVITIES
        // --------------------------------------------------

        if (
            askingSensitivities &&
            beautyProfile
        ) {

            const sensitivities =
                beautyProfile.sensitivities &&
                beautyProfile.sensitivities.length > 0
                    ? beautyProfile.sensitivities.join(", ")
                    : "None selected";

            return res.status(200).json({
                reply:
                    `🧪 Your saved ingredient sensitivities are: ${sensitivities}.`
            });

        }


        // --------------------------------------------------
        // FULL BEAUTY PROFILE
        // --------------------------------------------------

        if (
            askingBeautyProfile &&
            beautyProfile
        ) {

            const concerns =
                beautyProfile.skinConcerns &&
                beautyProfile.skinConcerns.length > 0
                    ? beautyProfile.skinConcerns.join(", ")
                    : "None selected";

            const sensitivities =
                beautyProfile.sensitivities &&
                beautyProfile.sensitivities.length > 0
                    ? beautyProfile.sensitivities.join(", ")
                    : "None selected";

            return res.status(200).json({

                reply:
                    `🌸 Your GlowGuide Beauty Profile\n\n` +
                    `Skin Type: ${beautyProfile.skinType}\n` +
                    `Skin Concerns: ${concerns}\n` +
                    `Budget: ${beautyProfile.budget}\n` +
                    `Ingredient Sensitivities: ${sensitivities}`

            });

        }


        // ==========================================================
        // 4. PERSONALIZED PRODUCT RECOMMENDATION
        // FROM SAVED BEAUTY PROFILE
        // ==========================================================

        const personalizedRecommendationPatterns = [

            "recommend products for me",
            "recommend a product for me",
            "recommend something for me",

            "what products do you recommend",
            "what product do you recommend",

            "what should i buy",
            "what should i use",

            "find products for me",
            "find a product for me",

            "suggest products for me",
            "suggest a product for me"

        ];


        const askingForPersonalizedRecommendation =
            personalizedRecommendationPatterns.some(
                (pattern) =>
                    userMessage.includes(pattern)
            );


        if (askingForPersonalizedRecommendation) {

            console.log(
                "GlowGuide detected personalized recommendation request"
            );


            // ------------------------------------------
            // USER MUST BE LOGGED IN
            // ------------------------------------------

            if (!req.user) {

                return res.status(200).json({

                    reply:
                        "🌸 Please log in first so I can use your saved Beauty Profile to recommend suitable products."

                });

            }


            // ------------------------------------------
            // USER MUST HAVE COMPLETED BEAUTY QUIZ
            // ------------------------------------------

            if (
                !beautyProfile ||
                beautyProfile.completed !== true
            ) {

                return res.status(200).json({

                    reply:
                        "🌸 I don't have a completed Beauty Profile for you yet.\n\n" +

                        "Please complete the GlowGuide Beauty Quiz first, then I can recommend products based on your skin type, concerns, budget and ingredient sensitivities."

                });

            }


            const {
                skinType,
                skinConcerns = [],
                budget,
                sensitivities = []
            } = beautyProfile;


            console.log(
                "GlowGuide personalized recommendation profile:",
                {
                    skinType,
                    skinConcerns,
                    budget,
                    sensitivities
                }
            );


            // ------------------------------------------
            // GET RECOMMENDATION DATA
            // ------------------------------------------

            const recommendationRecords =
                await RecommendationData.find({});


            console.log(
                `GlowGuide checking ${recommendationRecords.length} recommendation records`
            );


            const personalizedProducts = [];


            // ------------------------------------------
            // CHECK EACH RECOMMENDATION
            // ------------------------------------------

            for (
                const recommendation
                of recommendationRecords
            ) {

                const product =
                    await Product.findOne({

                        productId:
                            recommendation.productId

                    });


                // Product does not exist
                if (!product) {

                    console.log(
                        "GlowGuide skipped recommendation because product was not found:",
                        recommendation.productId
                    );

                    continue;

                }


                // Product unavailable
                if (
                    product.isAvailable === false
                ) {

                    console.log(
                        "GlowGuide skipped unavailable product:",
                        product.name
                    );

                    continue;

                }


                // Only Skin Care products
                if (
                    !product.category ||
                    product.category
                        .toLowerCase()
                        .trim() !==
                        "skin care"
                ) {

                    continue;

                }


                // ==========================================
                // INGREDIENT SAFETY
                // ==========================================

                const productWarnings =
                    Array.isArray(
                        recommendation.ingredientWarnings
                    )
                        ? recommendation
                              .ingredientWarnings
                        : [];


                const hasSensitivityConflict =
                    sensitivities.some(
                        (sensitivity) =>

                            productWarnings.some(
                                (warning) =>

                                    String(warning)
                                        .toLowerCase()
                                        .trim() ===

                                    String(sensitivity)
                                        .toLowerCase()
                                        .trim()
                            )
                    );


                // NEVER recommend conflicting product
                if (hasSensitivityConflict) {

                    console.log(
                        `GlowGuide excluded ${product.name} because of ingredient sensitivity conflict`
                    );

                    continue;

                }


                // ==========================================
                // CALCULATE SCORE
                // ==========================================

                let score = 0;

                const reasons = [];


                // ------------------------------------------
                // SKIN TYPE SCORE = 30
                // ------------------------------------------

                const supportedSkinTypes =
                    Array.isArray(
                        recommendation.skinTypes
                    )
                        ? recommendation.skinTypes.map(
                              (type) =>
                                  String(type)
                                      .toLowerCase()
                                      .trim()
                          )
                        : [];


                if (
                    skinType &&
                    supportedSkinTypes.includes(
                        skinType
                            .toLowerCase()
                            .trim()
                    )
                ) {

                    score += 30;

                    reasons.push(
                        `Suitable for ${skinType} skin`
                    );

                }


                // ------------------------------------------
                // SKIN CONCERN SCORE = 30
                // ------------------------------------------

                const productConcerns =
                    Array.isArray(
                        recommendation.skinConcerns
                    )
                        ? recommendation.skinConcerns
                        : [];


                const matchedConcerns =
                    skinConcerns.filter(
                        (concern) =>

                            productConcerns.some(
                                (productConcern) =>

                                    String(productConcern)
                                        .toLowerCase()
                                        .trim() ===

                                    String(concern)
                                        .toLowerCase()
                                        .trim()
                            )
                    );


                if (
                    skinConcerns.length > 0
                ) {

                    const concernScore =
                        (
                            matchedConcerns.length /
                            skinConcerns.length
                        ) * 30;


                    score += concernScore;


                    if (
                        matchedConcerns.length > 0
                    ) {

                        reasons.push(
                            `Supports ${matchedConcerns.join(", ")}`
                        );

                    }

                }


                // ------------------------------------------
                // BUDGET SCORE = 15
                // ------------------------------------------

                const productPrice =
                    Number(product.price);


                let budgetScore = 0;


                if (
                    budget &&
                    budget.toLowerCase() === "low"
                ) {

                    if (
                        productPrice <= 1000
                    ) {

                        budgetScore = 15;

                    } else if (
                        productPrice <= 1500
                    ) {

                        budgetScore = 10;

                    } else if (
                        productPrice <= 2000
                    ) {

                        budgetScore = 5;

                    }

                } else if (
                    budget &&
                    budget.toLowerCase() === "medium"
                ) {

                    if (
                        productPrice > 1000 &&
                        productPrice <= 2000
                    ) {

                        budgetScore = 15;

                    } else if (
                        productPrice > 2000 &&
                        productPrice <= 3500
                    ) {

                        budgetScore = 10;

                    } else if (
                        productPrice <= 1000
                    ) {

                        budgetScore = 8;

                    }

                } else if (
                    budget &&
                    budget.toLowerCase() === "high"
                ) {

                    if (
                        productPrice >= 2000
                    ) {

                        budgetScore = 15;

                    } else if (
                        productPrice >= 1500
                    ) {

                        budgetScore = 10;

                    } else {

                        budgetScore = 5;

                    }

                }


                score += budgetScore;


                if (budget) {

                    reasons.push(
                        `Matches your ${budget} budget preference`
                    );

                }


                // ------------------------------------------
                // INGREDIENT SAFETY SCORE = 25
                // ------------------------------------------

                // No conflict already confirmed above.
                // Therefore this product is safe according
                // to the user's selected quiz sensitivities.

                score += 25;


                if (
                    sensitivities.length > 0
                ) {

                    reasons.push(
                        "No conflict with your saved ingredient sensitivities"
                    );

                } else {

                    reasons.push(
                        "No ingredient sensitivities were selected"
                    );

                }


                // ------------------------------------------
                // FINAL MATCH PERCENTAGE
                // ------------------------------------------

                const matchPercentage =
                    Math.max(
                        0,
                        Math.min(
                            100,
                            Math.round(score)
                        )
                    );


                console.log(
                    `GlowGuide match: ${product.name} = ${matchPercentage}%`
                );


                // Only reasonable matches
                if (
                    matchPercentage >= 35
                ) {

                    personalizedProducts.push({

                        product,
                        matchPercentage,
                        reasons

                    });

                }

            }


            // ------------------------------------------
            // HIGHEST MATCH FIRST
            // ------------------------------------------

            personalizedProducts.sort(
                (a, b) =>
                    b.matchPercentage -
                    a.matchPercentage
            );


            // ------------------------------------------
            // NO PRODUCTS FOUND
            // ------------------------------------------

            if (
                personalizedProducts.length === 0
            ) {

                return res.status(200).json({

                    reply:
                        "🌸 I couldn't find a suitable GlowNest product that matches your saved Beauty Profile right now.\n\n" +

                        "I also avoided products that conflict with your ingredient sensitivities."

                });

            }


            // ------------------------------------------
            // ONLY BEST 3 PRODUCTS
            // ------------------------------------------

            const topProducts =
                personalizedProducts.slice(
                    0,
                    3
                );


            const productText =
                topProducts
                    .map(
                        (item, index) =>

                            `${index + 1}. ${item.product.name}\n` +

                            `   Rs. ${item.product.price}\n` +

                            `   Match: ${item.matchPercentage}%`
                    )
                    .join("\n\n");


            // ------------------------------------------
            // CREATE PROFILE DESCRIPTION
            // ------------------------------------------

            const concernText =
                skinConcerns.length > 0
                    ? skinConcerns.join(", ")
                    : "your general skin needs";


            const sensitivityText =
                sensitivities.length > 0
                    ? sensitivities.join(", ")
                    : "no selected ingredient sensitivities";


            // ------------------------------------------
            // SEND RECOMMENDATIONS
            // ------------------------------------------

            return res.status(200).json({

                reply:

                    `🌸 Based on your saved GlowGuide Beauty Profile, these are my top recommendations:\n\n` +

                    `${productText}\n\n` +

                    `I considered your ${skinType} skin, ` +

                    `${concernText}, ` +

                    `${budget} budget and ` +

                    `${sensitivityText}. ✨`,


                recommendations:

                    topProducts.map(
                        (item) => ({

                            productId:
                                item.product.productId,

                            name:
                                item.product.name,

                            price:
                                item.product.price,

                            matchPercentage:
                                item.matchPercentage,

                            reasons:
                                item.reasons

                        })
                    )

            });

        }


        // ==================================================
        // 5. GET AVAILABLE PRODUCTS FROM DATABASE
        // ==================================================

        const products =
            await Product.find({
                isAvailable: true
            });


        console.log(
            `GlowGuide checking ${products.length} available products`
        );


        // ==================================================
        // 6. BUDGET SEARCH
        // ==================================================

        const budgetWords = [
            "under",
            "below",
            "less than"
        ];


        const askingBudget =
            budgetWords.some(
                (word) =>
                    userMessage.includes(word)
            );


        if (askingBudget) {

            const numbers =
                userMessage.match(/\d+/g);


            if (
                numbers &&
                numbers.length > 0
            ) {

                const maximumPrice =
                    Number(numbers[0]);


                const affordableProducts =
                    products
                        .filter(
                            (product) =>
                                product.price <=
                                maximumPrice
                        )
                        .sort(
                            (a, b) =>
                                a.price -
                                b.price
                        );


                if (
                    affordableProducts.length === 0
                ) {

                    return res.status(200).json({

                        reply:
                            `Sorry 🌸 I couldn't find any available products under Rs. ${maximumPrice}.`

                    });

                }


                const productList =
                    affordableProducts
                        .map(
                            (product) =>
                                `• ${product.name} - Rs. ${product.price}`
                        )
                        .join("\n");


                return res.status(200).json({

                    reply:
                        `Here are products within Rs. ${maximumPrice} 🌸\n\n${productList}`

                });

            }

        }

        // ==================================================
// 6.5 PERSONALIZED SKINCARE ROUTINE
// ==================================================

const skincareRoutinePatterns = [
    "create a skincare routine for me",
    "create skincare routine for me",
    "create my skincare routine",
    "make a skincare routine for me",
    "make me a skincare routine",
    "give me a skincare routine",
    "what skincare routine should i use",
    "what skin care routine should i use",
    "skincare routine for me",
    "skin care routine for me",
    "my skincare routine",
    "my skin care routine"
];

const askingForSkincareRoutine =
    skincareRoutinePatterns.some(
        (pattern) =>
            userMessage.includes(pattern)
    );

if (askingForSkincareRoutine) {

    console.log(
        "GlowGuide detected personalized skincare routine request"
    );

    // ------------------------------------------
    // USER MUST BE LOGGED IN
    // ------------------------------------------

    if (!req.user) {

        return res.status(200).json({
            reply:
                "🌸 Please log in first so I can use your saved Beauty Profile to create a personalized skincare routine."
        });
    }

    // ------------------------------------------
    // BEAUTY QUIZ MUST BE COMPLETED
    // ------------------------------------------

    if (
        !beautyProfile ||
        beautyProfile.completed !== true
    ) {

        return res.status(200).json({
            reply:
                "🌸 I don't have a completed Beauty Profile for you yet.\n\n" +
                "Please complete the GlowGuide Beauty Quiz first. Then I can create a skincare routine based on your skin type, concerns and ingredient sensitivities."
        });
    }

    // ------------------------------------------
// GET SAFE SKINCARE PRODUCTS
// ------------------------------------------

const routineProducts = products.filter((product) => {

    // Only available Skin Care products
    if (
        !product.category ||
        product.category.toLowerCase().trim() !== "skin care"
    ) {
        return false;
    }

    if (
        product.isAvailable === false ||
        Number(product.stock) <= 0
    ) {
        return false;
    }

    return true;
});

console.log(
    `GlowGuide found ${routineProducts.length} available skincare products for routine`
);

console.log("GlowGuide routine products:");

routineProducts.forEach((product) => {
    console.log({
        productId: product.productId,
        name: product.name,
        category: product.category,
        price: product.price,
        stock: product.stock
    });
});

// ------------------------------------------
// IDENTIFY PRODUCTS FOR ROUTINE STEPS
// ------------------------------------------

const routineCleanser = routineProducts.find((product) => {

    const name = product.name.toLowerCase();

    return (
        name.includes("cleanser") ||
        name.includes("face wash") ||
        name.includes("facewash")
    );
});


const routineSerum = routineProducts.find((product) => {

    const name = product.name.toLowerCase();

    return (
        name.includes("serum")
    );
});


const routineMoisturizer = routineProducts.find((product) => {

    const name = product.name.toLowerCase();

    return (
        name.includes("moisturizer") ||
        name.includes("moisturiser") ||
        name.includes("face cream")
    );
});


const routineSunscreen = routineProducts.find((product) => {

    const name = product.name.toLowerCase();

    return (
        name.includes("sunscreen") ||
        name.includes("sun screen") ||
        name.includes("spf")
    );
});


console.log("GlowGuide routine product matches:");

console.log(
    "Cleanser:",
    routineCleanser
        ? routineCleanser.name
        : "No matching product"
);

console.log(
    "Serum:",
    routineSerum
        ? routineSerum.name
        : "No matching product"
);

console.log(
    "Moisturizer:",
    routineMoisturizer
        ? routineMoisturizer.name
        : "No matching product"
);

console.log(
    "Sunscreen:",
    routineSunscreen
        ? routineSunscreen.name
        : "No matching product"
);

// ------------------------------------------
// LOAD ROUTINE RECOMMENDATION DATA
// ------------------------------------------

const routineRecommendationRecords =
    await RecommendationData.find({});

console.log(
    `GlowGuide loaded ${routineRecommendationRecords.length} recommendation records for routine`
);


// ------------------------------------------
// FIND RECOMMENDATION DATA FOR A PRODUCT
// ------------------------------------------

function getRoutineRecommendation(product) {

    if (!product) {
        return null;
    }

    return routineRecommendationRecords.find(
        (record) =>
            String(record.productId)
                .toLowerCase()
                .trim() ===
            String(product.productId)
                .toLowerCase()
                .trim()
    );
}


const cleanserRecommendation =
    getRoutineRecommendation(routineCleanser);

const serumRecommendation =
    getRoutineRecommendation(routineSerum);

const moisturizerRecommendation =
    getRoutineRecommendation(routineMoisturizer);

const sunscreenRecommendation =
    getRoutineRecommendation(routineSunscreen);


console.log("GlowGuide routine recommendation data:");

console.log(
    "Cleanser:",
    cleanserRecommendation
        ? "Recommendation data found"
        : "No recommendation data"
);

console.log(
    "Serum:",
    serumRecommendation
        ? "Recommendation data found"
        : "No recommendation data"
);

console.log(
    "Moisturizer:",
    moisturizerRecommendation
        ? "Recommendation data found"
        : "No recommendation data"
);

console.log(
    "Sunscreen:",
    sunscreenRecommendation
        ? "Recommendation data found"
        : "No recommendation data"
);

    // ------------------------------------------
    // GET SAVED PROFILE
    // ------------------------------------------

    const routineSkinType =
        beautyProfile.skinType || "Not selected";

    const routineConcerns =
        Array.isArray(beautyProfile.skinConcerns)
            ? beautyProfile.skinConcerns
            : [];

    const routineSensitivities =
        Array.isArray(beautyProfile.sensitivities)
            ? beautyProfile.sensitivities
            : [];

    // ------------------------------------------
    // BASIC MORNING ROUTINE
    // ------------------------------------------

    let morningRoutine = [
        "1. Gentle cleanser",
        "2. Moisturizer",
        "3. Sunscreen"
    ];

    // ------------------------------------------
    // BASIC NIGHT ROUTINE
    // ------------------------------------------

    let nightRoutine = [
        "1. Gentle cleanser",
        "2. Moisturizer"
    ];

    // ------------------------------------------
    // PERSONALIZE FOR DRY SKIN
    // ------------------------------------------

    if (
        routineSkinType.toLowerCase() === "dry"
    ) {

        morningRoutine = [
            "1. Gentle cleanser",
            "2. Hydrating ingredient such as Hyaluronic Acid",
            "3. Moisturizer",
            "4. Sunscreen"
        ];

        nightRoutine = [
            "1. Gentle cleanser",
            "2. Hydrating ingredient such as Hyaluronic Acid",
            "3. Moisturizer or barrier-supporting cream"
        ];
    }

    // ------------------------------------------
    // PERSONALIZE FOR OILY SKIN
    // ------------------------------------------

    else if (
        routineSkinType.toLowerCase() === "oily"
    ) {

        morningRoutine = [
            "1. Gentle cleanser",
            "2. Niacinamide",
            "3. Lightweight moisturizer",
            "4. Sunscreen"
        ];

        nightRoutine = [
            "1. Gentle cleanser",
            "2. Niacinamide",
            "3. Lightweight moisturizer"
        ];
    }

    // ------------------------------------------
    // PERSONALIZE FOR COMBINATION SKIN
    // ------------------------------------------

    else if (
        routineSkinType.toLowerCase() === "combination"
    ) {

        morningRoutine = [
            "1. Gentle cleanser",
            "2. Niacinamide or a hydrating serum",
            "3. Lightweight moisturizer",
            "4. Sunscreen"
        ];

        nightRoutine = [
            "1. Gentle cleanser",
            "2. Hydrating serum",
            "3. Lightweight moisturizer"
        ];
    }

    // ------------------------------------------
    // PERSONALIZE FOR SENSITIVE SKIN
    // ------------------------------------------

    else if (
        routineSkinType.toLowerCase() === "sensitive"
    ) {

        morningRoutine = [
            "1. Gentle cleanser",
            "2. Gentle hydrating product",
            "3. Moisturizer",
            "4. Sunscreen"
        ];

        nightRoutine = [
            "1. Gentle cleanser",
            "2. Gentle hydrating product",
            "3. Moisturizer"
        ];
    }

    // ------------------------------------------
    // PERSONALIZE FOR NORMAL SKIN
    // ------------------------------------------

    else if (
        routineSkinType.toLowerCase() === "normal"
    ) {

        morningRoutine = [
            "1. Gentle cleanser",
            "2. Hydrating serum",
            "3. Moisturizer",
            "4. Sunscreen"
        ];

        nightRoutine = [
            "1. Gentle cleanser",
            "2. Hydrating serum",
            "3. Moisturizer"
        ];
    }

    // ------------------------------------------
    // PROFILE TEXT
    // ------------------------------------------

    const routineConcernText =
        routineConcerns.length > 0
            ? routineConcerns.join(", ")
            : "None selected";

    const routineSensitivityText =
        routineSensitivities.length > 0
            ? routineSensitivities.join(", ")
            : "None selected";

      // ------------------------------------------
// CHECK PRODUCT SUITABILITY FOR PROFILE
// ------------------------------------------

function isRoutineProductSuitable(product, recommendation) {

    // Product or recommendation data missing
    if (!product || !recommendation) {
        return false;
    }

    const profileSkinType =
        String(routineSkinType)
            .toLowerCase()
            .trim();

    const profileConcerns =
        routineConcerns.map(
            (concern) =>
                String(concern)
                    .toLowerCase()
                    .trim()
        );

    const profileSensitivities =
        routineSensitivities.map(
            (sensitivity) =>
                String(sensitivity)
                    .toLowerCase()
                    .trim()
        );


    // ------------------------------------------
    // CHECK SKIN TYPE
    // ------------------------------------------

    const supportedSkinTypes =
        Array.isArray(recommendation.skinTypes)
            ? recommendation.skinTypes.map(
                (type) =>
                    String(type)
                        .toLowerCase()
                        .trim()
            )
            : [];

    const skinTypeMatch =
        supportedSkinTypes.includes(
            profileSkinType
        );


    // ------------------------------------------
    // CHECK SKIN CONCERNS
    // ------------------------------------------

    const supportedConcerns =
        Array.isArray(recommendation.skinConcerns)
            ? recommendation.skinConcerns.map(
                (concern) =>
                    String(concern)
                        .toLowerCase()
                        .trim()
            )
            : [];

    const concernMatch =
        profileConcerns.length === 0 ||
        profileConcerns.some(
            (concern) =>
                supportedConcerns.includes(concern)
        );


    // ------------------------------------------
    // CHECK INGREDIENT SENSITIVITIES
    // ------------------------------------------

    const warnings =
        Array.isArray(recommendation.ingredientWarnings)
            ? recommendation.ingredientWarnings.map(
                (warning) =>
                    String(warning)
                        .toLowerCase()
                        .trim()
            )
            : [];

    const hasSensitivityConflict =
        profileSensitivities.some(
            (sensitivity) =>
                warnings.includes(sensitivity)
        );


    // ------------------------------------------
    // FINAL RESULT
    // ------------------------------------------

    return (
        skinTypeMatch &&
        concernMatch &&
        !hasSensitivityConflict
    );
}


// ------------------------------------------
// CHECK CURRENT ROUTINE PRODUCTS
// ------------------------------------------

const safeRoutineCleanser =
    isRoutineProductSuitable(
        routineCleanser,
        cleanserRecommendation
    )
        ? routineCleanser
        : null;


const safeRoutineSerum =
    isRoutineProductSuitable(
        routineSerum,
        serumRecommendation
    )
        ? routineSerum
        : null;


const safeRoutineMoisturizer =
    isRoutineProductSuitable(
        routineMoisturizer,
        moisturizerRecommendation
    )
        ? routineMoisturizer
        : null;


const safeRoutineSunscreen =
    isRoutineProductSuitable(
        routineSunscreen,
        sunscreenRecommendation
    )
        ? routineSunscreen
        : null;


// ------------------------------------------
// TEST RESULTS
// ------------------------------------------

console.log(
    "GlowGuide suitable routine products:"
);

console.log(
    "Cleanser:",
    safeRoutineCleanser
        ? safeRoutineCleanser.name
        : "No suitable product"
);

console.log(
    "Serum:",
    safeRoutineSerum
        ? safeRoutineSerum.name
        : "No suitable product"
);

console.log(
    "Moisturizer:",
    safeRoutineMoisturizer
        ? safeRoutineMoisturizer.name
        : "No suitable product"
);

console.log(
    "Sunscreen:",
    safeRoutineSunscreen
        ? safeRoutineSunscreen.name
        : "No suitable product"
);      

    // ------------------------------------------
    // SEND ROUTINE
    // ------------------------------------------

    return res.status(200).json({

        reply:
            `🌸 Here is your personalized GlowGuide skincare routine.\n\n` +

            `Your Beauty Profile:\n` +
            `Skin Type: ${routineSkinType}\n` +
            `Skin Concerns: ${routineConcernText}\n` +
            `Ingredient Sensitivities: ${routineSensitivityText}\n\n` +

            `☀️ MORNING ROUTINE\n\n` +
            `${morningRoutine.join("\n")}\n\n` +

            `🌙 NIGHT ROUTINE\n\n` +
            `${nightRoutine.join("\n")}\n\n` +

            `✨ This is general skincare guidance based on your saved Beauty Profile. Introduce new products carefully because individual skin can react differently.`

    });
}


        // ==================================================
        // 7. CATEGORY SEARCH
        // ==================================================

        const categoryMap = {

            "skin care": "Skin Care",
            "skincare": "Skin Care",

            "makeup": "Makeup",
            "make up": "Makeup",

            "hair care": "Hair Care",
            "haircare": "Hair Care",

            "body care": "Body Care",
            "bodycare": "Body Care",

            "fragrance": "Fragrance",
            "fragrances": "Fragrance",

            "perfume": "Fragrance",
            "perfumes": "Fragrance"

        };


        let requestedCategory = null;


        for (
            const keyword in categoryMap
        ) {

            if (
                userMessage.includes(keyword)
            ) {

                requestedCategory =
                    categoryMap[keyword];

                break;

            }

        }


        if (requestedCategory) {

            const categoryProducts =
                products.filter(
                    (product) =>

                        product.category &&

                        product.category
                            .toLowerCase() ===

                        requestedCategory
                            .toLowerCase()
                );


            if (
                categoryProducts.length === 0
            ) {

                return res.status(200).json({

                    reply:
                        `Sorry 🌸 I couldn't find any available ${requestedCategory} products right now.`

                });

            }


            const productList =
                categoryProducts
                    .map(
                        (product) =>
                            `• ${product.name} - Rs. ${product.price}`
                    )
                    .join("\n");


            return res.status(200).json({

                reply:
                    `Here are our available ${requestedCategory} products 🌸\n\n${productList}`

            });

        }


        // ==================================================
        // 8. NATURAL RECOMMENDATION QUESTIONS
        // ==================================================

        const recommendationWords = [

            "what should i use",
            "what can i use",
            "what is good for",
            "recommend something",
            "recommend me",
            "can you recommend",
            "suggest something",
            "what should i buy"

        ];


        const askingForRecommendation =
            recommendationWords.some(
                (word) =>
                    userMessage.includes(word)
            );


        if (askingForRecommendation) {

            // ------------------------------------------
            // Detect skin type
            // ------------------------------------------

            const skinTypes = [
                "oily",
                "dry",
                "combination",
                "sensitive",
                "normal"
            ];


            const detectedSkinType =
                skinTypes.find(
                    (skinType) =>
                        userMessage.includes(
                            skinType
                        )
                );


            // ------------------------------------------
            // Detect skin concern
            // ------------------------------------------

            const skinConcerns = [
                "acne",
                "dark spots",
                "dryness",
                "oiliness",
                "redness",
                "aging"
            ];


            const detectedConcern =
                skinConcerns.find(
                    (concern) =>
                        userMessage.includes(
                            concern
                        )
                );


            // ------------------------------------------
            // Skin type recommendation request
            // ------------------------------------------

            if (detectedSkinType) {

                return res.status(200).json({

                    reply:

                        `🌸 I can help you with ${detectedSkinType} skin.\n\n` +

                        `For a personalized product recommendation, I need to consider more than only your skin type. ` +

                        `Your skin concerns, budget and ingredient sensitivities are also important.\n\n` +

                        `💗 Please take the GlowGuide Beauty Quiz and I'll find suitable products for you.`

                });

            }


            // ------------------------------------------
            // Skin concern recommendation request
            // ------------------------------------------

            if (detectedConcern) {

                return res.status(200).json({

                    reply:

                        `🌸 I can help you with ${detectedConcern}.\n\n` +

                        `To recommend suitable GlowNest products, I also need to know your skin type, budget and ingredient sensitivities.\n\n` +

                        `💗 Take the GlowGuide Beauty Quiz for your personalized recommendations.`

                });

            }


            // ------------------------------------------
            // General recommendation request
            // ------------------------------------------

            return res.status(200).json({

                reply:

                    "Of course 🌸 I can help you find suitable products.\n\n" +

                    "For a personalized recommendation based on your skin type, concerns, budget and ingredient sensitivities, please take the GlowGuide Beauty Quiz. 💗"

            });

        }

        // ==========================================================
// 8.5 PERSONALIZED INGREDIENT RECOMMENDATION
// FROM SAVED BEAUTY PROFILE
// ==========================================================

const ingredientRecommendationPatterns = [
    "what ingredients are good for my skin",
    "what ingredient is good for my skin",
    "which ingredients are good for my skin",
    "which ingredient is good for my skin",
    "what ingredients should i use",
    "which ingredients should i use",
    "recommend ingredients for my skin",
    "recommend an ingredient for my skin",
    "suggest ingredients for my skin",
    "suggest an ingredient for my skin",
    "best ingredients for my skin"
];

const askingForIngredientRecommendation =
    ingredientRecommendationPatterns.some(
        (pattern) =>
            userMessage.includes(pattern)
    );


if (askingForIngredientRecommendation) {

    console.log(
        "GlowGuide detected personalized ingredient recommendation request"
    );


    // --------------------------------------------------
    // USER MUST BE LOGGED IN
    // --------------------------------------------------

    if (!req.user) {

        return res.status(200).json({

            reply:
                "🌸 Please log in first so I can use your saved Beauty Profile to suggest suitable skincare ingredients."

        });

    }


    // --------------------------------------------------
    // USER MUST HAVE COMPLETED BEAUTY QUIZ
    // --------------------------------------------------

    if (
        !beautyProfile ||
        beautyProfile.completed !== true
    ) {

        return res.status(200).json({

            reply:
                "🌸 I don't have a completed Beauty Profile for you yet.\n\n" +
                "Please complete the GlowGuide Beauty Quiz first so I can consider your skin type, skin concerns and ingredient sensitivities."

        });

    }


    const profileSkinType =
        beautyProfile.skinType || "";

    const profileConcerns =
        Array.isArray(beautyProfile.skinConcerns)
            ? beautyProfile.skinConcerns
            : [];

    const profileSensitivities =
        Array.isArray(beautyProfile.sensitivities)
            ? beautyProfile.sensitivities
            : [];


    // --------------------------------------------------
    // GET ONLY INGREDIENT RECORDS
    // --------------------------------------------------

    const ingredientRecords =
        beautyKnowledge.filter(
            (item) =>
                item.type === "ingredient"
        );


    const matchedIngredients = [];


    // --------------------------------------------------
    // CHECK EACH INGREDIENT
    // --------------------------------------------------

    for (const ingredient of ingredientRecords) {

        let score = 0;

        const reasons = [];


        // ----------------------------------------------
        // SKIN TYPE MATCH
        // ----------------------------------------------

        const suitableSkinTypes =
            Array.isArray(
                ingredient.suitableSkinTypes
            )
                ? ingredient.suitableSkinTypes
                : [];


        const skinTypeMatch =
            suitableSkinTypes.some(
                (type) =>
                    String(type)
                        .toLowerCase()
                        .trim() ===

                    String(profileSkinType)
                        .toLowerCase()
                        .trim()
            );


        if (skinTypeMatch) {

            score += 40;

            reasons.push(
                `suitable for ${profileSkinType} skin`
            );

        }


        // ----------------------------------------------
        // SKIN CONCERN MATCH
        // ----------------------------------------------

        const suitableConcerns =
            Array.isArray(
                ingredient.suitableConcerns
            )
                ? ingredient.suitableConcerns
                : [];


        const matchedConcerns =
            profileConcerns.filter(
                (concern) =>

                    suitableConcerns.some(
                        (supportedConcern) =>

                            String(supportedConcern)
                                .toLowerCase()
                                .trim() ===

                            String(concern)
                                .toLowerCase()
                                .trim()
                    )
            );


        if (
            profileConcerns.length > 0 &&
            matchedConcerns.length > 0
        ) {

            const concernScore =
                (
                    matchedConcerns.length /
                    profileConcerns.length
                ) * 60;


            score += concernScore;


            reasons.push(
                `supports ${matchedConcerns.join(", ")}`
            );

        }


        // ----------------------------------------------
// SAVE MATCH
// ----------------------------------------------

// If the customer has selected skin concerns,
// prefer ingredients that actually support at
// least one of those concerns.
//
// If there are no selected concerns, a skin-type
// match is enough.

const hasRelevantMatch =
    profileConcerns.length > 0
        ? matchedConcerns.length > 0
        : skinTypeMatch;


if (
    hasRelevantMatch &&
    score > 0
) {

    matchedIngredients.push({

        ingredient,
        score: Math.round(score),
        reasons

    });

}

    }


    // --------------------------------------------------
    // HIGHEST MATCH FIRST
    // --------------------------------------------------

    matchedIngredients.sort(
        (a, b) =>
            b.score - a.score
    );


    // --------------------------------------------------
    // NO MATCH
    // --------------------------------------------------

    if (matchedIngredients.length === 0) {

        return res.status(200).json({

            reply:
                "🌸 I couldn't find a suitable ingredient match in my GlowGuide Beauty Knowledge for your current Beauty Profile."

        });

    }


    // --------------------------------------------------
    // TAKE BEST 3 INGREDIENTS
    // --------------------------------------------------

    const topIngredients =
        matchedIngredients.slice(0, 3);


    console.log(
        "GlowGuide matched ingredients:",
        topIngredients.map(
            (item) => ({
                name: item.ingredient.name,
                score: item.score
            })
        )
    );


    // --------------------------------------------------
    // BUILD RESPONSE
    // --------------------------------------------------

    const ingredientText =
        topIngredients
            .map(
                (item, index) =>

                    `${index + 1}. ${item.ingredient.name}\n` +
                    `${item.ingredient.answer}`

            )
            .join("\n\n");


    const sensitivityText =
        profileSensitivities.length > 0
            ? profileSensitivities.join(", ")
            : "None selected";


    return res.status(200).json({

        reply:
            `🌸 Based on your saved Beauty Profile, these ingredients may be useful to explore:\n\n` +

            `${ingredientText}\n\n` +

            `Your profile shows ${profileSkinType} skin` +

            (
                profileConcerns.length > 0
                    ? ` with ${profileConcerns.join(", ")} as your skin concern${profileConcerns.length > 1 ? "s" : ""}`
                    : ""
            ) +

            `.\n\n🧪 Saved ingredient sensitivities: ${sensitivityText}.\n\n` +

            `Please remember that individual skin can react differently, so introduce new skincare products carefully. ✨`

    });

}


        // ==================================================
        // 9. BEAUTY KNOWLEDGE
        // ==================================================

        const matchedKnowledge =
            beautyKnowledge.find(
                (item) => {

                    return item.keywords.some(
                        (keyword) =>

                            userMessage.includes(
                                keyword.toLowerCase()
                            )
                    );

                }
            );


        if (matchedKnowledge) {

            console.log(
                "GlowGuide beauty knowledge match:",
                matchedKnowledge.keywords[0]
            );


            return res.status(200).json({

                reply:
                    matchedKnowledge.answer

            });

        }


        // ==================================================
        // 10. FIND AN EXPLICITLY MENTIONED PRODUCT
        // ==================================================

        let matchedProduct = null;


        matchedProduct =
            products.find(
                (product) => {

                    const productName =
                        product.name
                            .toLowerCase()
                            .trim();


                    // Normal product name

                    if (
                        productName &&
                        userMessage.includes(
                            productName
                        )
                    ) {

                        return true;

                    }


                    // Alternative product names

                    if (
                        Array.isArray(
                            product.altNames
                        ) &&
                        product.altNames.length > 0
                    ) {

                        const matchedAltName =
                            product.altNames.some(
                                (altName) => {

                                    if (
                                        !altName ||
                                        altName.trim() === ""
                                    ) {

                                        return false;

                                    }


                                    return userMessage.includes(

                                        altName
                                            .toLowerCase()
                                            .trim()

                                    );

                                }
                            );


                        if (matchedAltName) {

                            return true;

                        }

                    }


                    return false;

                }
            );


        // ==================================================
        // 11. BASIC CONVERSATION MEMORY / CONTEXT
        // ==================================================

        const contextPatterns = [

            /\bit\b/,
            /\bthis\b/,
            /\bthat\b/,
            /\bthis product\b/,
            /\bthat product\b/

        ];


        const askingAboutPreviousProduct =
            contextPatterns.some(
                (pattern) =>
                    pattern.test(userMessage)
            );


        if (
            !matchedProduct &&
            askingAboutPreviousProduct &&
            lastProduct
        ) {

            matchedProduct =
                products.find(
                    (product) =>

                        product.name
                            .toLowerCase()
                            .trim() ===

                        lastProduct
                            .toLowerCase()
                            .trim()
                );


            if (matchedProduct) {

                console.log(
                    "GlowGuide using remembered product:",
                    matchedProduct.name
                );

            }

        }


        // ==================================================
        // 12. CUSTOMER IS ASKING ABOUT PRODUCT
        // ==================================================

        if (matchedProduct) {

            console.log(
                "GlowGuide matched product:",
                matchedProduct.name
            );


            // ------------------------------------------
            // PRICE QUESTION
            // ------------------------------------------

            const priceWords = [

                "price",
                "cost",
                "how much",
                "what is the price"

            ];


            const askingPrice =
                priceWords.some(
                    (word) =>
                        userMessage.includes(word)
                );


            if (askingPrice) {

                return res.status(200).json({

                    reply:
                        `🌸 ${matchedProduct.name} is currently Rs. ${matchedProduct.price}.`,

                    productName:
                        matchedProduct.name

                });

            }


            // ------------------------------------------
            // STOCK / AVAILABILITY
            // ------------------------------------------

            const stockWords = [

                "stock",
                "available",
                "availability",
                "do you have",
                "have this"

            ];


            const askingStock =
                stockWords.some(
                    (word) =>
                        userMessage.includes(word)
                );


            if (askingStock) {

                if (
                    matchedProduct.stock > 0
                ) {

                    return res.status(200).json({

                        reply:
                            `Yes 🌸 ${matchedProduct.name} is currently in stock. We have ${matchedProduct.stock} available.`,

                        productName:
                            matchedProduct.name

                    });

                } else {

                    return res.status(200).json({

                        reply:
                            `Sorry 🌸 ${matchedProduct.name} is currently out of stock.`,

                        productName:
                            matchedProduct.name

                    });

                }

            }


            // ------------------------------------------
            // PRODUCT DETAILS
            // ------------------------------------------

            const detailWords = [

                "tell me about",
                "details",
                "information",
                "describe",
                "what is"

            ];


            const askingDetails =
                detailWords.some(
                    (word) =>
                        userMessage.includes(word)
                );


            if (askingDetails) {

                return res.status(200).json({

                    reply:

                        `🌸 ${matchedProduct.name}\n\n` +

                        `${matchedProduct.description}\n\n` +

                        `Category: ${matchedProduct.category}\n` +

                        `Price: Rs. ${matchedProduct.price}\n` +

                        `Stock: ${matchedProduct.stock}`,

                    productName:
                        matchedProduct.name

                });

            }


            // ------------------------------------------
            // GENERAL PRODUCT QUESTION
            // ------------------------------------------

            return res.status(200).json({

                reply:

                    `I found ${matchedProduct.name} 🌸\n\n` +

                    `${matchedProduct.description}\n\n` +

                    `Price: Rs. ${matchedProduct.price}\n` +

                    (
                        matchedProduct.stock > 0

                            ? `In Stock (${matchedProduct.stock})`

                            : "Currently Out of Stock"
                    ),

                productName:
                    matchedProduct.name

            });

        }


        // ==================================================
        // 13. SHOW ALL PRODUCTS
        // ==================================================

        if (
            userMessage.includes(
                "what products"
            ) ||

            userMessage.includes(
                "show products"
            ) ||

            userMessage.includes(
                "show me products"
            ) ||

            userMessage.includes(
                "products do you have"
            )
        ) {

            if (
                products.length === 0
            ) {

                return res.status(200).json({

                    reply:
                        "Sorry 🌸 There are currently no products available."

                });

            }


            const productList =
                products
                    .map(
                        (product) =>
                            `• ${product.name} - Rs. ${product.price}`
                    )
                    .join("\n");


            return res.status(200).json({

                reply:
                    `Here are some products available at GlowNest 🌸\n\n${productList}`

            });

        }

        // ==========================================================
// GLOWGUIDE IDENTITY QUESTIONS
// ==========================================================

const normalizedMessage = userMessage
    .toLowerCase()
    .replace(/[?!.,]/g, "")
    .trim();


// ----------------------------------------------------------
// WHAT IS GLOWGUIDE AI?
// ----------------------------------------------------------

const glowGuideAIQuestions = [
    "what is glowguide ai",
    "who is glowguide ai",
    "tell me about glowguide ai"
];

if (glowGuideAIQuestions.includes(normalizedMessage)) {

    return res.status(200).json({
        reply:
            "🌸 GlowGuide AI is your personal beauty assistant inside the GlowGuide online cosmetics store.\n\n" +
            "I can help you with skincare and beauty questions, explain ingredients, check your saved ingredient sensitivities, " +
            "recommend suitable products and help you build a personalized skincare routine. ✨"
    });
}


// ----------------------------------------------------------
// WHO ARE YOU?
// ----------------------------------------------------------

const assistantIdentityQuestions = [
    "who are you",
    "what is your name",
    "whats your name",
    "tell me your name"
];

if (assistantIdentityQuestions.includes(normalizedMessage)) {

    return res.status(200).json({
        reply:
            "🌸 I'm GlowGuide AI, your personal beauty assistant for GlowGuide.\n\n" +
            "I can help you with skincare, ingredients, beauty questions and personalized product recommendations. ✨"
    });
}


// ----------------------------------------------------------
// WHAT IS GLOWGUIDE?
// ----------------------------------------------------------

const glowGuideStoreQuestions = [
    "what is glowguide",
    "tell me about glowguide",
    "what does glowguide do"
];

if (glowGuideStoreQuestions.includes(normalizedMessage)) {

    return res.status(200).json({
        reply:
            "🌸 GlowGuide is an online cosmetics store where customers can explore skincare, makeup and beauty products.\n\n" +
            "GlowGuide also provides personalized beauty features to help customers find products based on their preferences and Beauty Profile. ✨"
    });
}


        // ==================================================
// 14. AI FALLBACK RESPONSE - OLLAMA / GEMMA
// ==================================================

try {

    console.log("GlowGuide using Gemma AI fallback");

    // --------------------------------------------------
// PREPARE GLOWGUIDE BEAUTY KNOWLEDGE FOR AI
// --------------------------------------------------

const beautyKnowledgeContext = beautyKnowledge
    .map((item) => {
        return `Topic: ${item.keywords[0]}
Information: ${item.answer}`;
    })
    .join("\n\n");

console.log(
    `GlowGuide sending ${beautyKnowledge.length} beauty knowledge records to AI`
);

    // --------------------------------------------------
    // PREPARE CUSTOMER BEAUTY PROFILE FOR AI
    // --------------------------------------------------

    let beautyProfileContext = `
CUSTOMER BEAUTY PROFILE:
- No completed Beauty Profile is available.

PERSONALIZATION RULE:
- Give general beauty or skincare guidance.
- Do not pretend that you know the customer's skin type,
  concerns, budget or sensitivities.
`;

    if (
        beautyProfile &&
        beautyProfile.completed === true
    ) {

        const profileConcerns =
            Array.isArray(beautyProfile.skinConcerns) &&
            beautyProfile.skinConcerns.length > 0
                ? beautyProfile.skinConcerns.join(", ")
                : "None selected";

        const profileSensitivities =
            Array.isArray(beautyProfile.sensitivities) &&
            beautyProfile.sensitivities.length > 0
                ? beautyProfile.sensitivities.join(", ")
                : "None selected";

        beautyProfileContext = `
CUSTOMER BEAUTY PROFILE:
- Skin Type: ${beautyProfile.skinType || "Not selected"}
- Skin Concerns: ${profileConcerns}
- Budget: ${beautyProfile.budget || "Not selected"}
- Saved Ingredient Sensitivities: ${profileSensitivities}

PERSONALIZATION RULES:
- Use this Beauty Profile when it is relevant to the customer's question.
- The Beauty Profile is already saved by the customer. Do not ask the customer again for information that is already available in the profile.
- Use the saved skin type and skin concerns when giving relevant skincare guidance.
- Use the saved ingredient sensitivities when giving relevant ingredient guidance.
- If sensitivities are listed in the profile, acknowledge them when relevant instead of asking whether the customer has sensitivities.
- The Budget value means the customer's product spending preference only.
- Never describe a High budget as a "high-level", "advanced", "premium" or "high-quality" skincare routine.
- Do not mention the customer's budget unless the question is about products, prices, shopping or recommendations.
- When the customer asks which ingredients may suit their skin, give useful ingredient examples based on their saved skin type and concerns.
- Never say that an ingredient or product is guaranteed safe.
- Never diagnose a medical condition.
- Do not force Beauty Profile information into unrelated answers.
- If the customer's question does not require personalization,
  answer normally.
  - If the customer asks "what ingredients are good for my skin" or a similar question,
  answer the question directly using their saved skin type and skin concerns.
- Give 2 to 4 relevant skincare ingredient examples and briefly explain each one.
- Do not ask the customer what they want to learn when their question is already clear.
- Do not ask for skin type, skin concerns, budget or sensitivities when they are already available in the Beauty Profile.
`;
    }

    console.log(
        "GlowGuide sending Beauty Profile context to AI:",
        beautyProfileContext
    );


    const aiResponse = await axios.post(
        "http://localhost:11434/api/generate",
        {
            model: "gemma3:1b",

            prompt: `
You are GlowGuide AI, the personal beauty assistant for an
online cosmetics store called GlowGuide.

The customer asked:
"${message}"

${beautyProfileContext}

GLOWGUIDE BEAUTY KNOWLEDGE:
${beautyKnowledgeContext}

KNOWLEDGE RULES:
- Use GlowGuide Beauty Knowledge when it contains information relevant to the customer's question.
- Prefer the information in GlowGuide Beauty Knowledge over inventing beauty facts.
- Do not invent ingredient benefits that are not supported by the provided GlowGuide Beauty Knowledge.
- When the customer's Beauty Profile is available, combine relevant Beauty Profile information with relevant GlowGuide Beauty Knowledge.
- If the provided knowledge does not contain enough information to answer something safely, give a cautious general response instead of making up facts.
- Do not tell the customer about these internal knowledge records.

IMPORTANT IDENTITY RULES:
- The online cosmetics store is called "GlowGuide".
- Your name is "GlowGuide AI".
- GlowGuide and GlowGuide AI are different:
  * GlowGuide = the online cosmetics store.
  * GlowGuide AI = the personal beauty assistant inside the GlowGuide store.
- Always call the store "GlowGuide".
- Always call yourself "GlowGuide AI".
- Never write your name as "Glow Guide AI".
- If the customer asks "What is GlowGuide?", explain the GlowGuide online cosmetics store. Do NOT introduce yourself.
- If the customer asks "Who are you?", say: "I'm GlowGuide AI, your personal beauty assistant for GlowGuide."
- If the customer asks "What is GlowGuide AI?", explain that GlowGuide AI is the personal beauty assistant available in the GlowGuide store.
- If the customer asks your name, say: "My name is GlowGuide AI."
- Never call yourself Gemma, Ollama, ChatGPT, or any other AI model.
- Never mention the underlying AI model or technology to the customer.
- Do not call yourself an expert, dermatologist, doctor or healthcare professional.
- Say that you provide general beauty and skincare guidance.

RESPONSE RULES:
- Be friendly and easy to understand.
- Use simple English.
- Focus on skincare, makeup, cosmetics and beauty.
- Keep the answer reasonably short.
- Use the customer's Beauty Profile when it is relevant.
- Do not repeatedly list the whole Beauty Profile.
- Do not pretend to be a doctor or diagnose medical conditions.
- For serious skin problems, recommend speaking to a qualified healthcare professional.
- Do not invent product names, prices, stock or product details.
- Do not claim that a product is safe for a user's allergies or sensitivities unless that information comes from GlowGuide's saved data.
- You may use a few friendly emojis such as 🌸 💗 ✨.
- Answer the customer's question directly.
- If the customer's question is clear, always provide an actual answer.
- Do not respond only with another question.
- Ask a follow-up question only when the customer's request is unclear or important information is missing.
- Do not introduce yourself unless the customer asks who you are or asks your name.
- Do not start normal answers with phrases such as "Hello there", "I'm GlowGuide AI", "Okay, here's my response", or "Let's dive in".
- Avoid unnecessary follow-up questions when you can answer the customer's question directly.
- Return plain text only.
- Do not use Markdown formatting.
- Do not use **, *, #, backticks or Markdown headings.
- For a short list, use simple numbered points such as "1.", "2.", "3.".
`,

            stream: false
        }
    );


    let aiReply = aiResponse.data.response || "";

aiReply = aiReply
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/^\s*\*\s+/gm, "• ")
    .replace(/`/g, "")
    .trim();

    return res.status(200).json({
        reply: aiReply
    });


} catch (aiError) {

    console.error(
        "GlowGuide Gemma AI error:",
        aiError.message
    );


    return res.status(200).json({

        reply:
            "I'm still learning that question 🌸 " +
            "Please try asking me something about skincare, " +
            "makeup, ingredients or GlowGuide products."

    });

}


    } catch (error) {

        console.error(
            "GlowGuide chatbot error:",
            error
        );


        return res.status(500).json({

            message:
                "GlowGuide is having trouble responding right now."

        });

    }

}