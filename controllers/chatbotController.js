import Product from "../models/product.js";

export async function sendChatMessage(req, res) {

    try {

        const { message } = req.body;

        // -----------------------------------------
        // 1. VALIDATE MESSAGE
        // -----------------------------------------

        if (!message || message.trim() === "") {

            return res.status(400).json({
                message: "Please enter a message."
            });

        }

        console.log("GlowGuide received:", message);

        const userMessage = message
            .toLowerCase()
            .trim();

        // -----------------------------------------
        // 2. SIMPLE GREETINGS
        // -----------------------------------------

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

        // -----------------------------------------
        // 3. GET AVAILABLE PRODUCTS
        // -----------------------------------------

        const products = await Product.find({
            isAvailable: true
        });

        console.log(
            `GlowGuide checking ${products.length} available products`
        );


        // -----------------------------------------
// BUDGET SEARCH
// -----------------------------------------

const budgetWords = [
    "under",
    "below",
    "less than"
];

const askingBudget = budgetWords.some(
    (word) => userMessage.includes(word)
);

if (askingBudget) {

    const numbers = userMessage.match(/\d+/g);

    if (numbers && numbers.length > 0) {

        const maximumPrice = Number(numbers[0]);

        const affordableProducts = products
            .filter(
                (product) =>
                    product.price <= maximumPrice
            )
            .sort(
                (a, b) =>
                    a.price - b.price
            );

        if (affordableProducts.length === 0) {

            return res.status(200).json({
                reply:
                    `Sorry 🌸 I couldn't find any available products under Rs. ${maximumPrice}.`
            });

        }

        const productList = affordableProducts
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

// -----------------------------------------
// CATEGORY SEARCH
// -----------------------------------------

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

for (const keyword in categoryMap) {

    if (userMessage.includes(keyword)) {
        requestedCategory = categoryMap[keyword];
        break;
    }
}

if (requestedCategory) {

    const categoryProducts = products.filter(
        (product) =>
            product.category &&
            product.category.toLowerCase() ===
            requestedCategory.toLowerCase()
    );

    if (categoryProducts.length === 0) {

        return res.status(200).json({
            reply:
                `Sorry 🌸 I couldn't find any available ${requestedCategory} products right now.`
        });
    }

    const productList = categoryProducts
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

        // -----------------------------------------
        // 4. FIND PRODUCT MENTIONED BY CUSTOMER
        // -----------------------------------------

        const matchedProduct = products.find((product) => {

            const productName =
                product.name.toLowerCase();

            // Check normal product name
            if (userMessage.includes(productName)) {
                return true;
            }

            // Check alternative names
            if (
                product.altNames &&
                product.altNames.length > 0
            ) {

                return product.altNames.some((altName) => {

                    return userMessage.includes(
                        altName.toLowerCase()
                    );

                });

            }

            return false;

        });

        // -----------------------------------------
        // 5. CUSTOMER MENTIONED A PRODUCT
        // -----------------------------------------

        if (matchedProduct) {

            console.log(
                "GlowGuide matched product:",
                matchedProduct.name
            );

            // -------------------------------------
            // PRICE QUESTION
            // -------------------------------------

            const priceWords = [
                "price",
                "cost",
                "how much",
                "what is the price"
            ];

            const askingPrice = priceWords.some(
                (word) => userMessage.includes(word)
            );

            if (askingPrice) {

                return res.status(200).json({

                    reply:
                        `🌸 ${matchedProduct.name} is currently Rs. ${matchedProduct.price}.`

                });

            }

            // -------------------------------------
            // STOCK QUESTION
            // -------------------------------------

            const stockWords = [
                "stock",
                "available",
                "availability",
                "do you have",
                "have this"
            ];

            const askingStock = stockWords.some(
                (word) => userMessage.includes(word)
            );

            if (askingStock) {

                if (matchedProduct.stock > 0) {

                    return res.status(200).json({

                        reply:
                            `Yes 🌸 ${matchedProduct.name} is currently in stock. We have ${matchedProduct.stock} available.`

                    });

                } else {

                    return res.status(200).json({

                        reply:
                            `Sorry 🌸 ${matchedProduct.name} is currently out of stock.`

                    });

                }

            }

            // -------------------------------------
            // PRODUCT DETAILS
            // -------------------------------------

            const detailWords = [
                "tell me about",
                "details",
                "information",
                "describe",
                "what is"
            ];

            const askingDetails = detailWords.some(
                (word) => userMessage.includes(word)
            );

            if (askingDetails) {

                return res.status(200).json({

                    reply:
                        `🌸 ${matchedProduct.name}\n\n` +
                        `${matchedProduct.description}\n\n` +
                        `Category: ${matchedProduct.category}\n` +
                        `Price: Rs. ${matchedProduct.price}\n` +
                        `Stock: ${matchedProduct.stock}`

                });

            }

            // -------------------------------------
            // PRODUCT NAME ONLY / GENERAL QUESTION
            // -------------------------------------

            return res.status(200).json({

                reply:
                    `I found ${matchedProduct.name} 🌸\n\n` +
                    `${matchedProduct.description}\n\n` +
                    `Price: Rs. ${matchedProduct.price}\n` +
                    (
                        matchedProduct.stock > 0
                            ? `In Stock (${matchedProduct.stock})`
                            : "Currently Out of Stock"
                    )

            });

        }

        // -----------------------------------------
        // 6. SHOW ALL SKIN CARE PRODUCTS
        // -----------------------------------------

        if (
            userMessage.includes("skin care") ||
            userMessage.includes("skincare")
        ) {

            const skincareProducts = products.filter(
                (product) =>
                    product.category === "Skin Care"
            );

            if (skincareProducts.length === 0) {

                return res.status(200).json({
                    reply:
                        "Sorry 🌸 We currently don't have any skin care products available."
                });

            }

            const productList = skincareProducts
                .map(
                    (product) =>
                        `• ${product.name} - Rs. ${product.price}`
                )
                .join("\n");

            return res.status(200).json({

                reply:
                    `Here are our available skin care products 🌸\n\n${productList}`

            });

        }

        // -----------------------------------------
        // 7. SHOW PRODUCTS BY CATEGORY
        // -----------------------------------------

        const categories = [
            {
                words: ["makeup", "make up"],
                category: "Makeup"
            },
            {
                words: ["hair care", "haircare"],
                category: "Hair Care"
            },
            {
                words: ["body care", "bodycare"],
                category: "Body Care"
            },
            {
                words: ["fragrance", "perfume"],
                category: "Fragrance"
            }
        ];

        const matchedCategory = categories.find(
            (item) =>
                item.words.some(
                    (word) =>
                        userMessage.includes(word)
                )
        );

        if (matchedCategory) {

            const categoryProducts = products.filter(
                (product) =>
                    product.category ===
                    matchedCategory.category
            );

            if (categoryProducts.length === 0) {

                return res.status(200).json({

                    reply:
                        `Sorry 🌸 We currently don't have any ${matchedCategory.category} products available.`

                });

            }

            const productList = categoryProducts
                .map(
                    (product) =>
                        `• ${product.name} - Rs. ${product.price}`
                )
                .join("\n");

            return res.status(200).json({

                reply:
                    `Here are our available ${matchedCategory.category} products 🌸\n\n${productList}`

            });

        }

    

        // -----------------------------------------
        // 9. CUSTOMER ASKS WHAT PRODUCTS EXIST
        // -----------------------------------------

        if (
            userMessage.includes("what products") ||
            userMessage.includes("show products") ||
            userMessage.includes("show me products") ||
            userMessage.includes("products do you have")
        ) {

            if (products.length === 0) {

                return res.status(200).json({
                    reply:
                        "Sorry 🌸 There are currently no products available."
                });

            }

            const productList = products
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

        // -----------------------------------------
        // 10. FALLBACK RESPONSE
        // -----------------------------------------

        return res.status(200).json({

            reply:
                "I'm still learning that question 🌸 You can ask me about product prices, availability, product details, categories, or products within your budget."

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