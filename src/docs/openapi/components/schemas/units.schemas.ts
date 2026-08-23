export const unitSchemas = {
  Unit: {
        type: "object",
        properties: {
          id: { $ref: "#/components/schemas/Uuid" },
          code: { type: "string" },
          name: { type: "string" },
          symbol: { type: "string" },
          dimension: { type: "string" },
          is_active: { type: "boolean" }
        }
      },
  CreateUnit: {
        type: "object",
        required: ["code", "name", "symbol", "dimension"],
        properties: {
          code: { type: "string", minLength: 1, maxLength: 30 },
          name: { type: "string", minLength: 1, maxLength: 100 },
          symbol: { type: "string", minLength: 1, maxLength: 30 },
          dimension: { type: "string", minLength: 1, maxLength: 50 }
        }
      },
  UpdateUnit: {
        type: "object",
        properties: {
          code: { type: "string", minLength: 1, maxLength: 30 },
          name: { type: "string", minLength: 1, maxLength: 100 },
          symbol: { type: "string", minLength: 1, maxLength: 30 },
          dimension: { type: "string", minLength: 1, maxLength: 50 },
          isActive: { type: "boolean" }
        }
      }
} as const;
