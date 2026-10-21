import jwt from "jsonwebtoken";
import { generateSecret, generateURI, verifySync } from "otplib";
import qrcode from "qrcode";
import { Admin } from "../models/Admin.js";
import { AuditLog } from "../models/AuditLog.js";
import { ENV } from "../config/env.js";

function generateToken(admin) {
  return jwt.sign(
    { id: admin._id, email: admin.email },
    ENV.JWT_SECRET,
    { expiresIn: ENV.JWT_EXPIRES_IN }
  );
}

function setAuthCookie(res, token) {
  const isProduction = ENV.NODE_ENV === "production";
  res.cookie(ENV.COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "strict" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  });
}

export async function login(req, res, next) {
  try {
    const { email, password, totpCode } = req.body;
    const ip = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    if (!admin) {
      await AuditLog.create({
        action: "LOGIN_FAILED",
        section: "auth",
        ip,
        details: { email, reason: "Admin not found" },
      });
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    // Check account lockout status
    if (admin.lockUntil && admin.lockUntil > new Date()) {
      const remainingMinutes = Math.ceil((admin.lockUntil.getTime() - Date.now()) / (60 * 1000));
      return res.status(429).json({
        success: false,
        error: `Account is temporarily locked due to consecutive failed attempts. Please try again after ${remainingMinutes} minute(s).`,
      });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      admin.failedLoginAttempts = (admin.failedLoginAttempts || 0) + 1;
      if (admin.failedLoginAttempts >= 5) {
        admin.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15-minute lockout
      }
      await admin.save();

      await AuditLog.create({
        action: "LOGIN_FAILED",
        section: "auth",
        adminId: admin._id.toString(),
        ip,
        details: { email, reason: "Password mismatch", failedAttempts: admin.failedLoginAttempts },
      });
      return res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
    }

    // Two-factor authentication check
    if (admin.isTotpEnabled) {
      if (!totpCode) {
        return res.status(200).json({
          success: true,
          require2FA: true,
          message: "Two-factor authentication code required",
        });
      }

      const verified = verifySync({ token: totpCode.trim(), secret: admin.totpSecret });
      if (!verified?.valid) {
        admin.failedLoginAttempts = (admin.failedLoginAttempts || 0) + 1;
        if (admin.failedLoginAttempts >= 5) {
          admin.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
        }
        await admin.save();

        await AuditLog.create({
          action: "LOGIN_FAILED",
          section: "auth",
          adminId: admin._id.toString(),
          ip,
          details: { email, reason: "Invalid TOTP code", failedAttempts: admin.failedLoginAttempts },
        });
        return res.status(401).json({
          success: false,
          error: "Invalid two-factor authentication code",
        });
      }
    }

    // Reset failed attempts and lockout on successful authentication
    admin.failedLoginAttempts = 0;
    admin.lockUntil = null;
    admin.lastLoginAt = new Date();
    await admin.save();

    const token = generateToken(admin);
    setAuthCookie(res, token);

    await AuditLog.create({
      action: admin.isTotpEnabled ? "LOGIN_SUCCESS_2FA" : "LOGIN_SUCCESS",
      section: "auth",
      adminId: admin._id.toString(),
      ip,
      details: { email, with2FA: admin.isTotpEnabled },
    });

    return res.status(200).json({
      success: true,
      data: {
        admin: {
          id: admin._id,
          email: admin.email,
          isTotpEnabled: admin.isTotpEnabled,
          lastLoginAt: admin.lastLoginAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(req, res) {
  res.clearCookie(ENV.COOKIE_NAME, {
    httpOnly: true,
    secure: ENV.NODE_ENV === "production",
    sameSite: ENV.NODE_ENV === "production" ? "strict" : "lax",
    path: "/",
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
}

export async function getMe(req, res) {
  return res.status(200).json({
    success: true,
    data: {
      admin: {
        id: req.admin._id,
        email: req.admin.email,
        isTotpEnabled: req.admin.isTotpEnabled || false,
        lastLoginAt: req.admin.lastLoginAt,
      },
    },
  });
}

export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    const admin = await Admin.findById(req.admin._id);

    const isMatch = await admin.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: "Current password does not match",
      });
    }

    admin.passwordHash = await Admin.hashPassword(newPassword);
    await admin.save();

    await AuditLog.create({
      action: "PASSWORD_CHANGED",
      section: "auth",
      adminId: admin._id.toString(),
      ip: req.ip,
    });

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/2fa/generate
 * Generate secret and QR code data URL for TOTP authenticator setup.
 */
export async function generate2FA(req, res, next) {
  try {
    const admin = await Admin.findById(req.admin._id);
    const secret = generateSecret();
    const otpauth = generateURI({
      secret,
      label: admin.email,
      issuer: "Satyaranjan Portfolio",
    });

    const qrCodeDataUrl = await qrcode.toDataURL(otpauth, {
      margin: 2,
      width: 240,
    });

    // Save temporary secret until verified
    admin.totpSecret = secret;
    await admin.save();

    return res.status(200).json({
      success: true,
      secret,
      qrCodeDataUrl,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/2fa/verify
 * Confirm TOTP code to permanently activate 2FA.
 */
export async function verify2FA(req, res, next) {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({
        success: false,
        error: "Verification code is required",
      });
    }

    const admin = await Admin.findById(req.admin._id);
    if (!admin.totpSecret) {
      return res.status(400).json({
        success: false,
        error: "2FA generation must be initiated first",
      });
    }

    const verification = verifySync({
      token: code.trim(),
      secret: admin.totpSecret,
    });

    if (!verification?.valid) {
      return res.status(400).json({
        success: false,
        error: "Invalid 6-digit code. Please try again.",
      });
    }

    admin.isTotpEnabled = true;
    await admin.save();

    await AuditLog.create({
      action: "2FA_ENABLED",
      section: "auth",
      adminId: admin._id.toString(),
      ip: req.ip,
    });

    return res.status(200).json({
      success: true,
      message: "Two-factor authentication successfully enabled",
      isTotpEnabled: true,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/2fa/disable
 * Disable 2FA with password confirmation.
 */
export async function disable2FA(req, res, next) {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({
        success: false,
        error: "Password is required to disable 2FA",
      });
    }

    const admin = await Admin.findById(req.admin._id);
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        error: "Incorrect password",
      });
    }

    admin.isTotpEnabled = false;
    admin.totpSecret = null;
    await admin.save();

    await AuditLog.create({
      action: "2FA_DISABLED",
      section: "auth",
      adminId: admin._id.toString(),
      ip: req.ip,
    });

    return res.status(200).json({
      success: true,
      message: "Two-factor authentication has been disabled",
      isTotpEnabled: false,
    });
  } catch (error) {
    next(error);
  }
}
