import axios from "axios";

export async function askOllama(req, res) {

    try {

        const { message } = req.body;

        if (!message || message.trim() === "") {
            return res.status(400).json({
                message: "Please enter a message"
            });
        }

        console.log("GlowGuide AI question:", message);

        const response = await axios.post(
            "http://localhost:11434/api/chat",
            {
                model: "gemma3:1b",

                messages: [
                    {
                        role: "system",
                        content:
                            `You are GlowGuide AI, the beauty assistant for the GlowNest cosmetics shopping website.

Your job is to provide simple and helpful skincare and cosmetics information.

Rules:
- Call yourself GlowGuide AI.
- Use simple English.
- Keep answers clear and reasonably short.
- Focus on skincare, cosmetics, beauty products and ingredients.
- Do not pretend to diagnose medical conditions.
- Do not guarantee that a product or ingredient is safe for everyone.
- If a user describes a serious skin problem, advise them to speak with a qualified healthcare professional.
- Never invent information about GlowNest products.
- Product recommendations and ingredient sensitivity decisions are handled by the GlowNest recommendation system.`
                    },

                    {
                        role: "user",
                        content: message
                    }
                ],

                stream: false
            },
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        const aiReply =
            response.data?.message?.content;

        if (!aiReply) {
            return res.status(500).json({
                message:
                    "GlowGuide AI did not return a response."
            });
        }

        console.log("GlowGuide AI response:", aiReply);

        return res.status(200).json({
            reply: aiReply
        });

    } catch (error) {

        console.error(
            "Ollama connection error:",
            error.response?.data || error.message
        );

        return res.status(500).json({
            message:
                "GlowGuide AI is currently unavailable."
        });
    }
}