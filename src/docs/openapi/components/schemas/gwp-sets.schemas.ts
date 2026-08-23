export const gwpSetSchemas = {
  GwpSet: {
        type: "object",
        properties: {
          id: { $ref: "#/components/schemas/Uuid" },
          name: { type: "string" },
          publisher: { type: "string" },
          version: { type: "string" },
          publication_year: { type: "integer" },
          source_reference: { type: "string" },
          is_active: { type: "boolean" }
        }
      },
  CreateGwpSet: {
        type: "object",
        required: ["name", "publisher", "version", "values"],
        properties: {
          name: { type: "string", minLength: 1, maxLength: 100 },
          publisher: { type: "string", minLength: 1, maxLength: 150 },
          version: { type: "string", minLength: 1, maxLength: 50 },
          publicationYear: { type: "integer", minimum: 1900 },
          sourceReference: { type: "string", maxLength: 500 },
          values: {
            type: "array",
            minItems: 1,
            items: { $ref: "#/components/schemas/GwpValueInput" }
          }
        }
      },
  GwpValueInput: {
        type: "object",
        required: ["gas", "gwpValue"],
        properties: {
          gas: { $ref: "#/components/schemas/GasType" },
          gwpValue: { $ref: "#/components/schemas/Decimal" }
        }
      }
} as const;
