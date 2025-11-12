import jwt from "jsonwebtoken"; // default import for CommonJS pkg
import envconfig from "./constants.js";

const { sign } = jwt; // destructure the function from default import

const ACCESS_TOKEN_SECRET = envconfig.ACCESS_TOKEN_SECRET;
const ACCESS_TOKEN_EXP = envconfig.ACCESS_TOKEN_EXP || "15m";
const REFRESH_TOKEN_SECRET = envconfig.REFRESH_TOKEN_SECRET;
const REFRESH_TOKEN_EXP = envconfig.REFRESH_TOKEN_EXP || "7d";

// Generate Access Token
export const generateAccessToken = (payload) => {
  if (!ACCESS_TOKEN_SECRET) throw new Error("ACCESS_TOKEN_SECRET not defined in .env");
  return sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXP });
};

// Generate Refresh Token
export const generateRefreshToken = (payload) => {
  if (!REFRESH_TOKEN_SECRET) throw new Error("REFRESH_TOKEN_SECRET not defined in .env");
  return sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXP });
};
