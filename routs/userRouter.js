import express from "express";
import { createUser, getUser, googleLogin, loginUser, resetPassword, sendOTP, getAllUsers, getUserById, updateUser, deleteUser } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/register", createUser)
userRouter.post("/login", loginUser)
userRouter.post("/google-login", googleLogin)
userRouter.post("/send-OTP", sendOTP)
userRouter.post("/reset-password", resetPassword)
userRouter.get("/", getUser)

// ======================================================
// ADMIN USER MANAGEMENT
// ======================================================

// Get all users
userRouter.get("/all", getAllUsers);

// Get one user
userRouter.get("/:userId", getUserById);

// Update user
userRouter.put("/:userId", updateUser);

// Delete user
userRouter.delete("/:userId", deleteUser);


export default userRouter;