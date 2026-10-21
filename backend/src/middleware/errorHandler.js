export function errorHandler(err, req, res, next) {
  console.error(`[Error] ${req.method} ${req.url}:`, err.stack || err.message);

  const status = err.status || 500;
  const isProd = process.env.NODE_ENV === "production";
  const message = isProd && status >= 500
    ? "Internal server error. Please try again later."
    : err.message || "An unexpected error occurred.";

  res.status(status).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {}),
  });
}
