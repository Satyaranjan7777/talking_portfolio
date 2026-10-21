import mongoose from "mongoose";
import { ENV } from "./env.js";

export async function connectDB() {
  try {
    const conn = await mongoose.connect(ENV.MONGODB_URI);
    console.log(`[MongoDB] Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    // Do not crash immediately so dev server can still start and report health
    return null;
  }
}
