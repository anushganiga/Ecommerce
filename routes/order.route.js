import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
} from "../controllers/order.controller.js";

const router = Router();

router.post("/", authMiddleware, createOrder);
router.get("/", authMiddleware, getAllOrders);
router.get("/:id", authMiddleware, getOrderById);
router.put("/:id", authMiddleware, updateOrderStatus);
router.delete("/:id", authMiddleware, deleteOrder);

export default router;