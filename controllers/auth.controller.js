import jwt from "jsonwebtoken";
import envconfig from "../utils/constants.js"; // ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET, etc.
import { get, set, del } from "./../utils/redisclient.js";
import prisma from "../utils/prismaClient.js"; // your prisma client
import { generateTokens } from "../utils/generateToken.js";


const REFRESH_TOKEN_SECRET = envconfig.REFRESH_TOKEN_SECRET;

// --- Step 1: Login and send OTP ---
export const loginUser = async (req, res) => {
    try {
        const { contact } = req.body;
        if (!contact) return res.status(400).json({ message: "Contact is required" });

        const user = await prisma.user.findFirst({
            where: { contacts: { some: { value: contact } } }
        });
        if (!user) return res.status(404).json({ message: "User not found" });

        const otp = "1234"; // replace with real OTP generator
        // Store OTP keyed by user.id for 5 minutes
        await set(`login:${user.id}`, JSON.stringify({ otp }), 300);

        res.status(200).json({ message: "OTP sent", otp }); // send via SMS in real app
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

// --- Step 2: Verify OTP and generate tokens ---
export const verifyLogin = async (req, res) => {
    try {
        const { contact, otp } = req.body;
        if (!contact || !otp)
            return res.status(400).json({ message: "Contact and OTP are required" });

        const user = await prisma.user.findFirst({
            where: { contacts: { some: { value: contact } } }
        });
        if (!user) return res.status(404).json({ message: "User not found" });

        const cached = await get(`login:${user.id}`);
        if (!cached) return res.status(400).json({ message: "OTP expired or not found" });

        const { otp: storedOtp } = JSON.parse(cached);
        if (otp !== storedOtp) return res.status(400).json({ message: "Invalid OTP" });

        const tokens = await generateTokens(user);

        // Remove OTP after success
        await del(`login:${user.id}`);

        res.status(200).json(tokens);
    } catch (err) {
        console.error("OTP verification error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

// --- Refresh token endpoint ---
export const newRefreshtoken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) throw new Error("Refresh token required");

        const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);

        // Fetch refresh token from Redis by user.id
        const storedToken = await get(`refresh:${decoded.id}`);
        if (storedToken !== refreshToken) throw new Error("Invalid refresh token");

        const user = { id: decoded.id, contact: decoded.contact, email: decoded.email || null };
        const tokens = await generateTokens(user);

        res.status(200).json(tokens);
    } catch (err) {
        console.error("Refresh token error:", err);
        res.status(401).json({ message: "Session expired, please login again" });
    }
};

// --- Logout endpoint ---
export const logout = async (req, res) => {
    try {
        const { refreshToken } = req.cookies;
        if (refreshToken) {
            const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
            await del(`refresh:${decoded.id}`);
            res.clearCookie("refreshToken");
        }
        res.json({ message: "Logged out" });
    } catch (err) {
        console.error("Logout error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};
