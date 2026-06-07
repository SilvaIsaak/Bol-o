import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL!;

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });
} else {
  let globalWithPrisma = global as typeof globalThis & {
    prisma: PrismaClient;
  };
  if (!globalWithPrisma.prisma) {
    globalWithPrisma.prisma = new PrismaClient({
      adapter: new PrismaPg({ connectionString }),
      log: ["query", "info", "warn", "error"],
    });
  }
  prisma = globalWithPrisma.prisma;
}

export default prisma;
