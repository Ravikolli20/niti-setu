// server/src/middleware/errorHandler.ts
import type { Request, Response, NextFunction } from "express";

interface HttpError extends Error {
  status?: number;
}

export function errorHandler(err: HttpError, req: Request, res: Response, next: NextFunction): void {
  console.error("❌ Server error:", err.stack || err.message);

  const status  = err.status || 500;
  const message = err.message || "Internal server error";

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
}

export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
