import Product from "../models/product.js";
import User from "../models/user.js";
import beautyKnowledge from "../data/beautyKnowledge.js";
import RecommendationData from "../models/recommendationData.js";
import axios from "axios";

normalizeProductText()
findBestProductMatch()

// ==================================================
// GLOWGUIDE PRODUCT MATCHING ENGINE
// ==================================================
// This function identifies the most accurate product
// from the user's message.
//
// Priority:
// 1. Exact product name
// 2. Exact alternative name
// 3. Longest product-name match
// 4. Longest alternative-name match
//
// This prevents a shorter product name from winning
// over a more specific product name.
// ==================================================

function normalizeProductText(text) {

    return String(text || "")
        .toLowerCase()
        .replace(/[^\w\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

}


function findBestProductMatch(
    userText,
    products = []
) {

    const normalizedMessage =
        normalizeProductText(userText);


    if (
        !normalizedMessage ||
        !Array.isArray(products) ||
        products.length === 0
    ) {
        return null;
    }


    const matches = [];


    products.forEach((product) => {

        if (
            !product ||
            !product.name
        ) {
            return;
        }


        const normalizedProductName =
            normalizeProductText(
                product.name
            );


        if (!normalizedProductName) {
            return;
        }


        // ==========================================
        // 1. EXACT PRODUCT NAME
        // ==========================================

        if (
            normalizedMessage ===
            normalizedProductName
        ) {

            matches.push({
                product,
                score: 100000,
                matchedName:
                    product.name,
                matchType:
                    "EXACT PRODUCT NAME"
            });

        }


        // ==========================================
        // 2. PRODUCT NAME INSIDE USER MESSAGE
        // ==========================================

        if (
            normalizedMessage.includes(
                normalizedProductName
            )
        ) {

            matches.push({
                product,
                score:
                    50000 +
                    normalizedProductName.length * 100,
                matchedName:
                    product.name,
                matchType:
                    "PRODUCT NAME"
            });

        }


        // ==========================================
        // 3. ALTERNATIVE PRODUCT NAMES
        // ==========================================

        if (
            Array.isArray(product.altNames)
        ) {

            product.altNames.forEach(
                (altName) => {

                    if (!altName) {
                        return;
                    }


                    const normalizedAltName =
                        normalizeProductText(
                            altName
                        );


                    if (!normalizedAltName) {
                        return;
                    }


                    // --------------------------------
                    // EXACT ALTERNATIVE NAME
                    // --------------------------------

                    if (
                        normalizedMessage ===
                        normalizedAltName
                    ) {

                        matches.push({
                            product,
                            score: 90000,
                            matchedName:
                                altName,
                            matchType:
                                "EXACT ALTERNATIVE NAME"
                        });

                    }


                    // --------------------------------
                    // ALTERNATIVE NAME IN MESSAGE
                    // --------------------------------

                    if (
                        normalizedMessage.includes(
                            normalizedAltName
                        )
                    ) {

                        matches.push({
                            product,
                            score:
                                40000 +
                                normalizedAltName.length * 100,
                            matchedName:
                                altName,
                            matchType:
                                "ALTERNATIVE NAME"
                        });

                    }

                }
            );

        }

    });


    // ==========================================
    // NO MATCH
    // ==========================================

    if (
        matches.length === 0
    ) {

        return null;

    }


    // ==========================================
    // SORT BEST MATCH FIRST
    // ==========================================

    matches.sort(
        (a, b) =>
            b.score - a.score
    );


    const bestMatch =
        matches[0];


    // ==========================================
    // DEBUG INFORMATION
    // ==========================================

    console.log(
        "=========================================="
    );

    console.log(
        "GlowGuide Product Matching"
    );

    console.log(
        "User message:",
        userText
    );

    console.log(
        "Selected product:",
        bestMatch.product.name
    );

    console.log(
        "Matched using:",
        bestMatch.matchType
    );

    console.log(
        "Matched text:",
        bestMatch.matchedName
    );

    console.log(
        "Score:",
        bestMatch.score
    );

    console.log(
        "=========================================="
    );


    return bestMatch.product;

}

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
// PRIORITY GENERAL BEAUTY QUESTIONS
// Prevent general advice questions from being
// mistaken for product/category searches
// ==================================================

const normalizedBeautyQuestion = userMessage
    .replace(/[?!.,]/g, "")
    .replace(/\s+/g, " ")
    .trim();


// --------------------------------------------------
// DRY SKIN VS DEHYDRATED SKIN
// --------------------------------------------------

if (
    normalizedBeautyQuestion.includes(
        "difference between dry skin and dehydrated skin"
    ) ||
    normalizedBeautyQuestion.includes(
        "dry skin vs dehydrated skin"
    )
) {

    return res.status(200).json({
        reply:
            "🌸 Dry skin and dehydrated skin are different.\n\n" +
            "Dry skin is a skin type that does not produce enough natural oil, so it may feel rough, flaky or tight.\n\n" +
            "Dehydrated skin is a temporary condition where the skin lacks water. It can affect any skin type, including oily skin.\n\n" +
            "Gentle cleansing, hydration and a suitable moisturizer can help support the skin barrier."
    });
}


// --------------------------------------------------
// SUNSCREEN USAGE
// --------------------------------------------------

if (
    normalizedBeautyQuestion.includes(
        "how often should i use sunscreen"
    ) ||
    normalizedBeautyQuestion.includes(
        "how often should i apply sunscreen"
    ) ||
    normalizedBeautyQuestion.includes(
        "when should i use sunscreen"
    )
) {

    return res.status(200).json({
        reply:
            "☀️ Sunscreen should be used every morning as the final step of your daytime skincare routine.\n\n" +
            "Reapply it during the day when needed, especially after swimming, sweating or spending a long time outdoors. 🌸"
    });
}


// --------------------------------------------------
// OILY SKIN + MOISTURIZER
// --------------------------------------------------

if (
    normalizedBeautyQuestion.includes(
        "can oily skin use moisturizer"
    ) ||
    normalizedBeautyQuestion.includes(
        "should oily skin use moisturizer"
    ) ||
    normalizedBeautyQuestion.includes(
        "does oily skin need moisturizer"
    )
) {

    return res.status(200).json({
        reply:
            "🌸 Yes. Oily skin can still benefit from moisturizer.\n\n" +
            "A lightweight, non-greasy moisturizer can help keep the skin hydrated without making it feel excessively oily."
    });
}


// --------------------------------------------------
// BASIC MORNING SKINCARE ROUTINE
// --------------------------------------------------

if (
    normalizedBeautyQuestion.includes(
        "basic morning skincare routine"
    ) ||
    normalizedBeautyQuestion.includes(
        "basic morning skin care routine"
    )
) {

    return res.status(200).json({
        reply:
            "🌞 A simple morning skincare routine can be:\n\n" +
            "1. Cleanser\n" +
            "2. Serum or treatment, if needed\n" +
            "3. Moisturizer\n" +
            "4. Sunscreen\n\n" +
            "This is a general routine. For a routine based on your saved Beauty Profile, you can ask me to create a skincare routine for you. 🌸"
    });
}


// --------------------------------------------------
// BASIC NIGHT SKINCARE ROUTINE
// --------------------------------------------------

if (
    normalizedBeautyQuestion.includes(
        "basic night skincare routine"
    ) ||
    normalizedBeautyQuestion.includes(
        "basic night skin care routine"
    )
) {

    return res.status(200).json({
        reply:
            "🌙 A simple night skincare routine can be:\n\n" +
            "1. Cleanser\n" +
            "2. Serum or treatment, if needed\n" +
            "3. Moisturizer\n\n" +
            "This is a general routine. For a routine based on your saved Beauty Profile, you can ask me to create a skincare routine for you. 🌸"
    });
}

// --------------------------------------------------
// PURPOSE OF TONER
// --------------------------------------------------

if (
    normalizedBeautyQuestion.includes(
        "what is the purpose of a toner in skincare"
    ) ||
    normalizedBeautyQuestion.includes(
        "what is the purpose of toner"
    ) ||
    normalizedBeautyQuestion.includes(
        "what does toner do"
    ) ||
    normalizedBeautyQuestion.includes(
        "why use toner"
    )
) {
    return res.status(200).json({
        reply:
            "🌸 Toner is a skincare step that can help refresh the skin after cleansing.\n\n" +
            "Depending on the product, a toner may help add hydration or prepare the skin for the next steps of your routine.\n\n" +
            "Toner is optional, so you do not need to use one if your basic skincare routine already works well for you."
    });
}


// --------------------------------------------------
// AVOID USING TOO MANY SKINCARE PRODUCTS
// --------------------------------------------------

if (
    normalizedBeautyQuestion.includes(
        "why should i avoid using too many skincare products at once"
    ) ||
    normalizedBeautyQuestion.includes(
        "why avoid using too many skincare products"
    ) ||
    normalizedBeautyQuestion.includes(
        "too many skincare products"
    )
) {
    return res.status(200).json({
        reply:
            "🌸 Using too many skincare products at once can make your routine complicated and may increase the chance of skin irritation.\n\n" +
            "It can also make it difficult to know which product is helping or causing a problem.\n\n" +
            "A simple routine with a few suitable products is often easier to follow and maintain."
    });
}


// --------------------------------------------------
// KEEP SKINCARE ROUTINE SIMPLE
// --------------------------------------------------

if (
    normalizedBeautyQuestion.includes(
        "how can i keep my skincare routine simple"
    ) ||
    normalizedBeautyQuestion.includes(
        "how do i keep my skincare routine simple"
    ) ||
    normalizedBeautyQuestion.includes(
        "keep my skincare routine simple"
    ) ||
    normalizedBeautyQuestion.includes(
        "simple skincare routine"
    )
) {
    return res.status(200).json({
        reply:
            "🌸 You can keep your skincare routine simple by focusing on the basic steps.\n\n" +
            "🌞 Morning: Cleanser, moisturizer and sunscreen.\n\n" +
            "🌙 Night: Cleanser and moisturizer.\n\n" +
            "You can add a serum or other treatment only when you have a specific skincare need."
    });
}

// ==================================================
// PRIORITY GENERAL BEAUTY KNOWLEDGE
// These questions must be answered as knowledge,
// not treated as product searches.
// ==================================================

// --------------------------------------------------
// WHAT IS A SERUM?
// --------------------------------------------------

if (
    normalizedBeautyQuestion === "what is a serum" ||
    normalizedBeautyQuestion === "what is serum" ||
    normalizedBeautyQuestion === "what does a serum do" ||
    normalizedBeautyQuestion === "what does serum do"
) {

    return res.status(200).json({
        reply:
            "🌸 A serum is a lightweight skincare product that contains concentrated ingredients designed to target specific skin concerns.\n\n" +
            "Depending on the ingredients, serums can help with hydration, acne, dullness, uneven skin tone or other skincare needs.\n\n" +
            "A serum is usually applied after cleansing and before moisturizer."
    });
}


// --------------------------------------------------
// WHAT DOES MOISTURIZER DO?
// --------------------------------------------------

if (
    normalizedBeautyQuestion === "what does moisturizer do" ||
    normalizedBeautyQuestion === "what does moisturiser do" ||
    normalizedBeautyQuestion === "what is a moisturizer" ||
    normalizedBeautyQuestion === "what is a moisturiser" ||
    normalizedBeautyQuestion === "why use moisturizer" ||
    normalizedBeautyQuestion === "why use moisturiser"
) {

    return res.status(200).json({
        reply:
            "🌸 Moisturizer helps keep the skin hydrated by reducing moisture loss and supporting the skin barrier.\n\n" +
            "It can help the skin feel softer, smoother and more comfortable.\n\n" +
            "Moisturizer can be useful for different skin types, including oily skin, although the suitable texture may vary."
    });
}


// --------------------------------------------------
// WHY IS SUNSCREEN IMPORTANT?
// --------------------------------------------------

if (
    normalizedBeautyQuestion === "why is sunscreen important" ||
    normalizedBeautyQuestion === "why is sunscreen important for skin" ||
    normalizedBeautyQuestion === "what does sunscreen do" ||
    normalizedBeautyQuestion === "why use sunscreen"
) {

    return res.status(200).json({
        reply:
            "☀️ Sunscreen helps protect the skin from harmful ultraviolet (UV) radiation.\n\n" +
            "Regular sunscreen use can help reduce sunburn and protect against UV-related skin damage and premature skin aging.\n\n" +
            "For daytime skincare, sunscreen is generally used as the final step of the morning routine. 🌸"
    });
}


// --------------------------------------------------
// WHAT CAUSES ACNE?
// --------------------------------------------------

if (
    normalizedBeautyQuestion === "what causes acne" ||
    normalizedBeautyQuestion === "what causes acne?" ||
    normalizedBeautyQuestion === "why do i get acne" ||
    normalizedBeautyQuestion === "why do i get pimples" ||
    normalizedBeautyQuestion === "what causes pimples"
) {

    return res.status(200).json({
        reply:
            "🌸 Acne can develop when hair follicles become clogged with oil (sebum) and dead skin cells.\n\n" +
            "Bacteria, hormonal changes and increased oil production can also contribute to acne.\n\n" +
            "A gentle skincare routine and products suitable for your skin type can help support clearer-looking skin. If acne is severe or persistent, it is best to consult a qualified healthcare professional."
    });
}
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
    userMessage === "my budget" ||
    userMessage.includes("what is my budget") ||
    userMessage.includes("what's my budget") ||
    userMessage.includes("show my budget") ||
    userMessage.includes("show me my budget") ||
    userMessage.includes("what is my budget preference");

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
            "suggest a product for me",

            "recommend something within my budget",
"recommend products within my budget",
"recommend a product within my budget",
"show products within my budget",
"show me products within my budget",
"find products within my budget",
"find something within my budget",
"suggest something within my budget",
"what can i buy within my budget",
"what can i get within my budget"

        ];

       // ==========================================
// DETECT SPECIFIC SKINCARE PRODUCT TYPE
// ==========================================

const skincareProductTypes = [
    "cleanser",
    "toner",
    "serum",
    "moisturizer",
    "moisturiser",
    "sunscreen"
];

const requestedSkincareType =
    skincareProductTypes.find(
        (type) => userMessage.includes(type)
    ) || null;

 // ==========================================
// CHECK IF USER SPECIFICALLY ASKS FOR BUDGET
// ==========================================

const askingWithinBudget =
    userMessage.includes("within my budget") ||
    userMessage.includes("in my budget") ||
    userMessage.includes("for my budget") ||
    userMessage.includes("according to my budget") ||
    userMessage.includes("affordable for me") ||
    userMessage.includes("within budget");   

// ==========================================
// DETECT PERSONALIZED PRODUCT-TYPE REQUEST
// Example:
// "Recommend a moisturizer within my budget"
// ==========================================

const askingForSpecificSkincareRecommendation =
    requestedSkincareType !== null &&
    (
        userMessage.includes("recommend") ||
        userMessage.includes("suggest") ||
        userMessage.includes("find") ||
        userMessage.includes("within my budget") ||
        userMessage.includes("for me")
    );
        
        // ==========================================
// DETECT PERSONALIZED SKIN / CONCERN REQUEST
// Examples:
// "Recommend a product for my dry skin"
// "Recommend something for my acne"
// ==========================================

const profileSkinWords = [
    "dry skin",
    "oily skin",
    "sensitive skin",
    "combination skin",
    "normal skin"
];

const profileConcernWords = [
    "acne",
    "dryness",
    "oiliness",
    "redness",
    "dark spots",
    "aging"
];

const mentionsSkinType =
    profileSkinWords.some(
        (word) => userMessage.includes(word)
    );

const mentionsSkinConcern =
    profileConcernWords.some(
        (word) => userMessage.includes(word)
    );

const containsRecommendationRequest =
    userMessage.includes("recommend") ||
    userMessage.includes("suggest") ||
    userMessage.includes("find");

const askingForSkinBasedRecommendation =
    containsRecommendationRequest &&
    (
        mentionsSkinType ||
        mentionsSkinConcern
    );

const askingForPersonalizedRecommendation =
    personalizedRecommendationPatterns.some(
        (pattern) =>
            userMessage.includes(pattern)
    ) ||
    askingForSpecificSkincareRecommendation ||
    askingForSkinBasedRecommendation;

 // ==========================================
// DETECT CURRENT SKIN TYPE / CONCERN
// FROM THE USER'S CURRENT MESSAGE
// ==========================================

// These values are used only for the CURRENT
// recommendation request.
// They DO NOT change the saved Beauty Profile.

// ==========================================
// DETECT CURRENT SKIN TYPE / CONCERNS
// FROM THE USER'S CURRENT MESSAGE
// ==========================================
//
// These values are used only for the CURRENT
// recommendation request.
// They DO NOT change the saved Beauty Profile.
//

const currentSkinType =
    profileSkinWords.find(
        (word) => userMessage.includes(word)
    ) || null;


// Detect ALL concerns mentioned in the current message
const currentSkinConcerns =
    profileConcernWords.filter(
        (word) => userMessage.includes(word)
    );


// Keep the first concern available for any
// existing code that expects currentSkinConcern
const currentSkinConcern =
    currentSkinConcerns.length > 0
        ? currentSkinConcerns[0]
        : null;


console.log(
    "GlowGuide current message detection:",
    {
        currentSkinType,
        currentSkinConcerns
    }
);

// ==========================================
// DETECT PERSONALIZED ROUTINE REQUESTS
// ==========================================
//
// These must be detected BEFORE the general
// recommendation logic.
//
// Otherwise:
// "What should I use in the morning?"
// would be treated as a normal product
// recommendation because it contains
// "what should i use".
//
// ==========================================

const routineRequestType =
    userMessage.includes("morning") &&
    (
        userMessage.includes("what should i use") ||
        userMessage.includes("what can i use") ||
        userMessage.includes("what do i use") ||
        userMessage.includes("morning routine") ||
        userMessage.includes("morning skincare") ||
        userMessage.includes("morning skin care")
    )
        ? "morning"

    : userMessage.includes("night") &&
      (
          userMessage.includes("what should i use") ||
          userMessage.includes("what can i use") ||
          userMessage.includes("what do i use") ||
          userMessage.includes("night routine") ||
          userMessage.includes("night skincare") ||
          userMessage.includes("night skin care") ||
          userMessage.includes("evening routine")
      )
        ? "night"

    : (
        userMessage.includes("create a routine") ||
        userMessage.includes("create my routine") ||
        userMessage.includes("make a routine") ||
        userMessage.includes("make my routine") ||
        userMessage.includes("build a routine") ||
        userMessage.includes("build my routine") ||
        userMessage.includes("give me a routine") ||
        userMessage.includes("give me my routine") ||
        userMessage.includes("create a skincare routine") ||
        userMessage.includes("create a skin care routine") ||
        userMessage.includes("create my skincare routine") ||
        userMessage.includes("create my skin care routine") ||
        userMessage.includes("make a skincare routine") ||
        userMessage.includes("make a skin care routine") ||
        userMessage.includes("my skincare routine") ||
        userMessage.includes("my skin care routine")
    )
        ? "full"
        : null;


const isPersonalizedRoutineRequest =
    routineRequestType !== null;


console.log(
    "GlowGuide routine request detection:",
    {
        routineRequestType,
        isPersonalizedRoutineRequest
    }
);


// ==========================================
// DETECT RECOMMENDATION REQUESTS SUCH AS:
//
// "I have acne, what should I use?"
// "I have sensitive skin and acne"
// "What should I use for oily skin?"
// ==========================================

// ==========================================
// DETECT EXPLICIT RECOMMENDATION REQUESTS
// ==========================================
//
// Examples:
// "What should I use for oily skin?"
// "Recommend something for acne"
// "What do you recommend for sensitive skin?"
//

const currentNeedRecommendation =
    (
        userMessage.includes("what should i use") ||
        userMessage.includes("what should i try") ||
        userMessage.includes("what can i use") ||
        userMessage.includes("what do you recommend") ||
        userMessage.includes("what would you recommend") ||
        userMessage.includes("what product should i use") ||
        userMessage.includes("what products should i use")
    ) &&
    (
        mentionsSkinType ||
        mentionsSkinConcern
    );


// ==========================================
// DETECT DIRECT RECOMMENDATION REQUESTS
// ==========================================
//
// Examples:
// "Recommend something for oily skin"
// "Suggest a product for acne"
// "Help me find something for dry skin"
//

const directCurrentNeedRecommendation =
    (
        mentionsSkinType ||
        mentionsSkinConcern
    ) &&
    (
        userMessage.includes("recommend") ||
        userMessage.includes("suggest") ||
        userMessage.includes("help me") ||
        userMessage.includes("find me")
    );


// ==========================================
// DETECT IMPLICIT PERSONALIZED REQUEST
// ==========================================
//
// Examples:
// "I have sensitive skin and acne"
// "I have oily skin"
// "My skin is dry and I have dark spots"
// "My skin type is sensitive and I have redness"
//
// These messages do not explicitly say
// "recommend", but clearly describe the
// customer's own skin situation.
//

const personalSkinStatementPatterns = [
    "i have",
    "i've got",
    "ive got",
    "my skin is",
    "my skin type is",
    "my skin has",
    "i suffer from",
    "i struggle with",
    "i'm dealing with",
    "im dealing with"
];


const isPersonalSkinStatement =
    personalSkinStatementPatterns.some(
        (pattern) =>
            userMessage.includes(pattern)
    );


// A personalized request is triggered when the
// customer describes their own skin AND mentions
// a skin type or skin concern.
const implicitPersonalizedRecommendation =
    isPersonalSkinStatement &&
    (
        mentionsSkinType ||
        mentionsSkinConcern
    );


// ==========================================
// FINAL PERSONALIZED RECOMMENDATION FLAG
// ==========================================

const shouldUsePersonalizedRecommendation =
    !isPersonalizedRoutineRequest &&
    (
        askingForPersonalizedRecommendation ||
        currentNeedRecommendation ||
        directCurrentNeedRecommendation ||
        implicitPersonalizedRecommendation
    );

console.log(
    "GlowGuide recommendation detection:",
    {
        askingForPersonalizedRecommendation,
        currentNeedRecommendation,
        directCurrentNeedRecommendation,
        implicitPersonalizedRecommendation,
        shouldUsePersonalizedRecommendation
    }
);   

// ==========================================
// DETECT "RECOMMEND WITHOUT INGREDIENT"
// Example:
// "Recommend a product that doesn't contain sulfates"
// "Find me something without fragrance"
// ==========================================

const ingredientExclusionPatterns = [
    /(?:recommend|suggest|find|show).*?(?:without|doesn't contain|does not contain|free from)\s+([a-zA-Z\s-]+)/i,
    /(?:product|something).*?(?:without|doesn't contain|does not contain|free from)\s+([a-zA-Z\s-]+)/i
];

let excludedIngredient = null;

for (const pattern of ingredientExclusionPatterns) {

    const match = message.match(pattern);

    if (match && match[1]) {

        excludedIngredient = match[1]
            .toLowerCase()
            .trim()
            .replace(/[?.!,]+$/, "");

        break;
    }
}

const askingForIngredientFreeRecommendation =
    excludedIngredient !== null;

console.log(
    "GlowGuide ingredient-free recommendation:",
    askingForIngredientFreeRecommendation,
    excludedIngredient
);
    
// ==========================================
// DETECT INGREDIENT CHECKER REQUEST
// ==========================================

const ingredientCheckerPatterns = [
    /is .* safe for me/i,
    /is this product safe/i,
    /is this safe for me/i,
    /check .* ingredients/i,
    /check the ingredients/i,
    /does .* contain/i,
    /does this contain/i,
    /ingredient checker/i,
    /check this product/i,
    /can i use this product/i,
    /can i use .* with my sensitivities/i,
    /safe with my sensitivities/i
];

const askingForIngredientCheck =
    ingredientCheckerPatterns.some(
        (pattern) =>
            pattern.test(message)
    );

console.log(
    "GlowGuide ingredient checker detected:",
    askingForIngredientCheck
);

// ==========================================
// EXPLAIN LAST RECOMMENDATION REQUEST
// ==========================================

const explanationPatterns = [
    /why did you recommend/i,
    /why did you recommend this/i,
    /why did you recommend it/i,

    /why would you recommend/i,
    /why would you recommend this/i,
    /why would you recommend it/i,

    /why do you recommend/i,
    /why do you recommend this/i,
    /why do you recommend it/i,

    /why are you recommending/i,
    /why this product/i,
    /why this one/i,
    /why is this suitable/i,
    /why is it suitable/i,
    /why is this good for me/i,
    /why did you choose/i,
    /explain this recommendation/i,
    /explain why/i
];

const askingForRecommendationExplanation =
    explanationPatterns.some((pattern) =>
        pattern.test(message)
    );

console.log(
    "GlowGuide explanation request detected:",
    askingForRecommendationExplanation
);
// ==========================================
// HANDLE INGREDIENT CHECKER REQUEST
// ==========================================

if (askingForIngredientCheck) {

    console.log(
        "GlowGuide handling ingredient checker request"
    );

    // ------------------------------------------
    // USER MUST BE LOGGED IN
    // ------------------------------------------

    if (!req.user) {

        return res.status(200).json({
            reply:
                "🌸 Please log in first so I can check products against your saved ingredient sensitivities."
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
                "🌸 Please complete the GlowGuide Beauty Quiz first so I can check products against your saved ingredient sensitivities."
        });
    }


    // ------------------------------------------
// FIND PRODUCT FOR INGREDIENT CHECK
// ------------------------------------------

const availableProducts =
    await Product.find({
        isAvailable: true
    });


// First try to find a product name
// directly mentioned in the current message
let ingredientCheckProduct =
    findBestProductMatch(
        userMessage,
        availableProducts
    );


// ------------------------------------------
// IF NO PRODUCT NAME IS IN THE MESSAGE,
// USE THE PRODUCT REMEMBERED BY CHATBOT
// ------------------------------------------

if (
    !ingredientCheckProduct &&
    lastProduct &&
    String(lastProduct).trim() !== ""
) {

    console.log(
        "GlowGuide trying remembered product:",
        lastProduct
    );

    ingredientCheckProduct =
        availableProducts.find((product) => {

            if (!product.name) {
                return false;
            }

            return (
                product.name
                    .toLowerCase()
                    .trim() ===
                String(lastProduct)
                    .toLowerCase()
                    .trim()
            );
        });
}


// ------------------------------------------
// DEBUG
// ------------------------------------------

console.log(
    "GlowGuide ingredient checker selected product:",
    ingredientCheckProduct
        ? ingredientCheckProduct.name
        : "No product found"
);


    // ------------------------------------------
    // PRODUCT NOT FOUND
    // ------------------------------------------

    if (!ingredientCheckProduct) {

        return res.status(200).json({
            reply:
                "🌸 I couldn't identify which GlowGuide product you want me to check. Please include the full product name."
        });
    }


    console.log(
        "GlowGuide ingredient checker product:",
        ingredientCheckProduct.name
    );


    // ------------------------------------------
    // FIND RECOMMENDATION DATA
    // ------------------------------------------

    const ingredientRecommendation =
        await RecommendationData.findOne({
            productId:
                ingredientCheckProduct.productId
        });


    if (!ingredientRecommendation) {

        return res.status(200).json({
            reply:
                `🌸 I found ${ingredientCheckProduct.name}, but I don't have ingredient safety information for this product yet.`
        });
    }


    // ------------------------------------------
    // GET SAVED SENSITIVITIES
    // ------------------------------------------

    const savedSensitivities =
        Array.isArray(beautyProfile.sensitivities)
            ? beautyProfile.sensitivities
            : [];


    const productWarnings =
        Array.isArray(
            ingredientRecommendation.ingredientWarnings
        )
            ? ingredientRecommendation.ingredientWarnings
            : [];


    const productIngredients =
        Array.isArray(
            ingredientRecommendation.ingredients
        )
            ? ingredientRecommendation.ingredients
            : [];


    // ------------------------------------------
    // FIND CONFLICTS
    // ------------------------------------------

    const conflicts =
        savedSensitivities.filter(
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


    // ------------------------------------------
    // CREATE DISPLAY TEXT
    // ------------------------------------------

    const ingredientText =
        productIngredients.length > 0
            ? productIngredients.join(", ")
            : "No ingredient information available";


    const warningText =
        productWarnings.length > 0
            ? productWarnings.join(", ")
            : "None";


    const sensitivityText =
        savedSensitivities.length > 0
            ? savedSensitivities.join(", ")
            : "None selected";


    // ------------------------------------------
    // UNSAFE / CONFLICT FOUND
    // ------------------------------------------

    if (conflicts.length > 0) {

        console.log(
            "GlowGuide ingredient conflict:",
            conflicts
        );

        return res.status(200).json({

            reply:
                `🧪 INGREDIENT CHECK\n\n` +

                `Product: ${ingredientCheckProduct.name}\n\n` +

                `Key Ingredients: ${ingredientText}\n` +

                `Ingredient Warnings: ${warningText}\n\n` +

                `Your Saved Sensitivities: ${sensitivityText}\n\n` +

                `⚠️ I found a conflict with your saved sensitivity to ${conflicts.join(", ")}.\n\n` +

                `Based on your GlowGuide Beauty Profile, I would avoid this product.`
        });
    }


    // ------------------------------------------
    // NO CONFLICT FOUND
    // ------------------------------------------

    return res.status(200).json({

        reply:
            `🧪 INGREDIENT CHECK\n\n` +

            `Product: ${ingredientCheckProduct.name}\n\n` +

            `Key Ingredients: ${ingredientText}\n` +

            `Ingredient Warnings: ${warningText}\n\n` +

            `Your Saved Sensitivities: ${sensitivityText}\n\n` +

            `✅ I couldn't find a conflict between this product's recorded ingredient warnings and your saved sensitivities.\n\n` +

            `Based on the ingredient information currently stored in GlowGuide, this product does not conflict with your selected sensitivities. ✨`
    });
}

// ==================================================
// HANDLE INGREDIENT-FREE PRODUCT RECOMMENDATION
// ==================================================

if (askingForIngredientFreeRecommendation) {

    console.log(
        "GlowGuide searching for products without:",
        excludedIngredient
    );

    const availableProductsForIngredientSearch =
        await Product.find({
            isAvailable: true,
            stock: { $gt: 0 }
        });

    const recommendationRecords =
        await RecommendationData.find({});

    const safeProducts = [];

    for (const product of availableProductsForIngredientSearch) {

        const recommendation =
            recommendationRecords.find((record) =>
                String(record.productId)
                    .toLowerCase()
                    .trim() ===
                String(product.productId)
                    .toLowerCase()
                    .trim()
            );

        // We need ingredient data before claiming
        // that the product avoids an ingredient.
        if (!recommendation) {
            continue;
        }

        const ingredients =
            Array.isArray(recommendation.ingredients)
                ? recommendation.ingredients
                : [];

        const warnings =
            Array.isArray(recommendation.ingredientWarnings)
                ? recommendation.ingredientWarnings
                : [];

                // Do not make an ingredient-free claim
// when no ingredient information is stored.
if (ingredients.length === 0) {
    continue;
}

        const ingredientExists =
            ingredients.some((ingredient) =>
                String(ingredient)
                    .toLowerCase()
                    .includes(excludedIngredient)
            );

        const warningExists =
            warnings.some((warning) =>
                String(warning)
                    .toLowerCase()
                    .includes(excludedIngredient)
            );

        if (!ingredientExists && !warningExists) {

            safeProducts.push(product);

        }
    }

    if (safeProducts.length === 0) {

        return res.status(200).json({
            reply:
                `🌸 I couldn't find an available GlowGuide product that I can confirm does not contain ${excludedIngredient} right now.\n\n` +
                `I only recommend products when I have enough ingredient information to check them.`
        });
    }

    const topSafeProducts =
        safeProducts.slice(0, 3);

    const productText =
        topSafeProducts
            .map(
                (product, index) =>
                    `${index + 1}. ${product.name}\n` +
                    `   Rs. ${product.price}\n` +
                    `   Stock: ${product.stock}`
            )
            .join("\n\n");

    return res.status(200).json({

        reply:
            `🌸 Here are available GlowGuide products whose recorded ingredient information does not list ${excludedIngredient}:\n\n` +
            `${productText}\n\n` +
            `✨ I checked the ingredient information currently stored in GlowGuide.`,

        recommendations:
            topSafeProducts.map((product) => ({
                productId: product.productId,
                name: product.name,
                price: product.price
            }))

    });
}


        if (shouldUsePersonalizedRecommendation) {

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
    skinType: savedSkinType,
    skinConcerns: savedSkinConcerns = [],
    budget,
    sensitivities = []
} = beautyProfile;


// ==========================================
// TEMPORARY VALUES FOR CURRENT REQUEST
//
// These DO NOT modify beautyProfile.
// ==========================================

let recommendationSkinType =
    savedSkinType;

let recommendationSkinConcerns =
    [...savedSkinConcerns];


// ==========================================
// USE CURRENT MESSAGE SKIN TYPE
// WHEN THE USER SPECIFIES ONE
// ==========================================

if (currentSkinType) {

    recommendationSkinType =
        currentSkinType
            .replace(" skin", "")
            .trim();

}


// ==========================================
// USE CURRENT MESSAGE CONCERN
// WHEN THE USER SPECIFIES ONE
// ==========================================

// ==========================================
// USE ALL CURRENT MESSAGE CONCERNS
// ==========================================
//
// Example:
// "I have sensitive skin, acne and dark spots"
//
// This will use:
// acne
// dark spots
//
// The saved Beauty Profile is NOT modified.
//

if (currentSkinConcerns.length > 0) {

    recommendationSkinConcerns =
        currentSkinConcerns.map(
            (concern) =>
                String(concern)
                    .toLowerCase()
                    .trim()
        );

}

// ==========================================
// DEBUG
// ==========================================

console.log(
    "GlowGuide recommendation values:",
    {
        savedSkinType,
        savedSkinConcerns,
        recommendationSkinType,
        recommendationSkinConcerns,
        budget,
        sensitivities
    }
);


            console.log(
    "GlowGuide personalized recommendation profile:",
    {
        skinType: recommendationSkinType,
        skinConcerns: recommendationSkinConcerns,
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

                // ==========================================
// FILTER BY REQUESTED SKINCARE TYPE
// ==========================================

if (requestedSkincareType) {

    const normalizedRequestedType =
        requestedSkincareType === "moisturiser"
            ? "moisturizer"
            : requestedSkincareType;

    const productRoutineStep =
        recommendation.routineStep
            ? recommendation.routineStep
                  .toLowerCase()
                  .trim()
            : "";

    // Skip recommendation records that are
    // not the skincare type requested
    if (
        productRoutineStep !==
        normalizedRequestedType
    ) {
        continue;
    }
}

// ==========================================
// STRICT BUDGET FILTER
// Only used when customer asks "within my budget"
// ==========================================

if (askingWithinBudget && budget) {

    const supportedBudgetLevels =
        Array.isArray(recommendation.budgetLevels)
            ? recommendation.budgetLevels.map(
                  (level) =>
                      String(level)
                          .toLowerCase()
                          .trim()
              )
            : [];

    const customerBudget =
        String(budget)
            .toLowerCase()
            .trim();

    if (
        supportedBudgetLevels.length > 0 &&
        !supportedBudgetLevels.includes(customerBudget)
    ) {
        continue;
    }
}

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
    recommendationSkinType &&
    supportedSkinTypes.includes(
        recommendationSkinType
            .toLowerCase()
            .trim()
    )
) {

    score += 30;

    reasons.push(
        `Suitable for ${recommendationSkinType} skin`
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
    recommendationSkinConcerns.filter(
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
    recommendationSkinConcerns.length > 0
) {

    const concernScore =
        (
            matchedConcerns.length /
            recommendationSkinConcerns.length
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
                        "🌸 I couldn't find a suitable GlowGuide product that matches your saved Beauty Profile right now.\n\n" +

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
    recommendationSkinConcerns.length > 0
        ? recommendationSkinConcerns.join(", ")
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

                    `🌸 Based on your current request and saved GlowGuide preferences, these are my top recommendations:\n\n` +

                    `${productText}\n\n` +

                    `I considered your ${recommendationSkinType} skin, ` +

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
        isAvailable: true,
        stock: { $gt: 0 }
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

       // ==========================================
// DETECT EXPLICIT PERSONALIZED ROUTINE REQUEST
// ==========================================

// Only trigger the personalized routine generator
// when the customer clearly asks GlowGuide to CREATE,
// GIVE, MAKE or BUILD a routine for them.

// ==========================================
// PERSONALIZED ROUTINE REQUEST
// ==========================================
//
// Routine intent was already detected earlier,
// before the recommendation system.
//
// Reuse that result here so the existing
// routine-generation code can handle it.
//

const askingForSkincareRoutine =
    isPersonalizedRoutineRequest;


console.log(
    "GlowGuide personalized routine handler:",
    {
        askingForSkincareRoutine,
        routineRequestType
    }
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

const routineCleansers = routineProducts.filter((product) => {

    const name = product.name.toLowerCase();

    return (
        name.includes("cleanser") ||
        name.includes("face wash") ||
        name.includes("facewash")
    );
});


const routineSerums = routineProducts.filter((product) => {

    const name = product.name.toLowerCase();

    return (
        name.includes("serum")
    );
});


const routineMoisturizers = routineProducts.filter((product) => {

    const name = product.name.toLowerCase();

    return (
        name.includes("moisturizer") ||
        name.includes("moisturiser") ||
        name.includes("face cream")
    );
});


const routineSunscreens = routineProducts.filter((product) => {

    const name = product.name.toLowerCase();

    return (
        name.includes("sunscreen") ||
        name.includes("sun screen") ||
        name.includes("spf")
    );
});


console.log("GlowGuide routine product matches:");

console.log(
    "Cleansers:",
    routineCleansers.map((product) => product.name)
);

console.log(
    "Serums:",
    routineSerums.map((product) => product.name)
);

console.log(
    "Moisturizers:",
    routineMoisturizers.map((product) => product.name)
);

console.log(
    "Sunscreens:",
    routineSunscreens.map((product) => product.name)
);

// ------------------------------------------
// LOAD ROUTINE RECOMMENDATION DATA
// ------------------------------------------

const routineRecommendationRecords =
    await RecommendationData.find({});

console.log(
    `GlowGuide loaded ${routineRecommendationRecords.length} recommendation records for routine`
);


// ----------------------------------------------
// FIND RECOMMENDATION DATA FOR ROUTINE PRODUCTS
// ----------------------------------------------

function getRoutineCandidates(productsForStep) {

    return productsForStep
        .map((product) => {

            const recommendation =
                routineRecommendationRecords.find((record) =>

                    String(record.productId)
                        .toLowerCase()
                        .trim() ===

                    String(product.productId)
                        .toLowerCase()
                        .trim()
                );

            return {
                product,
                recommendation
            };

        })
        .filter((item) => item.recommendation);
}


// ----------------------------------------------
// CREATE CANDIDATES FOR EACH ROUTINE STEP
// ----------------------------------------------

const cleanserCandidates =
    getRoutineCandidates(routineCleansers);

const serumCandidates =
    getRoutineCandidates(routineSerums);

const moisturizerCandidates =
    getRoutineCandidates(routineMoisturizers);

const sunscreenCandidates =
    getRoutineCandidates(routineSunscreens);


// ----------------------------------------------
// DEBUG
// ----------------------------------------------

console.log("GlowGuide routine candidates:");

console.log(
    "Cleanser candidates:",
    cleanserCandidates.map((item) => item.product.name)
);

console.log(
    "Serum candidates:",
    serumCandidates.map((item) => item.product.name)
);

console.log(
    "Moisturizer candidates:",
    moisturizerCandidates.map((item) => item.product.name)
);

console.log(
    "Sunscreen candidates:",
    sunscreenCandidates.map((item) => item.product.name)
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


// ----------------------------------------
// SELECT BEST SAFE PRODUCT FOR EACH STEP
// ----------------------------------------

function findSuitableRoutineProduct(candidates) {

    if (!Array.isArray(candidates) || candidates.length === 0) {
        return null;
    }

    // First try to find a product that fully matches
    // the saved beauty profile.
    const suitableCandidate = candidates.find((item) => {

        if (!item || !item.product || !item.recommendation) {
            return false;
        }

        return isRoutineProductSuitable(
            item.product,
            item.recommendation
        );
    });

    if (suitableCandidate) {
        return suitableCandidate.product;
    }

    // If recommendation data exists but nothing fully matches,
    // do not recommend an unsuitable product.
    return null;
}


// ----------------------------------------
// SELECT PRODUCTS
// ----------------------------------------

const safeRoutineCleanser =
    findSuitableRoutineProduct(cleanserCandidates);

const safeRoutineSerum =
    findSuitableRoutineProduct(serumCandidates);

const safeRoutineMoisturizer =
    findSuitableRoutineProduct(moisturizerCandidates);

const safeRoutineSunscreen =
    findSuitableRoutineProduct(sunscreenCandidates);


// ----------------------------------------
// TEST RESULTS
// ----------------------------------------

console.log("GlowGuide suitable routine products:");

console.log(
    "Cleanser:",
    safeRoutineCleanser
        ? `${safeRoutineCleanser.productId} - ${safeRoutineCleanser.name}`
        : "No suitable product"
);

console.log(
    "Serum:",
    safeRoutineSerum
        ? `${safeRoutineSerum.productId} - ${safeRoutineSerum.name}`
        : "No suitable product"
);

console.log(
    "Moisturizer:",
    safeRoutineMoisturizer
        ? `${safeRoutineMoisturizer.productId} - ${safeRoutineMoisturizer.name}`
        : "No suitable product"
);

console.log(
    "Sunscreen:",
    safeRoutineSunscreen
        ? `${safeRoutineSunscreen.productId} - ${safeRoutineSunscreen.name}`
        : "No suitable product"
);


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

    // ------------------------------------------
// CREATE ROUTINE DISPLAY TEXT
// ------------------------------------------

const morningRoutineText =
    `🌞 MORNING ROUTINE\n` +
    `1. Cleanser - ${
        safeRoutineCleanser
            ? safeRoutineCleanser.name
            : "No suitable cleanser currently available"
    }\n` +
    `2. Serum - ${
        safeRoutineSerum
            ? safeRoutineSerum.name
            : "No suitable serum currently available"
    }\n` +
    `3. Moisturizer - ${
        safeRoutineMoisturizer
            ? safeRoutineMoisturizer.name
            : "No suitable moisturizer currently available"
    }\n` +
    `4. Sunscreen - ${
        safeRoutineSunscreen
            ? safeRoutineSunscreen.name
            : "No suitable sunscreen currently available"
    }`;

    
const nightRoutineText =
    `🌙 NIGHT ROUTINE\n` +
    `1. Cleanser - ${
        safeRoutineCleanser
            ? safeRoutineCleanser.name
            : "No suitable cleanser currently available"
    }\n` +
    `2. Serum - ${
        safeRoutineSerum
            ? safeRoutineSerum.name
            : "No suitable serum currently available"
    }\n` +
    `3. Moisturizer - ${
        safeRoutineMoisturizer
            ? safeRoutineMoisturizer.name
            : "No suitable moisturizer currently available"
    }`;


// ------------------------------------------
// SELECT RESPONSE BASED ON REQUEST
// ------------------------------------------

let routineReply;


if (routineRequestType === "morning") {

    routineReply =
        `🌸 Here is your personalized GlowGuide morning routine.\n\n` +
        `💗 YOUR BEAUTY PROFILE\n` +
        `Skin Type: ${routineSkinType}\n` +
        `Skin Concerns: ${routineConcernText}\n` +
        `Ingredient Sensitivities: ${routineSensitivityText}\n\n` +
        `${morningRoutineText}\n\n` +
        `✨ These recommendations are based on your saved Beauty Profile and the products currently available in GlowGuide.`;

}


else if (routineRequestType === "night") {

    routineReply =
        `🌸 Here is your personalized GlowGuide night routine.\n\n` +
        `💗 YOUR BEAUTY PROFILE\n` +
        `Skin Type: ${routineSkinType}\n` +
        `Skin Concerns: ${routineConcernText}\n` +
        `Ingredient Sensitivities: ${routineSensitivityText}\n\n` +
        `${nightRoutineText}\n\n` +
        `✨ These recommendations are based on your saved Beauty Profile and the products currently available in GlowGuide.`;

}


else {

    routineReply =
        `🌸 Here is your personalized GlowGuide skincare routine.\n\n` +
        `💗 YOUR BEAUTY PROFILE\n` +
        `Skin Type: ${routineSkinType}\n` +
        `Skin Concerns: ${routineConcernText}\n` +
        `Ingredient Sensitivities: ${routineSensitivityText}\n\n` +
        `${morningRoutineText}\n\n` +
        `${nightRoutineText}\n\n` +
        `✨ These recommendations are based on your saved Beauty Profile and the products currently available in GlowGuide.`;

}


return res.status(200).json({

    reply: routineReply,

    routineProducts: {
        cleanser: safeRoutineCleanser || null,
        serum: safeRoutineSerum || null,
        moisturizer: safeRoutineMoisturizer || null,
        sunscreen: safeRoutineSunscreen || null
    }

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


        if (
    askingForRecommendation &&
    !askingForRecommendationExplanation
) {

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

                        `To recommend suitable GlowGuide products, I also need to know your skin type, budget and ingredient sensitivities.\n\n` +

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
        // 10. FIND AN EXPLICITLY MENTIONED PRODUCT
        // ==================================================

        // ==================================================
// ==================================================
// DETECT DIRECT PRODUCT-DETAIL REQUEST
// ==================================================

const productDetailRequestPatterns = [
    /^tell me about the\s+(.+)$/i,
    /^tell me about\s+(.+)$/i,
    /^give me details about\s+(.+)$/i,
    /^give me information about\s+(.+)$/i
];

let requestedProductText = null;

// Only treat these as DIRECT product-detail requests.
// Price and stock questions are handled later after
// GlowGuide finds the product name inside the message.

const isPriceOrStockQuestion =
    userMessage.includes("price") ||
    userMessage.includes("cost") ||
    userMessage.includes("how much") ||
    userMessage.includes("stock") ||
    userMessage.includes("available") ||
    userMessage.includes("availability");

if (!isPriceOrStockQuestion) {

    for (const pattern of productDetailRequestPatterns) {

        const match = message.trim().match(pattern);

        if (match && match[1]) {

            requestedProductText = match[1]
                .toLowerCase()
                .replace(/[?!.,]+$/g, "")
                .trim();

            break;
        }
    }
}
        
        // ==================================================
// FIND BEST PRODUCT MATCH
// ==================================================

let matchedProduct =
    findBestProductMatch(
        userMessage,
        products
    );
         // ==================================================
// VERIFY DIRECT PRODUCT-DETAIL REQUEST
// Prevent GlowGuide from returning a random/partial product
// when the requested product does not exist
// ==================================================

if (requestedProductText) {

    let exactRequestedProduct =
    findBestProductMatch(
        requestedProductText,
        products
    );
    // ------------------------------------------
// HANDLE PRODUCT PRONOUNS USING LAST PRODUCT
// ------------------------------------------

const productPronouns = [
    "it",
    "this",
    "that",
    "this product",
    "that product",
    "the product"
];

const isProductPronoun =
    productPronouns.includes(
        String(requestedProductText)
            .toLowerCase()
            .trim()
    );

if (
    !exactRequestedProduct &&
    isProductPronoun &&
    lastProduct &&
    String(lastProduct).trim() !== ""
) {

    console.log(
        "GlowGuide resolving product pronoun to:",
        lastProduct
    );

    exactRequestedProduct =
        products.find((product) => {

            if (!product.name) {
                return false;
            }

            return (
                product.name
                    .toLowerCase()
                    .trim() ===
                String(lastProduct)
                    .toLowerCase()
                    .trim()
            );
        });
}    

    if (!exactRequestedProduct) {

        console.log(
            "GlowGuide requested product does not exist:",
            requestedProductText
        );

        return res.status(200).json({
            reply:
                `🌸 I couldn't find "${requestedProductText}" in the GlowGuide product catalogue.\n\n` +
                `I don't want to give you information about a different product by mistake. You can ask me to show the products currently available in GlowGuide.`
        });
    }

    matchedProduct = exactRequestedProduct;
}   

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
    lastProduct &&
    (
        askingAboutPreviousProduct ||
        userMessage.includes("why did you recommend") ||
        userMessage.includes("why do you recommend") ||
        userMessage.includes("why was this recommended") ||
        userMessage.includes("why this product") ||
        userMessage.includes("why is this suitable") ||
        userMessage.includes("why is it suitable") ||
        userMessage.includes("why is this good for me")
    )
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

        console.log("WHY DEBUG =====================");
console.log("Message:", userMessage);
console.log("Last Product:", lastProduct);
console.log(
    "Matched Product:",
    matchedProduct ? matchedProduct.name : "NONE"
);
console.log("================================");

        // ==================================================
// UNKNOWN PRODUCT REQUEST PROTECTION
// Prevent unknown product questions from reaching AI
// ==================================================

const productAvailabilityPatterns = [
    /do you have (.+)/i,
    /have you got (.+)/i,
    /is (.+) available/i,
    /is there (.+)/i,
    /can i buy (.+)/i,
    /do you sell (.+)/i,
    /looking for (.+)/i
];

let requestedProductFromAvailability = null;

for (const pattern of productAvailabilityPatterns) {

    const match = userMessage.match(pattern);

    if (match && match[1]) {

        requestedProductFromAvailability = match[1]
            .replace(/[?!.,]+$/g, "")
            .trim();

        break;
    }
}


// --------------------------------------------------
// REMOVE COMMON PRODUCT WORDS
// Example:
// "vitamin c serum"
// "xyz product"
// --------------------------------------------------

if (requestedProductFromAvailability) {

    requestedProductFromAvailability =
        requestedProductFromAvailability
            .replace(/\bproduct\b$/i, "")
            .trim();
}


// --------------------------------------------------
// IF USER IS CLEARLY ASKING ABOUT A PRODUCT
// BUT NO PRODUCT WAS FOUND
// --------------------------------------------------

if (
    requestedProductFromAvailability &&
    !matchedProduct
) {

    console.log(
        "GlowGuide unknown product request:",
        requestedProductFromAvailability
    );

    return res.status(200).json({

        reply:
            `🌸 Sorry, I couldn't find "${requestedProductFromAvailability}" in the GlowGuide product catalogue.\n\n` +
            `Please check the product name or ask me to show you the products currently available in GlowGuide. 💗`

    });
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
// WHY WAS THIS PRODUCT RECOMMENDED?
// ------------------------------------------

const askingWhyRecommended =
    userMessage.includes("why did you recommend") ||
    userMessage.includes("why do you recommend") ||
    userMessage.includes("why was this recommended") ||
    userMessage.includes("why this product") ||
    userMessage.includes("why is this suitable") ||
    userMessage.includes("why is it suitable") ||
    userMessage.includes("why is this good for me");


if (askingWhyRecommended) {

    // User needs a completed Beauty Profile
    if (
        !beautyProfile ||
        beautyProfile.completed !== true
    ) {

        return res.status(200).json({
            reply:
                `🌸 I recommended ${matchedProduct.name} based on the product information available in GlowGuide.\n\n` +
                `Complete the GlowGuide Beauty Quiz so I can explain how products match your personal skin needs.`,
            productName: matchedProduct.name
        });

    }


    // Find recommendation information for this product
    const recommendation =
        await RecommendationData.findOne({
            productId: matchedProduct.productId
        });


    if (!recommendation) {

        return res.status(200).json({
            reply:
                `🌸 ${matchedProduct.name} is available in GlowGuide, but I don't have enough recommendation information to explain a personalized match for this product.`,
            productName: matchedProduct.name
        });

    }


    const reasons = [];


    // ------------------------------------------
    // SKIN TYPE
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


    if (
        beautyProfile.skinType &&
        supportedSkinTypes.includes(
            beautyProfile.skinType
                .toLowerCase()
                .trim()
        )
    ) {

        reasons.push(
            `it is suitable for your ${beautyProfile.skinType} skin`
        );

    }


    // ------------------------------------------
    // SKIN CONCERNS
    // ------------------------------------------

    const supportedConcerns =
        Array.isArray(recommendation.skinConcerns)
            ? recommendation.skinConcerns
            : [];


    const matchedConcerns =
        (beautyProfile.skinConcerns || []).filter(
            (concern) =>

                supportedConcerns.some(
                    (supportedConcern) =>

                        String(supportedConcern)
                            .toLowerCase()
                            .trim() ===

                        String(concern)
                            .toLowerCase()
                            .trim()
                )
        );


    if (matchedConcerns.length > 0) {

        reasons.push(
            `it supports your ${matchedConcerns.join(", ")} concern${matchedConcerns.length > 1 ? "s" : ""}`
        );

    }


    // ------------------------------------------
    // INGREDIENT SENSITIVITY
    // ------------------------------------------

    const warnings =
        Array.isArray(recommendation.ingredientWarnings)
            ? recommendation.ingredientWarnings
            : [];


    const hasSensitivityConflict =
        (beautyProfile.sensitivities || []).some(
            (sensitivity) =>

                warnings.some(
                    (warning) =>

                        String(warning)
                            .toLowerCase()
                            .trim() ===

                        String(sensitivity)
                            .toLowerCase()
                            .trim()
                )
        );


    if (
        beautyProfile.sensitivities &&
        beautyProfile.sensitivities.length > 0 &&
        !hasSensitivityConflict
    ) {

        reasons.push(
            "it does not conflict with your saved ingredient sensitivities"
        );

    }


    // ------------------------------------------
    // CREATE FINAL ANSWER
    // ------------------------------------------

    if (reasons.length === 0) {

        return res.status(200).json({
            reply:
                `🌸 ${matchedProduct.name} is available in GlowGuide, but I don't have enough matching information to explain a strong personalized recommendation for your current Beauty Profile.`,
            productName: matchedProduct.name
        });

    }


    const reasonText =
        reasons
            .map(
                (reason) => `• ${reason}`
            )
            .join("\n");


    return res.status(200).json({

        reply:
            `🌸 I recommended ${matchedProduct.name} because:\n\n` +
            `${reasonText}\n\n` +
            `These reasons are based on your saved GlowGuide Beauty Profile. ✨`,

        productName:
            matchedProduct.name

    });

}    


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
// RECOMMENDATION EXPLANATION
// ------------------------------------------

if (askingForRecommendationExplanation) {

    const recommendationRecord =
        await RecommendationData.findOne({
            productId: matchedProduct.productId
        });

    const reasons = [];

    // Skin type
    if (
        beautyProfile?.skinType &&
        recommendationRecord?.skinTypes?.some(
            (type) =>
                type.toLowerCase() ===
                beautyProfile.skinType.toLowerCase()
        )
    ) {
        reasons.push(
            `it is suitable for your ${beautyProfile.skinType} skin`
        );
    }

    // Skin concerns
    if (
        beautyProfile?.skinConcerns &&
        recommendationRecord?.skinConcerns
    ) {
        const matchedConcerns =
            beautyProfile.skinConcerns.filter(
                (concern) =>
                    recommendationRecord.skinConcerns.some(
                        (item) =>
                            item.toLowerCase() ===
                            concern.toLowerCase()
                    )
            );

        if (matchedConcerns.length > 0) {
            reasons.push(
                `it supports your ${matchedConcerns.join(", ")} concern`
            );
        }
    }

    // Budget
    if (
        beautyProfile?.budget &&
        recommendationRecord?.budgetLevel &&
        recommendationRecord.budgetLevel
            .toLowerCase() ===
        beautyProfile.budget.toLowerCase()
    ) {
        reasons.push(
            `it matches your ${beautyProfile.budget} budget preference`
        );
    }

    // Ingredient sensitivity
    if (
        beautyProfile?.sensitivities?.length > 0
    ) {
        reasons.push(
            "it does not conflict with your saved ingredient sensitivities"
        );
    }

    if (reasons.length > 0) {

        return res.status(200).json({

            reply:
                `🌸 I recommended ${matchedProduct.name} because:\n\n` +
                reasons
                    .map((reason) => `• ${reason}`)
                    .join("\n") +
                `\n\nThese reasons are based on your saved GlowGuide Beauty Profile. ✨`,

            productName:
                matchedProduct.name
        });
    }
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
                    `Here are some products available at GlowGuide 🌸\n\n${productList}`

            });

        }

        // ==================================================
        // 14. BEAUTY KNOWLEDGE
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

    // ------------------------------------------
// CONTROL GEMMA FALLBACK RESPONSE
// ------------------------------------------

const invalidOrOutOfScopePatterns = [
    /^[^a-zA-Z]*$/,
    /president/i,
    /prime minister/i,
    /politics/i,
    /government/i,
    /fly to the moon/i,
    /moon/i,
    /football/i,
    /cricket/i,
    /weather/i,
    /capital of/i,
    /history/i
];

const looksLikeGibberish =
    /^[a-z]{7,}$/i.test(message.trim()) ||
    /^(blah|xyz|abc|asdf|qwerty)/i.test(message.trim());

const isOutOfScope =
    invalidOrOutOfScopePatterns.some((pattern) =>
        pattern.test(message)
    );

if (looksLikeGibberish || isOutOfScope) {

    return res.status(200).json({
        reply:
            "🌸 Sorry, I didn't understand that request.\n\n" +
            "I'm GlowGuide AI, your personal beauty assistant. I can help you with:\n\n" +
            "• GlowGuide products\n" +
            "• Personalized product recommendations\n" +
            "• Your Beauty Profile\n" +
            "• Ingredients and sensitivities\n" +
            "• Skincare routines\n" +
            "• Product prices and availability\n\n" +
            "Try asking me something about beauty or a GlowGuide product. 💗"
    });

}

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