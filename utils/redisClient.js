import redis from "redis";

// Initialize Redis client
export const redisClient = redis.createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
  // password: process.env.REDIS_PASSWORD, // uncomment if needed
});

redisClient.on("connect", () => console.log("✅ Connected to Redis"));
redisClient.on("error", (err) => console.error("❌ Redis client error:", err));

// Connect to Redis
export const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log("✅ Redis connection established");
  } catch (err) {
    console.error("❌ Redis connection failed:", err);
    process.exit(1); // stop app if Redis fails
  }
};

// --- Redis helper functions --- //

// Set key with optional expiry in seconds
export const set = async (key, value, expireInSeconds = null) => {
  try {
    if (expireInSeconds) {
      await redisClient.setEx(key, expireInSeconds, value);
    } else {
      await redisClient.set(key, value);
    }
    return true;
  } catch (err) {
    console.error(`❌ Redis set error (${key}):`, err);
    throw err; // let caller handle error
  }
};

// Get key
export const get = async (key) => {
  try {
    const data = await redisClient.get(key);
    return data; // returns string or null
  } catch (err) {
    console.error(`❌ Redis get error (${key}):`, err);
    return null;
  }
};

// Delete key
export const del = async (key) => {
  try {
    const result = await redisClient.del(key); // returns number of keys deleted
    return result > 0;
  } catch (err) {
    console.error(`❌ Redis del error (${key}):`, err);
    throw err;
  }
};

// Persist key (remove expiry)
export const persist = async (key) => {
  try {
    const result = await redisClient.persist(key); // returns 1 if key persisted
    return result === 1;
  } catch (err) {
    console.error(`❌ Redis persist error (${key}):`, err);
    throw err;
  }
};
