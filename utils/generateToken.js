import jwt from "jsonwebtoken";
import envconfig from "../utils/constants.js"; // ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET, etc.
import { set } from "./../utils/redisclient.js";

const ACCESS_TOKEN_SECRET = envconfig.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = envconfig.REFRESH_TOKEN_SECRET;
const ACCESS_TOKEN_EXP = envconfig.ACCESS_TOKEN_EXP || 900;
const REFRESH_TOKEN_EXP = envconfig.REFRESH_TOKEN_EXP || 604800;

// --- JWT token generation ---
const generateAccessToken = (payload) =>
    jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: `${ACCESS_TOKEN_EXP}s` });

const generateRefreshToken = (payload) =>
    jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: `${REFRESH_TOKEN_EXP}s` });

// Generate both tokens and store refresh token in Redis (keyed by user.id)
export const generateTokens = async (user) => {
    const payload = { id: user.id, contact: user.contact, email: user.email || null };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    try {
        // Store refresh token in Redis for 7 days
        await set(`refresh:${user.id}`, refreshToken, REFRESH_TOKEN_EXP);
    } catch (err) {
        console.error("Failed to store refresh token in Redis:", err);
    }

    return { accessToken, refreshToken };
};
