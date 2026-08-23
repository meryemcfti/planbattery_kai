export const emissionFactorSchemas = {
  EmissionFactorSource: {
        type: "object",
        properties: {
          id: { $ref: "#/components/schemas/Uuid" },
          name: { type: "string" },
          publisher: { type: "string" },
          publication_year: { type: "integer" },
          version: { type: "string" },
          source_url: { type: "string" },
          document_reference: { type: "string" },
          valid_from: { $ref: "#/components/schemas/DateOnly" },
          valid_to: { $ref: "#/components/schemas/DateOnly" }
        }
      },
  CreateEmissionFactorSource: {
        type: "object",
        required: ["name", "publisher", "publicationYear"],
        properties: {
          name: { type: "string", minLength: 1, maxLength: 200 },
          publisher: { type: "string", minLength: 1, maxLength: 200 },
          publicationYear: { type: "integer", minimum: 1900 },
          version: { type: "string", maxLength: 100 },
          sourceUrl: { type: "string", format: "uri", maxLength: 1000 },
          documentReference: { type: "string", maxLength: 500 },
          validFrom: { $ref: "#/components/schemas/DateOnly" },
          validTo: { $ref: "#/components/schemas/DateOnly" }
        }
      },
  EmissionFactor: {
        type: "object",
        properties: {
          id: { $ref: "#/components/schemas/Uuid" },
          source_id: { $ref: "#/components/schemas/Uuid" },
          activity_name: { type: "string" },
          scope: { $ref: "#/components/schemas/ScopeType" },
          category: { $ref: "#/components/schemas/EmissionCategory" },
          country_code: { type: "string" },
          input_unit_id: { $ref: "#/components/schemas/Uuid" },
          is_active: { type: "boolean" }
        }
      },
  CreateEmissionFactor: {
        type: "object",
        description:
          "Emission factor definition with gas-specific components. For MVP1 natural gas calculation, use SCOPE_1 and STATIONARY_COMBUSTION.",
        required: [
          "sourceId",
          "activityName",
          "scope",
          "category",
          "inputUnitId",
          "components"
        ],
        properties: {
          sourceId: { $ref: "#/components/schemas/Uuid" },
          activityName: { type: "string", minLength: 1, maxLength: 150 },
          scope: { $ref: "#/components/schemas/ScopeType" },
          category: { $ref: "#/components/schemas/EmissionCategory" },
          countryCode: { type: "string", minLength: 2, maxLength: 2 },
          inputUnitId: { $ref: "#/components/schemas/Uuid" },
          validFrom: { $ref: "#/components/schemas/DateOnly" },
          validTo: { $ref: "#/components/schemas/DateOnly" },
          components: {
            type: "array",
            minItems: 1,
            items: { $ref: "#/components/schemas/EmissionFactorComponentInput" }
          }
        }
      },
  EmissionFactorComponentInput: {
        type: "object",
        description:
          "Gas-specific factor value. CO2 is required by the calculation engine; CH4 and N2O are optional but supported.",
        required: ["gas", "factorValue", "factorUnit"],
        properties: {
          gas: { $ref: "#/components/schemas/GasType" },
          factorValue: { $ref: "#/components/schemas/Decimal" },
          factorUnit: { type: "string", minLength: 1, maxLength: 120 }
        }
      },
  ScopeType: {
        type: "string",
        enum: ["SCOPE_1", "SCOPE_2", "SCOPE_3"]
      },
  EmissionCategory: {
        type: "string",
        enum: ["STATIONARY_COMBUSTION"]
      },
  GasType: {
        type: "string",
        enum: ["CO2", "CH4", "N2O"]
      }
} as const;
