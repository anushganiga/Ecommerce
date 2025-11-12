import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding users...');

  const users = [
    { name: 'Anush', email: 'anush@example.com' },
    { name: 'Arun', email: 'arun@example.com' },
    { name: 'Priya', email: 'priya@example.com' },
    { name: 'Kiran', email: 'kiran@example.com' },
     { name: 'Raju', email: 'raju@example.com' },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
  }

  console.log('✅ Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
