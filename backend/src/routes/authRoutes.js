import { Router } from "express";
import {
  login,
  logout,
  getMe,
  changePassword,
  generate2FA,
  verify2FA,
  disable2FA,
} from "../controllers/authController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { authLimiter, sensitiveAuthLimiter } from "../middleware/rateLimiter.js";
import { validate } from "../middleware/validate.js";
import { loginSchema, changePasswordSchema } from "../schemas/authSchemas.js";

const router = Router();

router.post("/login", authLimiter, validate(loginSchema), login);
router.post("/logout", logout);
router.get("/me", requireAuth, getMe);
router.post("/change-password", requireAuth, sensitiveAuthLimiter, validate(changePasswordSchema), changePassword);

// 2FA Management Endpoints (protected by sensitiveAuthLimiter)
router.post("/2fa/generate", requireAuth, sensitiveAuthLimiter, generate2FA);
router.post("/2fa/verify", requireAuth, sensitiveAuthLimiter, verify2FA);
router.post("/2fa/disable", requireAuth, sensitiveAuthLimiter, disable2FA);

export default router;
