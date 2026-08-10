import express from "express";
import { createUser, googleLogin, loginUser, resetPassword, sendOTP } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/register", createUser)
userRouter.post("/login", loginUser)
userRouter.post("/google-login", googleLogin)
userRouter.post("/send-OTP", sendOTP)
userRouter.post("/reset-password", resetPassword)

export default userRouter;