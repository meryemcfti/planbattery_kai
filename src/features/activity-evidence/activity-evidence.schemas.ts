import { z } from "zod";

export const activityEvidenceParamsSchema = z.object({
  tenantId: z.string().uuid(),
  activityId: z.string().uuid()
});

export const createActivityEvidenceSchema = z.object({
  evidenceType: z.enum(["INVOICE", "METER_RECORD", "ERP_EXPORT", "OTHER"]),
  originalFileName: z.string().min(1).max(255),
  storageKey: z.string().min(1).max(500),
  mimeType: z.string().max(100).optional(),
  fileSizeBytes: z.union([z.string(), z.number(), z.bigint()]).optional(),
  checksumSha256: z.string().length(64).optional(),
  uploadedByUserId: z.string().uuid()
});
