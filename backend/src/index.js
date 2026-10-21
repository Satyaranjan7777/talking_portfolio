import express from "express";
import http from "http";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import { ENV } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { apiLimiter } from "./middleware/rateLimiter.js";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/authRoutes.js";
import contentRoutes from "./routes/contentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { Admin } from "./models/Admin.js";
import { getPublicResumeRedirect } from "./controllers/resumeController.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Trust first proxy hop (Render / Cloudflare / Nginx) for accurate client IP in rate limiting & logs
app.set("trust proxy", 1);

const server = http.createServer(app);

function isOriginAllowed(origin) {
  if (!origin) return true;
  const normalizedOrigin = origin.trim().replace(/\/+$/, "");
  return ENV.CLIENT_ORIGIN.some((allowed) => {
    return allowed.trim().replace(/\/+$/, "") === normalizedOrigin;
  });
}

// Initialize Socket.io
export const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Socket CORS violation"), false);
    },
    credentials: true,
  },
});

// Socket connection rate limit per IP & Admin Authentication
const socketIpConnections = new Map();
const MAX_SOCKETS_PER_IP = 5;

io.use((socket, next) => {
  try {
    const ip = socket.handshake.headers["x-forwarded-for"] || socket.handshake.address || "unknown";
    const currentCount = socketIpConnections.get(ip) || 0;
    if (currentCount >= MAX_SOCKETS_PER_IP) {
      return next(new Error("Too many socket connections from this IP"));
    }

    const cookieHeader = socket.request.headers.cookie;
    if (!cookieHeader) {
      return next(new Error("Authentication required for websocket connection"));
    }

    const cookies = Object.fromEntries(
      cookieHeader.split(";").map((c) => {
        const [k, ...v] = c.trim().split("=");
        return [k, decodeURIComponent(v.join("="))];
      })
    );

    const token = cookies[ENV.COOKIE_NAME];
    if (!token) {
      return next(new Error("Admin session token missing"));
    }

    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    socket.admin = decoded;

    socketIpConnections.set(ip, currentCount + 1);
    socket.on("disconnect", () => {
      const active = socketIpConnections.get(ip) || 0;
      if (active <= 1) {
        socketIpConnections.delete(ip);
      } else {
        socketIpConnections.set(ip, active - 1);
      }
    });

    next();
  } catch (err) {
    return next(new Error("Invalid or expired session token"));
  }
});

io.on("connection", (socket) => {
  console.log(`[Socket.io] Admin client connected: ${socket.id} (${socket.admin?.email || "admin"})`);
  socket.on("disconnect", () => {
    console.log(`[Socket.io] Admin client disconnected: ${socket.id}`);
  });
});

// Security & Parsing Middleware
app.use(
  helmet({
    frameguard: { action: "sameorigin" }, // Protects against third-party clickjacking while allowing same-origin preview
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
        mediaSrc: ["'self'", "https://res.cloudinary.com"],
        connectSrc: ["'self'", ...ENV.CLIENT_ORIGIN, "https://res.cloudinary.com"],
        frameAncestors: ["'self'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
      },
    },
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy violation: origin '${origin}' not allowed`));
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rate limit API routes
app.use("/api", apiLimiter);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "portfolio-backend",
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use("/api/auth", authRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/admin", adminRoutes);

// Public stable resume redirect (e.g. for LinkedIn / external links)
app.get("/api/resume", getPublicResumeRedirect);


// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Central Error Handler
app.use(errorHandler);

async function ensureInitialAdmin() {
  try {
    if (!ENV.ADMIN_EMAIL || !ENV.ADMIN_PASSWORD) return;
    const email = ENV.ADMIN_EMAIL.toLowerCase().trim();
    let admin = await Admin.findOne({ email });
    const passwordHash = await Admin.hashPassword(ENV.ADMIN_PASSWORD);
    if (!admin) {
      await Admin.create({
        email,
        passwordHash,
      });
      console.log(`[Admin Bootstrap] Created admin account: ${email}`);
    } else {
      admin.passwordHash = passwordHash;
      admin.failedLoginAttempts = 0;
      admin.lockUntil = null;
      await admin.save();
      console.log(`[Admin Bootstrap] Synced admin credentials for: ${email}`);
    }
  } catch (err) {
    console.error("[Admin Bootstrap Error]", err);
  }
}

// Connect DB & Start Server
async function startServer() {
  await connectDB();
  await ensureInitialAdmin();

  server.listen(ENV.PORT, () => {
    console.log(`\n=============================================`);
    console.log(`[Backend API] Running on http://localhost:${ENV.PORT}`);
    console.log(`[Environment] ${ENV.NODE_ENV}`);
    console.log(`[CORS Allowlist] ${ENV.CLIENT_ORIGIN.join(", ")}`);
    console.log(`=============================================\n`);
  });
}

// Only start when executed directly
if (process.argv[1] && process.argv[1].endsWith("index.js")) {
  startServer();
}

export { app, server };
