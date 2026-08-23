export const evidenceSchemas = {
  ActivityEvidence: {
    type: "object",
    properties: {
      id: { $ref: "#/components/schemas/Uuid" },
      tenant_id: { $ref: "#/components/schemas/Uuid" },
      natural_gas_activity_id: { $ref: "#/components/schemas/Uuid" },
      evidence_type: { $ref: "#/components/schemas/EvidenceType" },
      original_file_name: { type: "string" },
      storage_key: { type: "string" },
      mime_type: { type: "string" },
      file_size_bytes: { oneOf: [{ type: "string" }, { type: "integer" }] },
      checksum_sha256: { type: "string" },
      uploaded_by_user_id: { $ref: "#/components/schemas/Uuid" },
      created_at: { $ref: "#/components/schemas/Timestamp" }
    }
  },
  CreateActivityEvidence: {
    type: "object",
    description:
      "Evidence metadata for an activity. Binary file upload is handled outside this API; storageKey stores the object reference.",
    required: ["evidenceType", "originalFileName", "storageKey", "uploadedByUserId"],
    properties: {
      evidenceType: { $ref: "#/components/schemas/EvidenceType" },
      originalFileName: { type: "string", minLength: 1, maxLength: 255 },
      storageKey: { type: "string", minLength: 1, maxLength: 500 },
      mimeType: { type: "string", maxLength: 100 },
      fileSizeBytes: { oneOf: [{ type: "string" }, { type: "integer" }] },
      checksumSha256: { type: "string", minLength: 64, maxLength: 64 },
      uploadedByUserId: { $ref: "#/components/schemas/Uuid" }
    }
  },
  EvidenceType: {
    type: "string",
    enum: ["INVOICE", "METER_RECORD", "ERP_EXPORT", "OTHER"]
  }
} as const;
