import { z } from "zod";

export const gwpSetParamsSchema = z.object({
  gwpSetId: z.string().uuid()
});

export const createGwpSetSchema = z.object({
  name: z.string().min(1).max(100),
  publisher: z.string().min(1).max(150),
  version: z.string().min(1).max(50),
  publicationYear: z.number().int().min(1900).optional(),
  sourceReference: z.string().max(500).optional(),
  values: z
    .array(
      z.object({
        gas: z.enum(["CO2", "CH4", "N2O"]),
        gwpValue: z.union([z.string(), z.number()])
      })
    )
    .min(1)
});

export const updateGwpSetStatusSchema = z.object({
  isActive: z.boolean()
});
