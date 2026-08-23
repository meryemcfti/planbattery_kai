import type { RequestHandler } from "express";
import type { ZodTypeAny } from "zod";
import { z } from "zod";

import { ApiError } from "../errors/api-error.js";
import { ErrorCode } from "../errors/error-code.js";

type RequestSchemas = {
  body?: ZodTypeAny;
  params?: ZodTypeAny;
  query?: ZodTypeAny;
};

export const validate =
  (schemas: RequestSchemas): RequestHandler =>
  (req, _res, next) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }

      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }

      if (schemas.query) {
        req.query = schemas.query.parse(req.query);
      }

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        next(
          new ApiError(
            400,
            "Validation failed",
            error.flatten(),
            ErrorCode.VALIDATION_FAILED
          )
        );
        return;
      }

      next(error);
    }
  };
