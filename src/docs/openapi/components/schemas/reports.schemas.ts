export const reportSchemas = {
  Report: {
    type: "object",
    properties: {
      id: { $ref: "#/components/schemas/Uuid" },
      tenant_id: { $ref: "#/components/schemas/Uuid" },
      assessment_id: { $ref: "#/components/schemas/Uuid" },
      status: { $ref: "#/components/schemas/ReportStatus" },
      report_version: { type: "integer" },
      file_name: { type: "string" },
      storage_key: { type: "string" },
      generated_by_user_id: { $ref: "#/components/schemas/Uuid" },
      generated_at: { $ref: "#/components/schemas/Timestamp" },
      created_at: { $ref: "#/components/schemas/Timestamp" }
    }
  },
  CreateReport: {
    type: "object",
    description:
      "Creates a versioned report record. Provide fileName and storageKey when a generated report file already exists.",
    properties: {
      fileName: { type: "string", maxLength: 255 },
      storageKey: { type: "string", maxLength: 500 },
      generatedByUserId: { $ref: "#/components/schemas/Uuid" }
    }
  },
  ReportStatus: {
    type: "string",
    enum: ["GENERATING", "READY", "FAILED"]
  }
} as const;
