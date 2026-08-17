import Product from "../models/product.js";
import User from "../models/user.js";
import beautyKnowledge from "../data/beautyKnowledge.js";
import RecommendationData from "../models/recommendationData.js";

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


        // ==================================================
        // 14. FALLBACK RESPONSE
        // ==================================================

        return res.status(200).json({

            reply:

                "I'm still learning that question 🌸 " +

                "You can ask me about product prices, availability, " +

                "product details, categories, products within your budget, " +

                "your saved Beauty Profile, personalized product recommendations, " +

                "or general beauty questions."

        });


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