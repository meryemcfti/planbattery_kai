import cors from "cors";
import express from "express";
import helmet from "helmet";

import { env } from "./config/env.js";
import { swaggerRouter } from "./docs/swagger.js";
import { errorHandler } from "./middlewares/error-handler.js";
import { notFoundHandler } from "./middlewares/not-found-handler.js";
import { requestContext } from "./middlewares/request-context.js";
import { requestLogger } from "./middlewares/request-logger.js";
import { apiRouter } from "./routes/index.js";

export const createApp = () => {
  const app = express();

  app.use(requestContext);
  app.use(requestLogger);
  app.use("/api", swaggerRouter);
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN === "*" ? true : env.CORS_ORIGIN
    })
  );
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.status(200).json({
      status: "ok",
      uptime: process.uptime()
    });
  });

  app.use("/api/v1", apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
