import { Router } from "express";
import { createUser, deleteUser, getAllUsers, getUserById, updateUser } from "../controllers/user.controller.js";
import authMiddleware from "../middleware/authMiddleware.js";
const router = Router();

router.get('/', authMiddleware, getAllUsers);
router.post('/create', authMiddleware, createUser);
router.get('/:id', authMiddleware,  getUserById);
router.put('/:id', authMiddleware,  updateUser);
router.delete('/:id', authMiddleware,  deleteUser);

export default router;