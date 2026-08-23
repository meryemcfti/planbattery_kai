import { z } from "zod";

export const calculationTenantParamsSchema = z.object({
  tenantId: z.string().uuid()
});

export const calculationRunParamsSchema = z.object({
  tenantId: z.string().uuid(),
  calculationRunId: z.string().uuid()
});

export const createCalculationRunSchema = z.object({
  naturalGasActivityId: z.string().uuid(),
  emissionFactorId: z.string().uuid(),
  gwpSetId: z.string().uuid(),
  initiatedByUserId: z.string().uuid().optional()
});
