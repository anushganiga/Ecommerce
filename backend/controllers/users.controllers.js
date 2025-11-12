// Import packages first
import { PrismaClient } from "@prisma/client";
import { hash, compare } from "bcryptjs";
import jwt from "jsonwebtoken"; // For verify
import { set, get, del } from "../utils/redisClient.js";
import { generateAccessToken, generateRefreshToken } from "../utils/generateToken.js";
import envconfig from "../utils/constants.js";

// Initialize Prisma
const prisma = new PrismaClient();

// Destructure verify from jwt (since jsonwebtoken is CommonJS)
const { verify } = jwt;

// Read refresh token secret from env
const REFRESH_TOKEN_SECRET = envconfig.REFRESH_TOKEN_SECRET;

// Export all helper functions if needed
export {
  prisma,
  hash,
  compare,
  verify,
  set,
  get,
  del,
  generateAccessToken,
  generateRefreshToken,
  REFRESH_TOKEN_SECRET,
};


// --- GET ALL USERS --- //
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     description: Fetches all users from the database, using Redis cache for performance.
 *     tags:
 *       - Users
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 source:
 *                   type: string
 *                   example: cache
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: Anush
 *                       email:
 *                         type: string
 *                         example: anush@example.com
 *       500:
 *         description: Internal Server Error
 */
export const getAllUsers = async (req, res) => {
  try {
    const cacheKey = "users:all";
    const cached = await get(cacheKey);

    if (cached) {
      console.log("📦 Returning cached users");
      return res.status(200).json({ source: "cache", data: JSON.parse(cached) });
    }

    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true },
    });

    await set(cacheKey, JSON.stringify(users));

    console.log("⚡ Returning users from DB");
    res.status(200).json({ source: "db", data: users });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// --- GET USER BY ID --- //
export const usersById = async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `user:${id}`;

    const cachedUser = await get(cacheKey);
    if (cachedUser) {
      console.log(`📦 Returning cached user ${id}`);
      return res.status(200).json({ source: "cache", data: JSON.parse(cachedUser) });
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: { id: true, name: true, email: true },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    await set(cacheKey, JSON.stringify(user));
    res.status(200).json({ source: "db", data: user });
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// --- CREATE USER (Signup) --- //
export const createUser = async (req, res) => {
  try {
    const { name, email, password, confirmpassword } = req.body;
    if (!name || !email || !password || !confirmpassword)
      return res.status(400).json({ error: "All fields required" });
    if (password !== confirmpassword)
      return res.status(400).json({ error: "Passwords do not match" });

    const existing = await prisma.users.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: "User already exists" });

    const hashedPassword = await hash(password, 10);

    const newUser = await prisma.users.create({
      data: { name, email, password: hashedPassword },
    });

    await del("users:all");

    res.status(201).json({
      message: "✅ User created successfully!",
      userId: newUser.id,
    });
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// --- LOGIN USER --- //
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email & password required" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: "User not found" });

    const isMatch = await compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Incorrect password" });

    const payload = { id: user.id, email: user.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await set(`refresh:${email}`, refreshToken);

    res.status(200).json({
      message: "✅ Login successful",
      data: { accessToken, refreshToken },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// --- REFRESH TOKEN --- //
export const refreshTokenGen = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res.status(400).json({ message: "Refresh token required" });

    verify(refreshToken, REFRESH_TOKEN_SECRET, async (err, decoded) => {
      if (err)
        return res.status(403).json({ message: "Invalid or expired refresh token" });

      const storedToken = await get(`refresh:${decoded.email}`);
      if (storedToken !== refreshToken)
        return res.status(403).json({ message: "Token mismatch or invalid" });

      const newAccess = generateAccessToken({ email: decoded.email });
      const newRefresh = generateRefreshToken({ email: decoded.email });

      await set(`refresh:${decoded.email}`, newRefresh);

      res.status(200).json({
        message: "🔁 New tokens generated successfully",
        accessToken: newAccess,
        refreshToken: newRefresh,
      });
    });
  } catch (err) {
    console.error("Refresh token error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// --- UPDATE USER --- //
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;
    if (!name && !email)
      return res.status(400).json({ error: "At least one field required" });

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { ...(name && { name }), ...(email && { email }) },
    });

    await del(`user:${id}`);
    await del("users:all");

    res.status(200).json({ message: `✅ User ${id} updated successfully!`, data: updatedUser });
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// --- DELETE USER --- //
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.users.delete({ where: { id: parseInt(id) } });

    await del(`user:${id}`);
    await del("users:all");

    res.status(200).json({ message: `🗑️ User ${id} deleted successfully!` });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
