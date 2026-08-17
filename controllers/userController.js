import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import axios from "axios";
import nodemailer from "nodemailer";
import { response } from "express";
import OTP from "../models/otp.js";
dotenv.config();

export function createUser(req,res) {
    if(req.body.role == "admin"){
        if(req.user!= null){
          if(req.user.role != "admin"){
            res.status(403).json({
                 message : "You are authorized to create an admin accounts"
            })
            return
          }
        }else{
            res.status(403).json({
                message : "You are not authorized to create an admin accounts please login first"
            })
            return
        }
    }

    const hashedPassword = bcrypt.hashSync(req.body.password, 10)

    const user = new User({
        firstName : req.body.firstName,
        lastName : req.body.lastName,
        email : req.body.email,
        password : hashedPassword,
        role : req.body.role
    })

    user.save().then(()=>{
            res.json({
                message : "User Added Successfully"
            });
        }).catch(()=>{
            res.json({
                message : "Failed to add User"
            });
        });
}

export function loginUser(req,res){
    const email = req.body.email
    const password = req.body.password

    User.findOne({email : email}).then(
         (user)=>{
            if(user == null){
                res.status(404).json({
                    message : "User not found"
                })
            }else{
                const isPasswordCorrect = bcrypt.compareSync(password, user.password)
                if(isPasswordCorrect){
                    const token = jwt.sign(
    {
        userId: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        img: user.img
    },
    process.env.JWT_KEY
);

                    res.json({
                        message : "Login Successful",
                        token : token,
                        role: user.role
                    })
                }else{
                    res.status(401).json({
                        message : "Invalid Password"
                    })
                }
            }
         }
    )
   
}

export async function googleLogin(req, res) {
    try {
        const accessToken = req.body.accessToken;

        if (accessToken == null) {
            res.status(400).json({
                message: "Access token is required"
            });
            return;
        }

        // Get user information from Google
        const googleResponse = await axios.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        );

        console.log(googleResponse.data);

        // Check whether user already exists
        let user = await User.findOne({
            email: googleResponse.data.email
        });

        // If user does not exist, create a new user
        if (user == null) {
            user = new User({
                email: googleResponse.data.email,
                firstName: googleResponse.data.given_name,
                lastName: googleResponse.data.family_name,
                password: "googleUser",
                role: "customer",
                img: googleResponse.data.picture
            });

            await user.save();
        }

        // Create JWT for both new and existing users
        const jwtToken = jwt.sign(
    {
        userId: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        img: user.img
    },
    process.env.JWT_KEY
);

        res.json({
            message: "Login Successful",
            token: jwtToken,
            role: user.role
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            message: "Google Login Failed"
        });
    }
}

const transport = nodemailer.createTransport({
    service: "gmail",

    auth: {
        user: process.env.CONTACT_EMAIL,
        pass: process.env.CONTACT_EMAIL_PASSWORD
    }
});
export async function sendOTP(req, res) {

    try {

        const email = req.body.email;


        // ==========================================
        // CHECK EMAIL
        // ==========================================

        if (!email) {

            return res.status(400).json({
                message: "Email is required"
            });
        }


        // ==========================================
        // FIND USER
        // ==========================================

        const user = await User.findOne({
            email: email.trim().toLowerCase()
        });


        if (!user) {

            return res.status(404).json({
                message: "User not found"
            });
        }


        // ==========================================
        // GENERATE 6 DIGIT OTP
        // ==========================================

        const randomOTP =
            Math.floor(100000 + Math.random() * 900000);


        // ==========================================
        // DELETE PREVIOUS OTPs
        // ==========================================

        await OTP.deleteMany({
            email: email.trim().toLowerCase()
        });


        // ==========================================
        // SAVE NEW OTP
        // ==========================================

        const otp = new OTP({

            email: email.trim().toLowerCase(),

            otp: randomOTP
        });


        await otp.save();


        // ==========================================
        // EMAIL
        // ==========================================

        const message = {

            from:
                `"Glow Guide Customer Care" <${process.env.CONTACT_EMAIL}>`,

            to: email.trim().toLowerCase(),

            subject: "Glow Guide Password Reset OTP",

            text:
`Hello ${user.firstName},

We received a request to reset your Glow Guide password.

Your password reset OTP is:

${randomOTP}

Please enter this OTP on the Glow Guide password reset page.

If you did not request a password reset, you can ignore this email.

Kind regards,
Glow Guide Customer Care
Beauty at your side ♡`
        };


        // ==========================================
        // SEND EMAIL
        // ==========================================

        await transport.sendMail(message);


        // IMPORTANT:
        // Do NOT return OTP to frontend

        return res.json({
            message: "OTP sent successfully"
        });


    } catch (error) {

        console.error(
            "OTP sending error:",
            error
        );


        return res.status(500).json({
            message: "Failed to send OTP"
        });
    }
}

