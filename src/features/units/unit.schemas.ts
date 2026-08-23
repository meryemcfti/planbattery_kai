import { z } from "zod";

export const unitParamsSchema = z.object({
  unitId: z.string().uuid()
});

export const createUnitSchema = z.object({
  code: z.string().min(1).max(30),
  name: z.string().min(1).max(100),
  symbol: z.string().min(1).max(30),
  dimension: z.string().min(1).max(50)
});

export const updateUnitSchema = createUnitSchema.partial().extend({
  isActive: z.boolean().optional()
});
