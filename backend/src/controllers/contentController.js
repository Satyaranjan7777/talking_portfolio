import { Content } from "../models/Content.js";

// Active SSE client connections and per-IP connection tracking
const sseClients = new Set();
const sseIpConnections = new Map();
const MAX_CONCURRENT_SSE_PER_IP = 4;
const MAX_GLOBAL_SSE_CLIENTS = 1000;
const MAX_SSE_CONNECTION_MS = 60 * 60 * 1000; // 1 hour max stream lifetime

/**
 * Broadcast an update event to all connected SSE clients
 */
export function broadcastContentUpdated(key, version) {
  const payload = JSON.stringify({
    key,
    version,
    timestamp: Date.now(),
  });

  const message = `event: content:updated\ndata: ${payload}\n\n`;

  for (const client of sseClients) {
    try {
      client.write(message);
    } catch (err) {
      sseClients.delete(client);
    }
  }
}

/**
 * GET /api/content
 * Returns all published sections with an ETag and Cache-Control header.
 */
export async function getAllPublishedContent(req, res, next) {
  try {
    const docs = await Content.find({}).lean();

    const sections = {};
    let latestUpdatedAt = new Date(0);

    docs.forEach((doc) => {
      sections[doc.key] = {
        data: doc.published,
        version: doc.version,
        updatedAt: doc.updatedAt,
      };
      if (new Date(doc.updatedAt) > latestUpdatedAt) {
        latestUpdatedAt = new Date(doc.updatedAt);
      }
    });

    const etag = `W/"${latestUpdatedAt.getTime()}-${docs.length}"`;
    res.setHeader("ETag", etag);
    res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=300");

    if (req.headers["if-none-match"] === etag) {
      return res.status(304).end();
    }

    return res.status(200).json({
      success: true,
      data: sections,
      count: docs.length,
      updatedAt: latestUpdatedAt,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/content/stream
 * Native Server-Sent Events stream for public clients with abuse limits.
 */
export function streamContentUpdates(req, res) {
  const ip = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";

  // Check global client ceiling
  if (sseClients.size >= MAX_GLOBAL_SSE_CLIENTS) {
    return res.status(503).json({
      success: false,
      error: "Real-time update service is temporarily busy. Please retry later.",
    });
  }

  // Check per-IP concurrent connection limit
  const currentIpCount = sseIpConnections.get(ip) || 0;
  if (currentIpCount >= MAX_CONCURRENT_SSE_PER_IP) {
    return res.status(429).json({
      success: false,
      error: "Too many concurrent stream connections from your IP. Please close unused tabs.",
    });
  }

  // Increment IP connection count
  sseIpConnections.set(ip, currentIpCount + 1);

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });

  // Initial connection handshake
  res.write(`: connected at ${new Date().toISOString()}\n\n`);

  sseClients.add(res);

  let cleanedUp = false;
  const cleanup = () => {
    if (cleanedUp) return;
    cleanedUp = true;
    clearInterval(heartbeatInterval);
    clearTimeout(streamTimeout);
    sseClients.delete(res);

    const count = sseIpConnections.get(ip) || 0;
    if (count <= 1) {
      sseIpConnections.delete(ip);
    } else {
      sseIpConnections.set(ip, count - 1);
    }
  };

  // Keep-alive heartbeat every 25 seconds
  const heartbeatInterval = setInterval(() => {
    try {
      res.write(": keep-alive\n\n");
    } catch {
      cleanup();
    }
  }, 25000);

  // Maximum connection lifetime (reconnect requested gracefully)
  const streamTimeout = setTimeout(() => {
    try {
      res.write(": stream timeout, reconnecting\n\n");
      res.end();
    } catch {}
    cleanup();
  }, MAX_SSE_CONNECTION_MS);

  req.on("close", cleanup);
  res.on("error", cleanup);
}

/**
 * GET /api/content/:key
 * Returns a single published section by key.
 */
export async function getPublishedSection(req, res, next) {
  try {
    const { key } = req.params;
    const doc = await Content.findOne({ key }).lean();

    if (!doc) {
      return res.status(404).json({
        success: false,
        error: `Section '${key}' not found`,
      });
    }

    return res.status(200).json({
      success: true,
      data: doc.published,
      version: doc.version,
      updatedAt: doc.updatedAt,
    });
  } catch (error) {
    next(error);
  }
}
