import beautyKnowledge from "../data/beautyKnowledge.js";
import User from "../models/user.js";

export async function checkIngredient(req, res) {

    try {

        const { ingredient } = req.body;

        // -----------------------------------------
        // VALIDATION
        // -----------------------------------------

        if (!ingredient || ingredient.trim() === "") {

            return res.status(400).json({
                message: "Please enter an ingredient."
            });

        }

        const userIngredient =
            ingredient.toLowerCase().trim();


        // -----------------------------------------
        // SEARCH BEAUTY KNOWLEDGE
        // -----------------------------------------

        const knowledge =
            beautyKnowledge.find((item) =>

                item.keywords.some(
                    (keyword) =>
                        keyword.toLowerCase().trim() ===
                        userIngredient
                )

            );


        // -----------------------------------------
        // INGREDIENT NOT FOUND
        // -----------------------------------------

        if (!knowledge) {

            return res.status(200).json({

                found: false,

                ingredient: ingredient,

                answer:
                    "🌸 Sorry, GlowGuide does not have information about this ingredient yet."

            });

        }


        // -----------------------------------------
        // DEFAULT RESPONSE
        // -----------------------------------------

        let beautyProfile = null;
        let sensitivityConflict = false;
        let sensitivities = [];


        // -----------------------------------------
        // GET LOGGED-IN USER BEAUTY PROFILE
        // -----------------------------------------

        if (req.user) {

            const user = await User.findOne({
                email: req.user.email
            });

            if (user && user.beautyProfile) {

                beautyProfile =
                    user.beautyProfile;

                sensitivities =
                    Array.isArray(
                        beautyProfile.sensitivities
                    )
                        ? beautyProfile.sensitivities
                        : [];


                // ---------------------------------
                // CHECK SAVED SENSITIVITIES
                // ---------------------------------

                sensitivityConflict =
                    sensitivities.some(
                        (sensitivity) =>

                            sensitivity
                                .toLowerCase()
                                .trim() ===
                            userIngredient

                    );

            }

        }


        // -----------------------------------------
        // SEND RESULT
        // -----------------------------------------

        return res.status(200).json({

            found: true,

            ingredient: ingredient,

            answer: knowledge.answer,

            personalized:
                beautyProfile ? true : false,

            beautyProfile:
                beautyProfile
                    ? {
                        skinType:
                            beautyProfile.skinType,

                        skinConcerns:
                            beautyProfile.skinConcerns,

                        budget:
                            beautyProfile.budget,

                        sensitivities:
                            sensitivities
                    }
                    : null,

            sensitivityConflict:
                sensitivityConflict

        });


    } catch (error) {

        console.error(
            "Ingredient checker error:",
            error
        );

        return res.status(500).json({

            message:
                "GlowGuide could not check this ingredient right now."

        });

    }

}