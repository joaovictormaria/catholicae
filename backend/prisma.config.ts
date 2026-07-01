import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Only used by the Prisma CLI (generate/migrate) — the app itself connects
    // via @prisma/adapter-pg reading process.env.DATABASE_URL directly at runtime.
    // Falls back to a placeholder so `prisma generate` doesn't fail in build
    // environments (e.g. Vercel) where DATABASE_URL isn't set at build time.
    url: process.env.DATABASE_URL ?? "postgresql://placeholder:placeholder@localhost:5432/placeholder",
  },
});
