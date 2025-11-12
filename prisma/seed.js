import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting safe seed...");

  // Upsert categories (creates if not exists)
  const electronics = await prisma.category.upsert({
    where: { name: "Electronics" },
    update: {},
    create: { name: "Electronics" },
  });

  const fashion = await prisma.category.upsert({
    where: { name: "Fashion" },
    update: {},
    create: { name: "Fashion" },
  });

  // Upsert user
  const user = await prisma.user.upsert({
    where: { email: "john@example.com" },
    update: {},
    create: {
      name: "John Doe",
      email: "john@example.com",
      role: "user",
    },
  });

  // Upsert vendor
  const vendor = await prisma.user.upsert({
    where: { email: "vendor@example.com" },
    update: {},
    create: {
      name: "Tech Vendor",
      email: "vendor@example.com",
      role: "vendor",
    },
  });

  // Create products only if not already present
  const existingProducts = await prisma.product.findMany();
  if (existingProducts.length === 0) {
    const product1 = await prisma.product.create({
      data: {
        name: "Smartphone",
        price: 1999,
        stock: 10,
        description: "A high-end smartphone",
        categoryId: electronics.id,
      },
    });

    const product2 = await prisma.product.create({
      data: {
        name: "Smartwatch",
        price: 2999,
        stock: 15,
        description: "Waterproof smartwatch with GPS",
        categoryId: electronics.id,
      },
    });

    const product3 = await prisma.product.create({
      data: {
        name: "Denim Jacket",
        price: 1499,
        stock: 20,
        description: "Classic blue denim jacket",
        categoryId: fashion.id,
      },
    });

    await prisma.vendorProductMap.createMany({
      data: [
        { vendorId: vendor.id, productId: product1.id },
        { vendorId: vendor.id, productId: product2.id },
      ],
    });
  }

  // Create address if missing
  const address = await prisma.address.upsert({
    where: {
      id: 1,
    },
    update: {},
    create: {
      userId: user.id,
      line1: "123 Main Street",
      city: "Bangalore",
      state: "Karnataka",
      country: "India",
      zip: "560001",
    },
  });

  // Only create order if none exists
  const existingOrder = await prisma.order.findFirst({
    where: { userId: user.id },
  });

  if (!existingOrder) {
    const products = await prisma.product.findMany();

    const totalAmount = products.slice(0, 2).reduce((sum, p) => sum + p.price, 0);

    await prisma.order.create({
      data: {
        userId: user.id,
        status: "pending",
        totalAmount,
        shippingAddressId: address.id,
        orderItems: {
          create: products.slice(0, 2).map((p) => ({
            productId: p.id,
            quantity: 1,
            price: p.price,
          })),
        },
        payment: {
          create: {
            amount: totalAmount,
            method: "card",
            status: "completed",
            transactionId: "TXN123456789",
          },
        },
      },
    });
  }

  console.log("✅ Safe seed completed successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
