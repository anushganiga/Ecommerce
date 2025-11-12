import { defineConfig, env } from "prisma/config";

import dotenv from 'dotenv';
const envFile = process.env.NODE_ENV === "prod" ? "./.env" : "./.env.dev";
dotenv.config({ path: envFile });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
