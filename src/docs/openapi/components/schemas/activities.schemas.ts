export const activitySchemas = {
  NaturalGasActivity: {
        type: "object",
        properties: {
          id: { $ref: "#/components/schemas/Uuid" },
          tenant_id: { $ref: "#/components/schemas/Uuid" },
          assessment_id: { $ref: "#/components/schemas/Uuid" },
          facility_id: { $ref: "#/components/schemas/Uuid" },
          period_start: { $ref: "#/components/schemas/DateOnly" },
          period_end: { $ref: "#/components/schemas/DateOnly" },
          consumption_value: { $ref: "#/components/schemas/Decimal" },
          unit_id: { $ref: "#/components/schemas/Uuid" },
          source_type: { $ref: "#/components/schemas/DataSourceType" },
          status: { $ref: "#/components/schemas/ActivityStatus" },
          entered_by_user_id: { $ref: "#/components/schemas/Uuid" },
          validated_by_user_id: { $ref: "#/components/schemas/Uuid" },
          validated_at: { $ref: "#/components/schemas/Timestamp" },
          created_at: { $ref: "#/components/schemas/Timestamp" },
          updated_at: { $ref: "#/components/schemas/Timestamp" }
        }
      },
  CreateNaturalGasActivity: {
        type: "object",
        description:
          "Natural gas consumption input captured for one tenant assessment and facility.",
        required: [
          "assessmentId",
          "facilityId",
          "periodStart",
          "periodEnd",
          "consumptionValue",
          "unitId",
          "sourceType",
          "enteredByUserId"
        ],
        properties: {
          assessmentId: {
            description: "Tenant assessment period that owns this activity.",
            $ref: "#/components/schemas/Uuid"
          },
          facilityId: {
            description: "Tenant facility where consumption occurred.",
            $ref: "#/components/schemas/Uuid"
          },
          periodStart: { $ref: "#/components/schemas/DateOnly" },
          periodEnd: { $ref: "#/components/schemas/DateOnly" },
          consumptionValue: {
            description: "Consumption quantity in the selected unit.",
            $ref: "#/components/schemas/Decimal"
          },
          unitId: {
            description: "Unit used by the activity. It must match the selected emission factor input unit for calculation.",
            $ref: "#/components/schemas/Uuid"
          },
          sourceType: { $ref: "#/components/schemas/DataSourceType" },
          sourceReference: { type: "string", maxLength: 255 },
          invoiceNumber: { type: "string", maxLength: 100 },
          supplierName: { type: "string", maxLength: 200 },
          meterNumber: { type: "string", maxLength: 100 },
          notes: { type: "string" },
          enteredByUserId: { $ref: "#/components/schemas/Uuid" }
        }
      },
  UpdateNaturalGasActivity: {
        type: "object",
        properties: {
          assessmentId: { $ref: "#/components/schemas/Uuid" },
          facilityId: { $ref: "#/components/schemas/Uuid" },
          periodStart: { $ref: "#/components/schemas/DateOnly" },
          periodEnd: { $ref: "#/components/schemas/DateOnly" },
          consumptionValue: { $ref: "#/components/schemas/Decimal" },
          unitId: { $ref: "#/components/schemas/Uuid" },
          sourceType: { $ref: "#/components/schemas/DataSourceType" },
          sourceReference: { type: "string", maxLength: 255 },
          invoiceNumber: { type: "string", maxLength: 100 },
          supplierName: { type: "string", maxLength: 200 },
          meterNumber: { type: "string", maxLength: 100 },
          notes: { type: "string" },
          status: { $ref: "#/components/schemas/ActivityStatus" }
        }
      },
  ValidateNaturalGasActivity: {
        type: "object",
        required: ["validatedByUserId"],
        properties: {
          validatedByUserId: { $ref: "#/components/schemas/Uuid" }
        }
      },
  ActivityStatus: {
        type: "string",
        enum: ["DRAFT", "VALIDATED", "CALCULATED"]
      },
  DataSourceType: {
        type: "string",
        enum: ["MANUAL", "INVOICE", "METER", "ERP", "OTHER"]
      }
} as const;
