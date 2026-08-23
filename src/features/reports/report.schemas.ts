import { z } from "zod";

export const reportParamsSchema = z.object({
  tenantId: z.string().uuid(),
  assessmentId: z.string().uuid()
});

export const createReportSchema = z.object({
  fileName: z.string().max(255).optional(),
  storageKey: z.string().max(500).optional(),
  generatedByUserId: z.string().uuid().optional()
});
