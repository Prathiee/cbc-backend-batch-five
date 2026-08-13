import express from "express";
import { deleteProduct, getProduct, getProductById, saveProduct, searchProducts, updateProduct } from "../controllers/productController.js";

const productRouter = express.Router();

productRouter.get("/", getProduct);
productRouter.post("/", saveProduct);
productRouter.delete("/:productId", deleteProduct);
productRouter.put("/:productId", updateProduct);
productRouter.get("/search/:query", searchProducts);
productRouter.get("/:productId", getProductById);


export default productRouter;