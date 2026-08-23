import type { Request } from "express";

import { ApiError } from "../errors/api-error.js";
import { ErrorCode } from "../errors/error-code.js";

export const getRequiredParam = (req: Request, name: string) => {
  const value = req.params[name];

  if (typeof value !== "string") {
    throw new ApiError(
      400,
      `Missing route parameter: ${name}`,
      undefined,
      ErrorCode.VALIDATION_FAILED
    );
  }

  return value;
};
