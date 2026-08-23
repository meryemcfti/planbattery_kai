export const assessmentSchemas = {
  Assessment: {
        type: "object",
        properties: {
          id: { $ref: "#/components/schemas/Uuid" },
          tenant_id: { $ref: "#/components/schemas/Uuid" },
          name: { type: "string" },
          period_start: { $ref: "#/components/schemas/DateOnly" },
          period_end: { $ref: "#/components/schemas/DateOnly" },
          status: { $ref: "#/components/schemas/AssessmentStatus" },
          created_by_user_id: { $ref: "#/components/schemas/Uuid" },
          finalized_by_user_id: { $ref: "#/components/schemas/Uuid" },
          finalized_at: { $ref: "#/components/schemas/Timestamp" },
          created_at: { $ref: "#/components/schemas/Timestamp" },
          updated_at: { $ref: "#/components/schemas/Timestamp" }
        }
      },
  CreateAssessment: {
        type: "object",
        required: ["name", "periodStart", "periodEnd", "createdByUserId"],
        properties: {
          name: { type: "string", minLength: 1, maxLength: 200 },
          periodStart: { $ref: "#/components/schemas/DateOnly" },
          periodEnd: { $ref: "#/components/schemas/DateOnly" },
          createdByUserId: { $ref: "#/components/schemas/Uuid" },
          facilityIds: {
            type: "array",
            items: { $ref: "#/components/schemas/Uuid" }
          }
        }
      },
  UpdateAssessment: {
        type: "object",
        properties: {
          name: { type: "string", minLength: 1, maxLength: 200 },
          periodStart: { $ref: "#/components/schemas/DateOnly" },
          periodEnd: { $ref: "#/components/schemas/DateOnly" },
          status: { $ref: "#/components/schemas/AssessmentStatus" },
          finalizedByUserId: { $ref: "#/components/schemas/Uuid" }
        }
      },
  AttachFacilities: {
        type: "object",
        required: ["facilityIds"],
        properties: {
          facilityIds: {
            type: "array",
            minItems: 1,
            items: { $ref: "#/components/schemas/Uuid" }
          }
        }
      },
  AssessmentStatus: {
        type: "string",
        enum: ["DRAFT", "ACTIVE", "FINALIZED", "ARCHIVED"]
      }
} as const;
