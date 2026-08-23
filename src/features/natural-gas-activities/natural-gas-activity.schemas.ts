import { z } from "zod";

export const naturalGasActivityParamsSchema = z.object({
  tenantId: z.string().uuid(),
  activityId: z.string().uuid().optional()
});

const naturalGasActivityBaseSchema = z.object({
    assessmentId: z.string().uuid(),
    facilityId: z.string().uuid(),
    periodStart: z.coerce.date(),
    periodEnd: z.coerce.date(),
    consumptionValue: z.union([z.string(), z.number()]),
    unitId: z.string().uuid(),
    sourceType: z.enum(["MANUAL", "INVOICE", "METER", "ERP", "OTHER"]),
    sourceReference: z.string().max(255).optional(),
    invoiceNumber: z.string().max(100).optional(),
    supplierName: z.string().max(200).optional(),
    meterNumber: z.string().max(100).optional(),
    notes: z.string().optional(),
    enteredByUserId: z.string().uuid()
  });

export const createNaturalGasActivitySchema = naturalGasActivityBaseSchema
  .refine((input) => input.periodEnd >= input.periodStart, {
    message: "periodEnd must be greater than or equal to periodStart",
    path: ["periodEnd"]
  });

export const updateNaturalGasActivitySchema = naturalGasActivityBaseSchema
  .omit({ enteredByUserId: true })
  .partial()
  .extend({
    status: z.enum(["DRAFT", "VALIDATED", "CALCULATED"]).optional()
  });

export const validateNaturalGasActivitySchema = z.object({
  validatedByUserId: z.string().uuid()
});
