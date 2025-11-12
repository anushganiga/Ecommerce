import express from 'express';
import cors from 'cors';
import limiter from "./utils/ratelimit.js"
const app = express();
app.use(express.json());
app.use(cors());

import { swaggerDocs } from "./utils/swagger.js"; // adjust path
// Initialize Swagger
swaggerDocs(app);


import envconfig from './utils/constants.js'

import cookieParser from "cookie-parser";
app.use(cookieParser());

import { set, persist } from "./utils/redisClient.js";

app.use(limiter);


app.get("/", async (_req, res) => {
  try {
    // Set a key first (for testing)
    await set("user:Anush", JSON.stringify({ name: "Anush", role: "admin" }));

    // Now make the key persistent
    await persist("user:Anush");

    res.status(200).json({ message: "MySQL + Redis API is running 🚀" });
  } catch (err) {
    console.error("Redis persist error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

import userRoutes from "./routes/users.js";

app.use("/api/users", userRoutes);

const PORT = envconfig.PORT || 5000;


const server = app.listen(PORT, () => {
    console.log("server is running on port", server.address().port);
});
