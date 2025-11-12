// controllers/productController.js
const { PrismaClient } = require("@prisma/client");
const { get, set, del } = require("../utils/redisClient.js");

const prisma = new PrismaClient();

// --- Get all products --- //
export const getAllProducts = async (_req, res) => {
  try {
    const cacheKey = "products:all";
    const cached = await get(cacheKey);

    if (cached) {
      console.log("📦 Returning products from Redis cache");
      return res.status(200).json({ source: "cache", data: JSON.parse(cached) });
    }

    const products = await prisma.product.findMany({
      orderBy: { id: "asc" },
    });

    await set(cacheKey, JSON.stringify(products));

    console.log("⚡ Returning fresh products from DB");
    res.status(200).json({ source: "db", data: products });
  } catch (err) {
    console.error("❌ Error fetching products:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// --- Get product by ID --- //
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `product:${id}`;

    const cached = await get(cacheKey);
    if (cached) {
      console.log(`📦 Returning cached product ${id}`);
      return res.status(200).json({ source: "cache", data: JSON.parse(cached) });
    }

    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
    });

    if (!product) return res.status(404).json({ error: "Product not found" });

    await set(cacheKey, JSON.stringify(product));

    res.status(200).json({ source: "db", data: product });
  } catch (err) {
    console.error("❌ Error fetching product by ID:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// --- Create product --- //
export const createProduct = async (req, res) => {
  try {
    const { name, price, category } = req.body;
    if (!name || !price || !category) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const product = await prisma.product.create({
      data: { name, price: parseFloat(price), category },
    });

    await del("products:all"); // Invalidate product list cache

    res.status(201).json({
      message: "✅ Product created successfully",
      data: product,
    });
  } catch (err) {
    console.error("❌ Error creating product:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// --- Update product --- //
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, category } = req.body;

    const existingProduct = await prisma.product.findUnique({
      where: { id: Number(id) },
    });
    if (!existingProduct)
      return res.status(404).json({ error: "Product not found" });

    const updated = await prisma.product.update({
      where: { id: Number(id) },
      data: {
        name: name || existingProduct.name,
        price: price ? parseFloat(price) : existingProduct.price,
        category: category || existingProduct.category,
      },
    });

    await del(`product:${id}`);
    await del("products:all");

    res.status(200).json({
      message: "✅ Product updated successfully",
      data: updated,
    });
  } catch (err) {
    console.error("❌ Error updating product:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// --- Delete product --- //
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const existingProduct = await prisma.product.findUnique({
      where: { id: Number(id) },
    });
    if (!existingProduct)
      return res.status(404).json({ error: "Product not found" });

    await prisma.product.delete({
      where: { id: Number(id) },
    });

    await del(`product:${id}`);
    await del("products:all");

    res.status(200).json({ message: "🗑️ Product deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting product:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};