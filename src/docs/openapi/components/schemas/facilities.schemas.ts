export const facilitySchemas = {
  Facility: {
        type: "object",
        properties: {
          id: { $ref: "#/components/schemas/Uuid" },
          tenant_id: { $ref: "#/components/schemas/Uuid" },
          name: { type: "string" },
          code: { type: "string" },
          country_code: { type: "string" },
          city: { type: "string" },
          district: { type: "string" },
          address: { type: "string" },
          is_active: { type: "boolean" },
          created_at: { $ref: "#/components/schemas/Timestamp" },
          updated_at: { $ref: "#/components/schemas/Timestamp" }
        }
      },
  CreateFacility: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string", minLength: 1, maxLength: 200 },
          code: { type: "string", maxLength: 50 },
          countryCode: { type: "string", minLength: 2, maxLength: 2 },
          city: { type: "string", maxLength: 120 },
          district: { type: "string", maxLength: 120 },
          address: { type: "string" }
        }
      },
  UpdateFacility: {
        type: "object",
        properties: {
          name: { type: "string", minLength: 1, maxLength: 200 },
          code: { type: "string", maxLength: 50 },
          countryCode: { type: "string", minLength: 2, maxLength: 2 },
          city: { type: "string", maxLength: 120 },
          district: { type: "string", maxLength: 120 },
          address: { type: "string" },
          isActive: { type: "boolean" }
        }
      }
} as const;
