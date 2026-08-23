export const calculationSchemas = {
  CalculationRun: {
        type: "object",
        properties: {
          id: { $ref: "#/components/schemas/Uuid" },
          tenant_id: { $ref: "#/components/schemas/Uuid" },
          assessment_id: { $ref: "#/components/schemas/Uuid" },
          natural_gas_activity_id: { $ref: "#/components/schemas/Uuid" },
          emission_factor_id: { $ref: "#/components/schemas/Uuid" },
          gwp_set_id: { $ref: "#/components/schemas/Uuid" },
          calculation_engine_version: { type: "string" },
          status: { $ref: "#/components/schemas/CalculationStatus" },
          error_message: { type: "string" },
          calculated_at: { $ref: "#/components/schemas/Timestamp" },
          created_at: { $ref: "#/components/schemas/Timestamp" }
        }
      },
  CreateCalculationRun: {
        type: "object",
        description:
          "Calculation request for a validated natural gas activity. The selected factor and GWP set are snapshotted with the result.",
        required: ["naturalGasActivityId", "emissionFactorId", "gwpSetId"],
        properties: {
          naturalGasActivityId: {
            description: "Validated activity to calculate.",
            $ref: "#/components/schemas/Uuid"
          },
          emissionFactorId: {
            description: "Active SCOPE_1 STATIONARY_COMBUSTION emission factor.",
            $ref: "#/components/schemas/Uuid"
          },
          gwpSetId: {
            description: "Active GWP set used for CO2e conversion.",
            $ref: "#/components/schemas/Uuid"
          },
          initiatedByUserId: { $ref: "#/components/schemas/Uuid" }
        }
      },
  CalculationStatus: {
        type: "string",
        enum: ["PENDING", "SUCCESS", "FAILED"]
      }
} as const;
