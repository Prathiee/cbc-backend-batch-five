import express from "express";
import { createOrder, getOrders, updateOrderStatus, updateDeliveryInfo } from "../controllers/orderController.js";

const orderRouter = express.Router();

orderRouter.post("/", createOrder)
orderRouter.get("/", getOrders)
orderRouter.put("/delivery/:orderId", updateDeliveryInfo)
orderRouter.put("/:orderId/:status",updateOrderStatus)


export default orderRouter;