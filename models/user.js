import mongoose from "mongoose";

const userSchema = mongoose.Schema({

    email: {
        type: String,
        required: true,
        unique: true,
    },

    firstName: {
        type: String,
        required: true
    },

    lastName: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true
    },

    role: {
        type: String,
        required: true,
        default: "customer"
    },

    isBlocked: {
        type: Boolean,
        required: true,
        default: false
    },

    img: {
        type: String,
        required: false,
        default: "https://avatar.iran.liara.run/public/boy?username=Ash"
    },

    // -----------------------------------------
    // BEAUTY QUIZ PROFILE
    // -----------------------------------------

    beautyProfile: {

        skinType: {
            type: String,
            default: ""
        },

        skinConcerns: {
            type: [String],
            default: []
        },

        budget: {
            type: String,
            default: ""
        },

        sensitivities: {
            type: [String],
            default: []
        },

        completed: {
            type: Boolean,
            default: false
        },

        updatedAt: {
            type: Date,
            default: null
        }

    }

});

const User = mongoose.model("users", userSchema);

export default User;