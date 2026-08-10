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
                            email : user.email,
                            firstName : user.firstName,
                            lastName : user.lastName,
                            role : user.role,
                            img : user.img
                        },
                        process.env.JWT_KEY
                    )

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
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: "prathiliyanapathirana7@gmail.com",
        pass: "xqimizsiusqaqmia"
    }

})
export async function sendOTP(req, res) {
    const randomOTP = Math.floor(100000 + Math.random() * 900000);
    const email = req.body.email;
    if(email == null){
        res.status(400).json({
            message: "Email is required"
        });
        return;
    }
    const user = await User.findOne({
        email: email
    })
    if(user == null){
        res.status(404).json({
            message:"User not found"
        })
    }
    //DELETE ALL OTPS
    await OTP.deleteMany({
        email: email
    })
    const message = {
        from: "prathiliyanapathirana7@gmail.com",
        to: email,
        subject: "Resetting password for GlowGuide",
        text: "This your password reset OTP : " + randomOTP
    }
    const otp = new OTP({
        email: email,
        otp: randomOTP
    })
    await otp.save()
    transport.sendMail(message,(error,infor)=>{
        if(error){
            res.status(500).json({
                message: "Failed to send OTP",
                error: error
            });
        }else{
            res.json({
                message: "OTP sent successfully",
                otp: randomOTP
            });
        }
    })
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

export function isAdmin(req){
    if(req.user == null){
        return false
    }

    if(req.user.role != "admin"){
    return false
   } 
   return true
}