export async function resetPassword(req, res) {
    const otp = req.body.otp
    const email = req.body.email
    const newPassword = req.body.newPassword

    const response = await OTP.findOne({
        email: email
    })
    if(response == null){
        res.status(500).json({
            message: "No Otp requests found please try again"
        })
        return
    }
    if(otp == response.otp){
          await OTP.deleteMany({
            email:email
          }
            
          )
          const hashPassword = bcrypt.hashSync(newPassword, 10)
          const response2 = await User.updateOne(
            {email : email},
            {password : hashPassword}
          )
          res.json({
            message: "Password has been reset successfully"
          })
    }else{
        res.status(403).json({
            message: "OTPs are not matching"
        })
    }
}

export async function getUser(req, res) {

    try {

        // Check whether customer is logged in
        if (req.user == null) {

            return res.status(401).json({
                message: "Please login first"
            });
        }


        // Get the latest customer information
        // from MongoDB using the userId inside JWT
        const user = await User
            .findById(req.user.userId)
            .select("-password");


        // Customer no longer exists
        if (!user) {

            return res.status(404).json({
                message: "User not found"
            });
        }


        // Send customer details to frontend
        res.json(user);


    } catch (error) {

        console.error("Get user error:", error);

        res.status(500).json({
            message: "Failed to get user details"
        });
    }
}

export function isAdmin(req){
    if(req.user == null){
        return false
    }

    if(req.user.role != "admin"){
    return false
   } 
   return true
}

// ======================================================
// GET ALL USERS - ADMIN ONLY
// ======================================================

export async function getAllUsers(req, res) {

    try {

        if (!isAdmin(req)) {
            return res.status(403).json({
                message: "You are not authorized to view all users"
            });
        }

        // Do not send passwords to the frontend
        const users = await User.find().select("-password");

        res.json(users);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to get users"
        });
    }
}


// ======================================================
// GET ONE USER - ADMIN ONLY
// ======================================================

export async function getUserById(req, res) {

    try {

        if (!isAdmin(req)) {
            return res.status(403).json({
                message: "You are not authorized to view this user"
            });
        }

        const user = await User
            .findById(req.params.userId)
            .select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json(user);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to get user"
        });
    }
}


// ======================================================
// UPDATE USER - ADMIN ONLY
// ======================================================

export async function updateUser(req, res) {

    try {

        if (!isAdmin(req)) {
            return res.status(403).json({
                message: "You are not authorized to update users"
            });
        }

        const userId = req.params.userId;

        const updateData = {};

        if (req.body.firstName !== undefined) {
            updateData.firstName = req.body.firstName;
        }

        if (req.body.lastName !== undefined) {
            updateData.lastName = req.body.lastName;
        }

        if (req.body.email !== undefined) {
            updateData.email = req.body.email;
        }

        if (req.body.role !== undefined) {
            updateData.role = req.body.role;
        }

        if (req.body.isBlocked !== undefined) {
            updateData.isBlocked = req.body.isBlocked;
        }

        if (req.body.img !== undefined) {
            updateData.img = req.body.img;
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            {
                new: true,
                runValidators: true
            }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json({
            message: "User updated successfully",
            user: updatedUser
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to update user"
        });
    }
}


// ======================================================
// DELETE USER - ADMIN ONLY
// ======================================================

export async function deleteUser(req, res) {

    try {

        if (!isAdmin(req)) {
            return res.status(403).json({
                message: "You are not authorized to delete users"
            });
        }

        const user = await User.findByIdAndDelete(
            req.params.userId
        );

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json({
            message: "User deleted successfully"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to delete user"
        });
    }
}

export async function saveBeautyProfile(req, res) {

    try {

        // ==========================================
        // CHECK LOGIN
        // ==========================================

        if (!req.user || !req.user.userId) {

            return res.status(403).json({
                message: "Please login to save your beauty profile"
            });

        }


        // ==========================================
        // GET LOGGED-IN USER ID
        // ==========================================

        const userId = req.user.userId;

        console.log(
            "Saving beauty profile for user:",
            userId
        );


        // ==========================================
        // GET QUIZ DATA
        // ==========================================

        const {
            skinType,
            skinConcerns,
            budget,
            sensitivities
        } = req.body;


        console.log("Received beauty profile data:", {
            skinType,
            skinConcerns,
            budget,
            sensitivities
        });


        // ==========================================
        // FIND CUSTOMER
        // ==========================================

        const user = await User.findById(userId);

        if (!user) {

            return res.status(404).json({
                message: "User not found"
            });

        }


        // ==========================================
        // SAVE BEAUTY PROFILE
        // ==========================================

        user.beautyProfile = {

            skinType: skinType || "",

            skinConcerns:
                Array.isArray(skinConcerns)
                    ? skinConcerns
                    : [],

            budget: budget || "",

            sensitivities:
                Array.isArray(sensitivities)
                    ? sensitivities
                    : [],

            completed: true,

            updatedAt: new Date()

        };


        await user.save();


        // ==========================================
        // SUCCESS LOG
        // ==========================================

        console.log(
            "Beauty profile saved successfully:",
            user.beautyProfile
        );


        // ==========================================
        // RESPONSE
        // ==========================================

        return res.status(200).json({

            message:
                "Beauty profile saved successfully",

            beautyProfile:
                user.beautyProfile

        });


    } catch (error) {

        console.error(
            "Save beauty profile error:",
            error
        );


        return res.status(500).json({

            message:
                "Failed to save beauty profile"

        });

    }

}