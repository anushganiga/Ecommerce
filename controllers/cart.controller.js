import prisma from "../utils/prismaClient.js"; // or your DB config

// 🛒 Get user's cart
export const getCart = async (req, res) => {
  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: { items: { include: { product: true } } },
    });

    res.json(cart || { items: [] });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({ message: "Failed to fetch cart" });
  }
};

// ➕ Add item to cart
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity)
      return res.status(400).json({ message: "Product ID and quantity required" });

    const existingItem = await prisma.cartItem.findFirst({
      where: { productId, cart: { userId: req.user.id } },
    });

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
    } else {
      let cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });
      if (!cart) cart = await prisma.cart.create({ data: { userId: req.user.id } });

      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, quantity },
      });
    }

    res.json({ message: "Item added to cart successfully" });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ message: "Failed to add to cart" });
  }
};

// 🔄 Update item quantity
export const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    res.json({ message: "Cart item updated successfully" });
  } catch (error) {
    console.error("Update cart item error:", error);
    res.status(500).json({ message: "Failed to update cart item" });
  }
};

// ❌ Remove item
export const removeCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    await prisma.cartItem.delete({ where: { id: itemId } });
    res.json({ message: "Item removed from cart" });
  } catch (error) {
    console.error("Remove cart item error:", error);
    res.status(500).json({ message: "Failed to remove cart item" });
  }
};

// 🧹 Clear cart
export const clearCart = async (req, res) => {
  try {
    const userCart = await prisma.cart.findUnique({ where: { userId: req.user.id } });
    if (userCart) {
      await prisma.cartItem.deleteMany({ where: { cartId: userCart.id } });
    }
    res.json({ message: "Cart cleared successfully" });
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({ message: "Failed to clear cart" });
  }
};
