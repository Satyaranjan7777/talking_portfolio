import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";
import { Admin } from "../models/Admin.js";

export async function requireAuth(req, res, next) {
  try {
    let token = req.cookies?.[ENV.COOKIE_NAME];

    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    const admin = await Admin.findById(decoded.id).select("-passwordHash -totpSecret");

    if (!admin) {
      return res.status(401).json({
        success: false,
        error: "Admin session invalid or expired",
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: "Invalid or expired session token",
    });
  }
}
