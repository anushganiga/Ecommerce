import prisma from "../utils/prismaClient.js";

// 🛍️ Create order
export const createOrder = async (req, res) => {
  try {
    const { items, totalAmount, shippingAddressId } = req.body;
    const userId = req.user.id; // from authMiddleware

    if (!items?.length || !totalAmount || !shippingAddressId) {
      return res.status(400).json({
        message: "Items, total amount, and shipping address are required",
      });
    }

    // 🧾 Create order with nested orderItems
    const order = await prisma.order.create({
      data: {
        userId,
        totalAmount,
        shippingAddressId,
        status: "pending",
        orderItems: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        orderItems: { include: { product: true } },
        shippingAddress: true,
        user: true,
      },
    });

    res.status(201).json({
      message: "✅ Order placed successfully",
      data: order,
    });
  } catch (error) {
    console.error("❌ Create order error:", error);
    res.status(500).json({ message: "Failed to place order" });
  }
};

// 📦 Get all orders (Admin)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: true,
        orderItems: { include: { product: true } },
        shippingAddress: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      message: "✅ Orders fetched successfully",
      data: orders,
    });
  } catch (error) {
    console.error("❌ Get all orders error:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

// 🔍 Get order by ID
export const getOrderById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        orderItems: { include: { product: true } },
        shippingAddress: true,
      },
    });

    if (!order)
      return res.status(404).json({ message: `Order with ID ${id} not found` });

    res.status(200).json({
      message: "✅ Order fetched successfully",
      data: order,
    });
  } catch (error) {
    console.error("❌ Get order by ID error:", error);
    res.status(500).json({ message: "Failed to fetch order" });
  }
};

// 🔄 Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;

    const validStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(status.toLowerCase())) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: status.toLowerCase() },
    });

    res.status(200).json({
      message: "✅ Order status updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("❌ Update order status error:", error);
    res.status(500).json({ message: "Failed to update order" });
  }
};

// ❌ Delete order
export const deleteOrder = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    await prisma.orderItem.deleteMany({ where: { orderId: id } }); // delete order items first
    await prisma.order.delete({ where: { id } });

    res.status(200).json({ message: `✅ Order with ID ${id} deleted successfully` });
  } catch (error) {
    console.error("❌ Delete order error:", error);
    res.status(500).json({ message: "Failed to delete order" });
  }
};
