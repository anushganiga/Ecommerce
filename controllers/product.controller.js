import prisma from "../utils/prismaClient.js";

// 📦 Get all products with pagination + sorting
export const getAllProducts = async (req, res) => {
  try {
    const perPage = parseInt(req.query.perPage) || 10;
    const currentPage = parseInt(req.query.page) || 1;
    const sortOrder = req.query.sort === "desc" ? "desc" : "asc"; // safe default

    const productCount = await prisma.product.count();
    const totalPages = Math.ceil(productCount / perPage);

    const products = await prisma.product.findMany({
      skip: (currentPage - 1) * perPage,
      take: perPage,
      orderBy: { id: sortOrder },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        category: true,
        stock: true,
        createdAt: true,
      },
    });

    res.status(200).json({
      message: "✅ Products fetched successfully",
      pagination: {
        totalProducts: productCount,
        totalPages,
        currentPage,
        perPage,
      },
      data: products,
    });
  } catch (err) {
    console.error("❌ Error in getAllProducts:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ➕ Create a new product
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;

    // Validate input
    if (!name || !price || !category) {
      return res.status(400).json({ message: "Name, price, and category are required" });
    }

    // Check if category exists
    let existingCategory = await prisma.category.findFirst({
      where: { name: category },
    });

    // If category doesn’t exist, create it
    if (!existingCategory) {
      existingCategory = await prisma.category.create({
        data: { name: category },
      });
    }

    // Create the product and link category
    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock) || 0,
        category: {
          connect: { id: existingCategory.id },
        },
      },
      include: { category: true },
    });

    res.status(201).json({
      message: "✅ Product created successfully",
      data: newProduct,
    });
  } catch (err) {
    console.error("❌ Error creating product:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};


// 🔍 Get a single product by ID
export const getProductById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid product ID" });

    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        category: true,
        stock: true,
        createdAt: true,
      },
    });

    if (!product)
      return res.status(404).json({ message: `Product with ID ${id} not found` });

    res.status(200).json({
      message: "✅ Product fetched successfully",
      data: product,
    });
  } catch (err) {
    console.error("❌ Error fetching product:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✏️ Update a product
export const updateProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid product ID" });

    const { name, description, price, category, stock } = req.body;

    if (!name && !description && !price && !category && stock === undefined) {
      return res.status(400).json({ message: "At least one field must be provided" });
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(price && { price: Number(price) }),
        ...(category && { category }),
        ...(stock !== undefined && { stock: Number(stock) }),
      },
    });

    res.status(200).json({
      message: `✅ Product with ID ${id} updated successfully`,
      data: updatedProduct,
    });
  } catch (err) {
    console.error("❌ Error updating product:", err);
    if (err.code === "P2025") {
      return res.status(404).json({ message: `Product with ID ${req.params.id} not found` });
    }
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ❌ Delete a product
export const deleteProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid product ID" });

    const deletedProduct = await prisma.product.delete({
      where: { id },
      select: { id: true, name: true, price: true },
    });

    res.status(200).json({
      message: `✅ Product with ID ${id} deleted successfully`,
      data: deletedProduct,
    });
  } catch (err) {
    console.error("❌ Error deleting product:", err);
    if (err.code === "P2025") {
      return res.status(404).json({ message: `Product with ID ${req.params.id} not found` });
    }
    res.status(500).json({ message: "Internal Server Error" });
  }
};
