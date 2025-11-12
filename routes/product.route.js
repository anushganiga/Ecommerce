import { Router } from "express";
import {
  getAllProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct
} from "../controllers/product.controller.js";
import authMiddleware from "../middleware/authMiddleware.js"; // optional: protect routes

const router = Router();

// 🧩 Public route (optional — can be made protected)
router.get("/", getAllProducts);

// 🧩 Get a single product by ID
router.get("/:id", getProductById);

// 🧩 Protected CRUD routes
router.post("/", authMiddleware, createProduct);
router.put("/:id", authMiddleware, updateProduct);
router.delete("/:id", authMiddleware, deleteProduct);

export default router;
