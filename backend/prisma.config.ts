// Prisma CLI config — DATABASE_URL via env Docker ou .env local (dotenv optionnel)
import { defineConfig } from "prisma/config";

if (!process.env.DATABASE_URL) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("dotenv/config");
  } catch {
    /* dotenv absent en image production */
  }
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
