import express from 'express'
const app = express();

app.use(express.json());

import dotenv from 'dotenv';
// Load env file based on NODE_ENV
const envFile = process.env.NODE_ENV === "prod" ? "./.env" : "./.env.dev";
dotenv.config({ path: envFile });

import {connectRedis} from './utils/redisclient.js'
connectRedis();

// Now you can access PORT from env
const PORT = process.env.PORT || 5000;

import userRoutes from "./routes/user.route.js"
import authRoutes from "./routes/auth.route.js"
import productRoutes from "./routes/product.route.js"
import cartRoutes from "./routes/cart.route.js"
import orderRoutes from "./routes/order.route.js"

app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/carts", cartRoutes);
app.use("/api/orders", orderRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});