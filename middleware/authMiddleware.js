import jwt from "jsonwebtoken"; // For verify
import envconfig from "../utils/constants.js";
// Destructure verify from jwt (since jsonwebtoken is CommonJS)
const { verify } = jwt;

// Read refresh token secret from env
const ACCESS_TOKEN_SECRET = envconfig.ACCESS_TOKEN_SECRET;

export const authMiddleware = (req, res, next) => {
  try {
    // 1️⃣ Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Access token missing or malformed" });
    }

    // 2️⃣ Extract token from "Bearer <token>"
    const token = authHeader.split(" ")[1];

    // 3️⃣ Verify token
    verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ error: "Invalid or expired access token" });
      }

      // 4️⃣ Attach decoded user info to request
      req.user = user;
      next(); // proceed only after successful verification
    });
  } catch (err) {
    console.error("Auth Middleware Error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};