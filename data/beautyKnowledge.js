const beautyKnowledge = [

    // ==================================================
    // SKIN TYPES
    // ==================================================

    {
        type: "skinType",

        name: "Oily Skin",

        keywords: [
            "oily skin",
            "what is oily skin"
        ],

        answer:
            "Oily skin produces more natural oil (sebum), which can make the skin look shiny and may contribute to clogged pores. 🌸 A gentle cleanser, lightweight moisturizer and suitable sunscreen can be useful in a basic oily-skin routine."
    },

    {
        type: "skinType",

        name: "Dry Skin",

        keywords: [
            "dry skin",
            "what is dry skin"
        ],

        answer:
            "Dry skin may feel tight, rough or flaky because it does not retain enough moisture. 🌸 Gentle cleansing and a good moisturizer can help support the skin's moisture barrier."
    },

    {
        type: "skinType",

        name: "Combination Skin",

        keywords: [
            "combination skin",
            "what is combination skin"
        ],

        answer:
            "Combination skin has both oily and dry or normal areas. 🌸 For example, the forehead, nose and chin may be oily while the cheeks may feel normal or dry."
    },

    {
        type: "skinType",

        name: "Sensitive Skin",

        keywords: [
            "sensitive skin",
            "what is sensitive skin"
        ],

        answer:
            "Sensitive skin may react more easily to certain products or ingredients. 🌸 It can sometimes experience redness, dryness or irritation, so gentle products are usually preferred."
    },

    {
        type: "skinType",

        name: "Normal Skin",

        keywords: [
            "normal skin",
            "what is normal skin"
        ],

        answer:
            "Normal skin is generally well balanced, meaning it is neither very oily nor very dry. 🌸 A simple routine with cleansing, moisturizing and sun protection can help maintain it."
    },


    // ==================================================
    // INGREDIENT KNOWLEDGE
    // ==================================================

    {
        type: "ingredient",

        name: "Vitamin C",

        keywords: [
            "vitamin c",
            "what is vitamin c",
            "vitamin c good for",
            "benefits of vitamin c"
        ],

        suitableSkinTypes: [
            "Oily",
            "Dry",
            "Combination",
            "Normal"
        ],

        suitableConcerns: [
            "Dark Spots",
            "Aging"
        ],

        answer:
            "Vitamin C is a popular skincare antioxidant. ✨ It can help brighten the appearance of the skin and improve the appearance of uneven skin tone and dark spots."
    },


    {
        type: "ingredient",

        name: "Niacinamide",

        keywords: [
            "niacinamide",
            "what is niacinamide",
            "niacinamide good for",
            "benefits of niacinamide"
        ],

        suitableSkinTypes: [
            "Oily",
            "Combination",
            "Normal"
        ],

        suitableConcerns: [
            "Oiliness",
            "Dark Spots",
            "Acne"
        ],

        answer:
            "Niacinamide is a form of Vitamin B3 commonly used in skincare. 🌸 It can help support the skin barrier and improve the appearance of uneven tone and excess oil."
    },


    {
        type: "ingredient",

        name: "Hyaluronic Acid",

        keywords: [
            "hyaluronic acid",
            "what is hyaluronic acid",
            "hyaluronic acid good for",
            "benefits of hyaluronic acid"
        ],

        suitableSkinTypes: [
            "Oily",
            "Dry",
            "Combination",
            "Sensitive",
            "Normal"
        ],

        suitableConcerns: [
            "Dryness"
        ],

        answer:
            "Hyaluronic Acid is a moisture-attracting ingredient commonly used in skincare. 💧 It helps the skin retain moisture and can make the skin feel more hydrated."
    },


    {
        type: "ingredient",

        name: "Ceramides",

        keywords: [
            "ceramides",
            "ceramide",
            "what are ceramides",
            "what is ceramide",
            "benefits of ceramides"
        ],

        suitableSkinTypes: [
            "Dry",
            "Sensitive",
            "Combination",
            "Normal"
        ],

        suitableConcerns: [
            "Dryness",
            "Redness"
        ],

        answer:
            "Ceramides are lipids that are naturally found in the skin barrier. 🌸 Skincare products containing ceramides can help support the skin barrier and reduce moisture loss."
    },


    {
        type: "ingredient",

        name: "Salicylic Acid",

        keywords: [
            "salicylic acid",
            "what is salicylic acid",
            "salicylic acid good for",
            "benefits of salicylic acid"
        ],

        suitableSkinTypes: [
            "Oily",
            "Combination"
        ],

        suitableConcerns: [
            "Acne",
            "Oiliness"
        ],

        answer:
            "Salicylic Acid is a beta hydroxy acid (BHA) commonly used in skincare. 🌸 It can help remove excess oil and dead skin cells from pores, so it is often used in products for oily and acne-prone skin."
    },


    {
        type: "ingredient",

        name: "Retinol",

        keywords: [
            "retinol",
            "what is retinol",
            "retinol good for",
            "benefits of retinol"
        ],

        suitableSkinTypes: [
            "Oily",
            "Combination",
            "Normal"
        ],

        suitableConcerns: [
            "Acne",
            "Aging",
            "Dark Spots"
        ],

        answer:
            "Retinol is a form of Vitamin A commonly used in skincare. 🌸 It can help improve the appearance of acne, fine lines and uneven skin texture. It may cause irritation for some people, especially when first introduced into a routine."
    },


    // ==================================================
    // INGREDIENT SENSITIVITY KNOWLEDGE
    // ==================================================

    {
        type: "sensitivity",

        name: "Fragrance",

        keywords: [
            "fragrance",
            "what is fragrance",
            "fragrance in skincare",
            "is fragrance safe"
        ],

        answer:
            "Fragrance is added to some skincare products to give them a pleasant smell. 🌸 Some people with sensitive skin may experience irritation from certain fragrances, so fragrance-free products may be preferred if your skin is sensitive to fragrance."
    },


    {
        type: "sensitivity",

        name: "Alcohol",

        keywords: [
            "alcohol",
            "alcohol in skincare",
            "what is alcohol in skincare",
            "is alcohol bad for skin"
        ],

        answer:
            "Different types of alcohol are used in skincare for different purposes. 🌸 Some can help product texture or absorption, while others may feel drying or irritating for some skin types. The effect depends on the type of alcohol and the complete product formula."
    },


    {
        type: "sensitivity",

        name: "Parabens",

        keywords: [
            "parabens",
            "paraben",
            "what are parabens",
            "parabens in skincare"
        ],

        answer:
            "Parabens are preservatives used in some cosmetic and skincare products to help prevent the growth of harmful microorganisms and increase product shelf life. 🌸"
    },


    {
        type: "sensitivity",

        name: "Sulfates",

        keywords: [
            "sulfates",
            "sulfate",
            "what are sulfates",
            "sulfates in skincare"
        ],

        answer:
            "Sulfates are cleansing ingredients found in some skincare and personal care products. 🌸 They help remove oil and dirt, but some people may find certain sulfate-based cleansers drying or irritating."
    },


    // ==================================================
    // BASIC SKINCARE ROUTINE
    // ==================================================

    {
        type: "routine",

        name: "Basic Skincare Routine",

        keywords: [
            "skincare routine",
            "skin care routine",
            "basic skincare routine",
            "basic skin care routine"
        ],

        answer:
            "A simple skincare routine can include: 🌸\n\n" +
            "1. Cleanser 🧼\n" +
            "2. Moisturizer 🧴\n" +
            "3. Sunscreen ☀️ during the daytime.\n\n" +
            "Additional products such as serums can be added depending on your skin needs."
    },


    {
        type: "routine",

        name: "Moisturizer",

        keywords: [
            "moisturizer",
            "should i use moisturizer",
            "why use moisturizer"
        ],

        answer:
            "Moisturizer helps reduce moisture loss and supports the skin barrier. 🧴 Different skin types may prefer different textures, such as lightweight moisturizers for oily skin or richer moisturizers for dry skin."
    },


    {
        type: "routine",

        name: "Sunscreen",

        keywords: [
            "sunscreen",
            "what does sunscreen do",
            "why use sunscreen",
            "why should i use sunscreen"
        ],

        answer:
            "Sunscreen helps protect the skin from ultraviolet (UV) radiation. ☀️ Regular sun protection is an important part of a daytime skincare routine."
    }

];


export default beautyKnowledge;