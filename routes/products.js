import { Router } from "express";
const router = Router();
import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } from "../controllers/products.controller.js";
import { authMiddleware } from "./../middleware/authMiddleware.js";

router.get("/", getAllProducts);
router.get("/:id", getProductById);

// 🟡 Protected routes (token required)
router.post("/",authMiddleware, createProduct);
router.put("/:id",authMiddleware, updateProduct);
router.delete("/:id",authMiddleware, deleteProduct);

export default router;
