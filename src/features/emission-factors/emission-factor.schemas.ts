import { z } from "zod";

export const emissionFactorSourceParamsSchema = z.object({
  sourceId: z.string().uuid()
});

export const emissionFactorParamsSchema = z.object({
  factorId: z.string().uuid()
});

export const createEmissionFactorSourceSchema = z
  .object({
    name: z.string().min(1).max(200),
    publisher: z.string().min(1).max(200),
    publicationYear: z.number().int().min(1900),
    version: z.string().max(100).optional(),
    sourceUrl: z.string().url().max(1000).optional(),
    documentReference: z.string().max(500).optional(),
    validFrom: z.coerce.date().optional(),
    validTo: z.coerce.date().optional()
  })
  .refine(
    (input) => !input.validFrom || !input.validTo || input.validTo >= input.validFrom,
    {
      message: "validTo must be greater than or equal to validFrom",
      path: ["validTo"]
    }
  );

export const createEmissionFactorSchema = z
  .object({
    sourceId: z.string().uuid(),
    activityName: z.string().min(1).max(150),
    scope: z.enum(["SCOPE_1", "SCOPE_2", "SCOPE_3"]),
    category: z.enum(["STATIONARY_COMBUSTION"]),
    countryCode: z.string().length(2).optional(),
    inputUnitId: z.string().uuid(),
    validFrom: z.coerce.date().optional(),
    validTo: z.coerce.date().optional(),
    components: z
      .array(
        z.object({
          gas: z.enum(["CO2", "CH4", "N2O"]),
          factorValue: z.union([z.string(), z.number()]),
          factorUnit: z.string().min(1).max(120)
        })
      )
      .min(1)
  })
  .refine(
    (input) => !input.validFrom || !input.validTo || input.validTo >= input.validFrom,
    {
      message: "validTo must be greater than or equal to validFrom",
      path: ["validTo"]
    }
  );

export const updateEmissionFactorStatusSchema = z.object({
  isActive: z.boolean()
});
