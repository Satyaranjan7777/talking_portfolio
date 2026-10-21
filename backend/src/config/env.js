import dotenv from "dotenv";
dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

if (isProduction && (!process.env.JWT_SECRET || process.env.JWT_SECRET.includes("default_jwt_secret"))) {
  throw new Error("[SECURITY CONFIG ERROR] JWT_SECRET must be explicitly set to a strong random secret in production.");
}

export const ENV = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/portfolio",
  JWT_SECRET: process.env.JWT_SECRET || "dev_only_jwt_secret_do_not_use_in_prod",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  COOKIE_NAME: process.env.COOKIE_NAME || "portfolio_admin_token",
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || "admin@example.com",
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "Changeme",
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN
    ? process.env.CLIENT_ORIGIN.split(",").map((s) => s.trim())
    : ["http://localhost:5173"],
};
