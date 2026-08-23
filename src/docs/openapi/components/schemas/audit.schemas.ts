export const auditSchemas = {
  AuditLog: {
    type: "object",
    properties: {
      id: { $ref: "#/components/schemas/Uuid" },
      tenant_id: { $ref: "#/components/schemas/Uuid" },
      user_id: { $ref: "#/components/schemas/Uuid" },
      action: { $ref: "#/components/schemas/AuditAction" },
      entity_type: { type: "string" },
      entity_id: { $ref: "#/components/schemas/Uuid" },
      old_values: {},
      new_values: {},
      ip_address: { type: "string" },
      user_agent: { type: "string" },
      occurred_at: { $ref: "#/components/schemas/Timestamp" }
    }
  },
  AuditAction: {
    type: "string",
    enum: ["CREATE", "UPDATE", "DELETE", "CALCULATE", "FINALIZE", "EXPORT"]
  }
} as const;
