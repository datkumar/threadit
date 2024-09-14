import { PrismaClient } from "@prisma/client";
import "server-only";

// Declare a Prisma client variable in the global namespace
declare global {
  var cachedPrisma: PrismaClient;
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  // In local environment, use the cached Prisma client if exists
  // or else create a new one and assign it globally
  if (!global.cachedPrisma) {
    global.cachedPrisma = new PrismaClient();
  }
  prisma = global.cachedPrisma;
}

export const db = prisma;
