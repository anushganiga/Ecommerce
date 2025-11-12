import redis from "redis";
import envconfig from "./constants.js";

// Initialize Redis client
export const redisClient = redis.createClient({
  url: `redis://${envconfig.REDIS_HOST}:${envconfig.REDIS_PORT}`,
  password: envconfig.REDIS_PASSWORD || undefined,
});

// Handle Redis client events
redisClient.on("connect", () => console.log("✅ Connected to Redis"));
redisClient.on("error", (err) => console.error("❌ Redis client error:", err));

// Connect to Redis (async IIFE)
(async () => {
  try {
    await redisClient.connect();
  } catch (err) {
    console.error("❌ Redis connection failed:", err);
  }
})();

// --- Redis helper functions --- //
export const setOtp = async (key, value) => {
  try {
    // EX = expiry in seconds → 300s = 5min
    await redisClient.setEx(key, 300, value);
    console.log(`✅ OTP stored for key: ${key}`);
  } catch (err) {
    console.error("Redis setOtp error:", err);
  }
};

export const set = async (key, value) => {
  try {
    await redisClient.set(key, value);
    console.log(`✅ Key set: ${key}`);
  } catch (err) {
    console.error("Redis set error:", err);
  }
};

export const get = async (key) => {
  try {
    const data = await redisClient.get(key);
    console.log(`📦 Key fetched: ${key}`);
    return data;
  } catch (err) {
    console.error("Redis get error:", err);
    return null;
  }
};

 export const del = async (key) => {
  try {
    await redisClient.del(key);
    console.log(`🗑️ Key deleted: ${key}`);
  } catch (err) {
    console.error("Redis del error:", err);
  }
};

 export const persist = async (key) => {
  try {
    const result = await redisClient.persist(key);
    if (result === 1) {
      console.log(`✅ Key is now persistent (no expiry): ${key}`);
    } else {
      console.log(`ℹ️ Key not found or already persistent: ${key}`);
    }
  } catch (err) {
    console.error("Redis persist error:", err);
  }
};



