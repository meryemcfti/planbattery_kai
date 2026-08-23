import type { IncomingMessage, ServerResponse } from "node:http";
import crypto from "node:crypto";
import pinoHttpModule from "pino-http";

import { logger } from "../lib/logger.js";

const pinoHttp = pinoHttpModule.default ?? pinoHttpModule;

export const requestLogger = pinoHttp({
  logger,
  genReqId: (req: IncomingMessage) => {
    const requestId = req.headers["x-request-id"];

    if (Array.isArray(requestId)) {
      return requestId[0] ?? crypto.randomUUID();
    }

    return requestId ?? crypto.randomUUID();
  },
  customProps: (req: IncomingMessage) => ({
    requestId: req.id
  }),
  customSuccessMessage: (req: IncomingMessage, res: ServerResponse) =>
    `${req.method} ${req.url} completed with ${res.statusCode}`,
  customErrorMessage: (req: IncomingMessage, res: ServerResponse) =>
    `${req.method} ${req.url} failed with ${res.statusCode}`
});
