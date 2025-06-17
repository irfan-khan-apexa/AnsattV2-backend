import dotenv from "dotenv";
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || "development",
  port: process.env.PORT || 5000,
  db: {
    name: process.env.DB_NAME!,
    user: process.env.DB_USER!,
    pass: process.env.DB_PASS!,
    host: process.env.DB_HOST!,
  },
  jwt: {
    secret: process.env.JWT_SECRET!,
    expiresIn: "1d",
  },
  redis: {
    host: process.env.REDIS_HOST!,
    port: Number(process.env.REDIS_PORT!),
  },
};
