import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getCart } from "../controllers/cart.controller.js";
import { addToCart } from "../controllers/cart.controller.js";
import { updateCartItem } from "../controllers/cart.controller.js";
import { removeCartItem } from "../controllers/cart.controller.js";
import { clearCart } from "../controllers/cart.controller.js";

const router = Router();

// 🛒 Get logged-in user's cart
router.get("/", authMiddleware, getCart);

// ➕ Add item to cart
router.post("/", authMiddleware, addToCart);

// 🔄 Update quantity of an existing cart item
router.put("/:itemId", authMiddleware, updateCartItem);

// ❌ Remove a specific item from cart
router.delete("/:itemId", authMiddleware, removeCartItem);

// 🧹 Clear entire cart
router.delete("/", authMiddleware, clearCart);

export default router;
