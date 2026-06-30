import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean existing users
  await prisma.user.deleteMany({});

  // Seed default user
  const hashedPassword = await bcrypt.hash("Password123!", 10);

  const defaultUser = await prisma.user.create({
    data: {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      age: 25,
      password: hashedPassword,
      isVerified: true,
    },
  });

  console.log("Database seeded successfully!");
  console.log(`Default User created:`);
  console.log(`Email: ${defaultUser.email}`);
  console.log(`Password: Password123!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
