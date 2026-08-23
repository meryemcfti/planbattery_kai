import type { ErrorRequestHandler } from "express";
import { Prisma } from "@prisma/client";

import { ApiError } from "../errors/api-error.js";
import { ErrorCode } from "../errors/error-code.js";
import { logger } from "../lib/logger.js";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ApiError) {
    res.status(error.statusCode).json({
      code: error.code,
      message: error.message,
      details: error.details,
      requestId: _req.requestId
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      res.status(409).json({
        code: ErrorCode.DATABASE_UNIQUE_CONSTRAINT,
        message: "Unique constraint violation",
        details: error.meta,
        requestId: _req.requestId
      });
      return;
    }

    if (error.code === "P2025") {
      res.status(404).json({
        code: ErrorCode.DATABASE_RECORD_NOT_FOUND,
        message: "Record not found",
        requestId: _req.requestId
      });
      return;
    }
  }

  logger.error(
    {
      err: error,
      requestId: _req.requestId,
      method: _req.method,
      path: _req.originalUrl
    },
    "Unhandled request error"
  );

  res.status(500).json({
    code: ErrorCode.INTERNAL_SERVER_ERROR,
    message: "Internal server error",
    requestId: _req.requestId
  });
};
