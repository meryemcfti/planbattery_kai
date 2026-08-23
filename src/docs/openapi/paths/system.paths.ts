export const systemPaths = {
  "/health": {
      get: {
        tags: ["System"],
        summary: "Health check",
        description:
          "Returns process health without authentication. Intended for uptime probes and local readiness checks.",
        security: [],
        responses: {
          "200": {
            description: "Service health",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/HealthResponse" }
              }
            }
          }
        }
      }
    },
  "/api/v1/status": {
      get: {
        tags: ["System"],
        summary: "API status",
        description:
          "Returns a lightweight public status payload that confirms the API process is reachable.",
        security: [],
        responses: {
          "200": {
            description: "API status",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/StatusResponse" }
              }
            }
          }
        }
      }
    }
} as const;
