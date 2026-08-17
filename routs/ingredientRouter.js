import express from "express";
import {
    checkIngredient
} from "../controllers/ingredientController.js";

const ingredientRouter = express.Router();

ingredientRouter.post("/check", checkIngredient);

export default ingredientRouter;