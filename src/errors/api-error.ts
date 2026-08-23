import { ErrorCode } from "./error-code.js";
import type { ErrorCode as ErrorCodeType } from "./error-code.js";

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details?: unknown,
    public readonly code: ErrorCodeType = ErrorCode.INTERNAL_SERVER_ERROR
  ) {
    super(message);
  }
}
