export const commonSchemas = {
  HealthResponse: {
    type: "object",
    description: "Unauthenticated process health response used by uptime and container probes.",
    properties: {
      status: { type: "string", example: "ok" },
      uptime: { type: "number", description: "Node.js process uptime in seconds." }
    },
    required: ["status", "uptime"]
  },
  StatusResponse: {
    type: "object",
    description: "Public API status response for lightweight service discovery checks.",
    properties: {
      service: { type: "string", example: "kai-backend" },
      status: { type: "string", example: "running" }
    },
    required: ["service", "status"]
  },
  ErrorResponse: {
    type: "object",
    description:
      "Standard error envelope returned by validation, authorization, conflict, not found, and internal error handlers.",
    properties: {
      code: {
        type: "string",
        description: "Stable machine-readable error code from the backend error catalogue.",
        example: "VALIDATION_FAILED"
      },
      message: {
        type: "string",
        description: "Human-readable error message safe to show in clients."
      },
      details: {
        description: "Optional structured validation or diagnostic details."
      },
      requestId: {
        type: "string",
        description: "Correlation id also returned in the x-request-id response header."
      }
    },
    required: ["code", "message"]
  },
  StandardErrorResponse: {
    $ref: "#/components/schemas/ErrorResponse"
  },
  Uuid: {
    type: "string",
    format: "uuid",
    description: "Canonical UUID identifier."
  },
  Timestamp: {
    type: "string",
    format: "date-time",
    description: "ISO 8601 timestamp."
  },
  DateOnly: {
    type: "string",
    format: "date",
    description: "Calendar date without time."
  },
  Decimal: {
    description: "Decimal value returned by Prisma as a string in persisted records and accepted as string or number in requests.",
    oneOf: [{ type: "string" }, { type: "number" }]
  },
  SetActiveStatus: {
    type: "object",
    description: "Shared payload for activating or deactivating reference data records.",
    required: ["isActive"],
    properties: {
      isActive: { type: "boolean" }
    }
  }
} as const;
