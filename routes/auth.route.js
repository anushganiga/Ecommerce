import { Router } from "express";
import {
  loginUser,
  verifyLogin,
  newRefreshtoken,
  logout
} from "../controllers/auth.controller.js";

const router = Router();

// Step 1: Request OTP / login
router.post("/login", loginUser);

// Step 2: Verify OTP and generate tokens
router.post("/verify", verifyLogin);

// Refresh access token when expired
router.post("/refreshtoken", newRefreshtoken);

// Logout
router.post("/logout", logout);

export default router;
