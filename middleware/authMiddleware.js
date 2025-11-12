import jwt from "jsonwebtoken";
import envconfig from "../utils/constants.js";

const ACCESS_TOKEN_SECRET = envconfig.ACCESS_TOKEN_SECRET;

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization token missing" });
    }

    const token = authHeader.split(" ")[1] || req.cookies?.accessToken;

    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);

    req.user = decoded; // attach decoded payload
    next();
  } catch (err) {
    console.error("Auth middleware error:", err.message);

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Access token expired",
        code: "TOKEN_EXPIRED",
      });
    }

    return res.status(401).json({ message: "Invalid token" });
  }
};

export default authMiddleware;
