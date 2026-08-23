export const membershipSchemas = {
  TenantMembership: {
        type: "object",
        properties: {
          id: { $ref: "#/components/schemas/Uuid" },
          tenant_id: { $ref: "#/components/schemas/Uuid" },
          user_id: { $ref: "#/components/schemas/Uuid" },
          role: { $ref: "#/components/schemas/TenantRole" },
          is_active: { type: "boolean" },
          created_at: { $ref: "#/components/schemas/Timestamp" },
          updated_at: { $ref: "#/components/schemas/Timestamp" }
        }
      },
  CreateTenantMembership: {
        type: "object",
        required: ["userId", "role"],
        properties: {
          userId: { $ref: "#/components/schemas/Uuid" },
          role: { $ref: "#/components/schemas/TenantRole" }
        }
      },
  UpdateTenantMembership: {
        type: "object",
        properties: {
          role: { $ref: "#/components/schemas/TenantRole" },
          isActive: { type: "boolean" }
        }
      },
  TenantRole: {
        type: "string",
        enum: ["COMPANY_ADMIN", "DATA_ENTRY", "VIEWER"]
      }
} as const;
