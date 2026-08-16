import mongoose from "mongoose";

const contactSchema = mongoose.Schema(
    {
        userEmail: {
            type: String,
            default: "",
            lowercase: true,
            trim: true
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },

        subject: {
            type: String,
            required: true,
            trim: true
        },

        message: {
            type: String,
            required: true,
            trim: true
        },

        status: {
            type: String,
            enum: ["unread", "read", "replied"],
            default: "unread"
        },

        // Store the reply sent by admin
        adminReply: {
            type: String,
            default: ""
        },

        // Store when the reply was sent
        repliedAt: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

const Contact = mongoose.model("contacts", contactSchema);

export default Contact;