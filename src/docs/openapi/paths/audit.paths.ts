import { collectionResponse, errorResponses, uuidParam } from "../helpers.js";

export const auditPaths = {
  "/api/v1/tenants/{tenantId}/audit-logs": {
    get: {
      tags: ["Audit"],
      summary: "List tenant audit logs",
      description:
        "Lists tenant-scoped audit records. Audit logs capture business actions and old/new values; backend request logs are emitted separately as structured operational logs.",
      parameters: [uuidParam("tenantId")],
      responses: {
        "200": collectionResponse("#/components/schemas/AuditLog"),
        ...errorResponses
      }
    }
  }
} as const;
