export const tenantSchemas = {
  Tenant: {
        type: "object",
        properties: {
          id: { $ref: "#/components/schemas/Uuid" },
          name: { type: "string" },
          legal_name: { type: "string" },
          slug: { type: "string" },
          tax_number: { type: "string" },
          country_code: { type: "string" },
          is_active: { type: "boolean" },
          created_at: { $ref: "#/components/schemas/Timestamp" },
          updated_at: { $ref: "#/components/schemas/Timestamp" }
        }
      },
  CreateTenant: {
        type: "object",
        required: ["name", "slug"],
        properties: {
          name: { type: "string", minLength: 1, maxLength: 200 },
          legalName: { type: "string", maxLength: 255 },
          slug: { type: "string", minLength: 2, maxLength: 120 },
          taxNumber: { type: "string", maxLength: 50 },
          countryCode: { type: "string", minLength: 2, maxLength: 2 }
        }
      },
  UpdateTenant: {
        type: "object",
        properties: {
          name: { type: "string", minLength: 1, maxLength: 200 },
          legalName: { type: "string", maxLength: 255 },
          slug: { type: "string", minLength: 2, maxLength: 120 },
          taxNumber: { type: "string", maxLength: 50 },
          countryCode: { type: "string", minLength: 2, maxLength: 2 },
          isActive: { type: "boolean" }
        }
      }
} as const;
